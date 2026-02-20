"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, Upload, Camera, Check, RefreshCcw, Smartphone, Shirt, Loader2, Trash2, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { set as idbSet, get as idbGet } from "idb-keyval";
import { QRCodeSVG } from "qrcode.react";

interface Product {
    id: string;
    name: string;
    price: string;
    category?: string;
    description?: string;
    image: string;
}

interface TryOnModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    initialUserImage?: string | null;
}

export function TryOnModal({ isOpen, onClose, product, initialUserImage }: TryOnModalProps) {
    const [userImage, setUserImage] = useState<string | null>(initialUserImage || null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingTime, setProcessingTime] = useState(0);
    const [isDemoResult, setIsDemoResult] = useState(false);
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [savedPhotos, setSavedPhotos] = useState<(string | null)[]>([null, null, null, null]);

    const [showMobileConnect, setShowMobileConnect] = useState(false);
    const [serverIp, setServerIp] = useState("192.168.0.108");
    const [publicUrl, setPublicUrl] = useState("https://vto-shopping-mall-final.netlify.app");
    const [copySuccess, setCopySuccess] = useState(false);

    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const nativeCameraInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (isOpen && product) {
            if (initialUserImage) {
                setUserImage(initialUserImage);
            }

            idbGet("my-tryon-photos").then(raw => {
                if (raw) setSavedPhotos(raw);
            });

            setIsDemoResult(false);
            setScale(1);
            setRotation(0);
            setIsSaved(false);
            setErrorMsg(null);
        }
    }, [isOpen, product, initialUserImage]);

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setIsCameraOpen(false);
    };

    const handleStartCamera = async () => {
        const isSecure = window.isSecureContext;
        if (isSecure && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user" }
                });
                setCameraStream(stream);
                setIsCameraOpen(true);
            } catch (err) {
                nativeCameraInputRef.current?.click();
            }
        } else {
            nativeCameraInputRef.current?.click();
        }
    };

    const processImage = async (imageDataUrl: string) => {
        setUserImage(imageDataUrl);
        setIsDemoResult(false);
        setErrorMsg(null);
        // [PREMIUM UX] Auto-trigger AI Fitting immediately on selection
        setTimeout(() => {
            handleTryOnExplicit(imageDataUrl);
        }, 500);
    };

    const handleTryOnExplicit = async (img: string) => {
        if (!img || !product || isProcessing) return;
        setIsProcessing(true);
        setProcessingTime(0);
        setErrorMsg(null);

        const timerInterval = setInterval(() => setProcessingTime(prev => prev + 1), 1000);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000);

        try {
            const response = await fetch('/api/try-on', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userImage: img,
                    product: {
                        image: product.image,
                        name: product.name,
                        category: product.category,
                        description: product.description
                    }
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Server Error (${response.status})`);
            }

            const result = await response.json();
            if (result.success && result.image) {
                setUserImage(result.image);
                setIsDemoResult(true);
            } else {
                throw new Error(result.error || "Failed to generate fitting.");
            }
        } catch (error: any) {
            setErrorMsg(error.name === 'AbortError' ? "요청 시간이 초과되었습니다." : (error.message || "서버 통신 오류"));
        } finally {
            clearInterval(timerInterval);
            setIsProcessing(false);
            setProcessingTime(0);
        }
    };

    const handleCapturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");
            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageDataUrl = canvas.toDataURL("image/jpeg");
                processImage(imageDataUrl);
                stopCamera();
            }
        }
    };

    const saveToIndexedDB = async (imageDataUrl: string) => {
        try {
            const raw = await idbGet("my-tryon-photos");
            let saved = raw ? raw : [null, null, null, null];
            if (!Array.isArray(saved)) saved = [null, null, null, null];

            if (saved.includes(imageDataUrl)) return;

            const currentPhotos = saved.filter((p: any) => p && typeof p === 'string');
            const newPhotos = [imageDataUrl, ...currentPhotos].slice(0, 4);
            while (newPhotos.length < 4) newPhotos.push(null);

            // 우선 상태 업데이트 (UI에 즉각 반영)
            setSavedPhotos(newPhotos);
            window.dispatchEvent(new Event("tryon-storage-update"));

            // IndexedDB는 5MB 이상도 거뜬히 저장 가능하므로 원본(또는 큰 크기) 그대로 저장
            await idbSet("my-tryon-photos", newPhotos);
        } catch (err: any) {
            console.error("Failed to save try-on photo to IndexedDB", err);
        }
    };

    const handleSaveResult = async () => {
        if (!userImage || isSaved) return;

        // 1. IndexedDB를 사용하여 용량 제한 없이 원본 비트맵 보존 (색상 손실 원천 차단)
        await saveToIndexedDB(userImage);

        // 2. 갤러리(디바이스)로 실제 원본 이미지 다운로드
        try {
            const link = document.createElement('a');
            link.href = userImage; // 다운로드는 고화질 원본으로
            link.download = `tryon_result_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to download image", error);
        }

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const clearHistory = async () => {
        if (confirm("피팅 히스토리를 모두 삭제하시겠습니까?")) {
            const empty = [null, null, null, null];
            await idbSet("my-tryon-photos", empty);
            setSavedPhotos(empty);
            window.dispatchEvent(new Event("tryon-storage-update"));
        }
    };

    const deletePhoto = async (index: number) => {
        const newPhotos = [...savedPhotos];
        newPhotos[index] = null;
        await idbSet("my-tryon-photos", newPhotos);
        setSavedPhotos(newPhotos);
        window.dispatchEvent(new Event("tryon-storage-update"));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                if (result) processImage(result);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleGalleryClick = () => fileInputRef.current?.click();

    const handleReset = () => {
        setUserImage(null);
        setIsDemoResult(false);
        setIsProcessing(false);
        setErrorMsg(null);
        setScale(1);
        setRotation(0);
        stopCamera();
    };

    const handleTryOn = async () => {
        if (!userImage || !product || isProcessing) return;
        setIsProcessing(true);
        setProcessingTime(0);
        setErrorMsg(null);

        const timerInterval = setInterval(() => setProcessingTime(prev => prev + 1), 1000);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000);

        try {
            const response = await fetch('/api/try-on', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userImage: userImage,
                    product: {
                        image: product.image,
                        name: product.name,
                        category: product.category,
                        description: product.description
                    }
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Server Error (${response.status})`);
            }

            const result = await response.json();
            if (result.success && result.image) {
                setUserImage(result.image);
                setIsDemoResult(true);
            } else {
                throw new Error(result.error || "Failed to generate fitting.");
            }
        } catch (error: any) {
            setErrorMsg(error.name === 'AbortError' ? "요청 시간이 초과되었습니다." : (error.message || "서버 통신 오류"));
        } finally {
            clearInterval(timerInterval);
            setIsProcessing(false);
            setProcessingTime(0);
        }
    };

    if (!isOpen || !product) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-10 bg-black/70 backdrop-blur-md overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-4xl bg-background rounded-3xl shadow-2xl flex flex-col md:flex-row min-h-[500px] mb-10 overflow-hidden ring-1 ring-white/10"
                    >
                        {/* GLOBAL CLOSE - Always Top Right of the Modal Box */}
                        <div className="absolute top-0 right-0 left-0 h-16 pointer-events-none z-30 flex items-center justify-end px-6">
                            <button
                                onClick={onClose}
                                className="pointer-events-auto p-2.5 bg-white/80 backdrop-blur-md text-slate-900 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all border border-slate-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Mobile Connect Overlay */}
                        <AnimatePresence>
                            {showMobileConnect && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6"
                                    onClick={() => setShowMobileConnect(false)}
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        className="bg-white p-8 rounded-3xl shadow-2xl text-center space-y-4 max-w-xs pointer-events-auto"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <div className="bg-slate-50 p-4 rounded-2xl inline-block border border-slate-100">
                                            <QRCodeSVG value={publicUrl} size={180} />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(publicUrl);
                                                    setCopySuccess(true);
                                                    setTimeout(() => setCopySuccess(false), 2000);
                                                }}
                                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold border border-indigo-100 hover:bg-indigo-100 transition-all"
                                            >
                                                {copySuccess ? <Check size={16} /> : <Copy size={16} />}
                                                {copySuccess ? "Copied!" : "Copy Link for KakaoTalk"}
                                            </button>
                                            <p className="text-xs text-slate-400">Public IP: 58.141.139.210</p>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">Mobile Fitting</h3>
                                            <p className="text-sm text-slate-500 leading-relaxed">Scan this QR or share the link with friends to try on clothes anywhere!</p>
                                        </div>
                                        <button
                                            onClick={() => setShowMobileConnect(false)}
                                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold"
                                        >
                                            Got it
                                        </button>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Left: Product Info */}
                        <div className="w-full md:w-1/3 bg-secondary/30 p-8 flex flex-col justify-between">
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-serif mb-2 text-foreground">Virtual Fitting Room</h2>
                                    <div className="text-muted-foreground text-sm leading-relaxed max-w-[240px]">
                                        See how the <span className="font-bold text-indigo-600 px-1.5 py-0.5 bg-indigo-50 rounded-md inline-block my-1">{product.name}</span> looks on you.
                                    </div>
                                </div>

                                <div className="relative w-full aspect-[3/4] bg-white rounded-2xl p-4 shadow-inner border border-border/40 overflow-hidden flex items-center justify-center">
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <p className="font-medium text-lg">{product.price}</p>
                                <button className="w-full py-3 bg-foreground text-background rounded-xl font-medium hover:opacity-90">
                                    Add to Cart
                                </button>
                                <button
                                    onClick={() => setShowMobileConnect(true)}
                                    className="w-full py-3 bg-white border border-slate-200 text-slate-900 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-sm font-semibold shadow-sm active:scale-95"
                                >
                                    <Smartphone size={16} className="text-indigo-600" />
                                    <span>Mobile Connect</span>
                                </button>
                            </div>
                        </div>

                        {/* Right: Try On Area */}
                        <div className="w-full md:w-2/3 bg-background p-8 flex flex-col items-center justify-center relative min-h-[500px]">
                            {isProcessing ? (
                                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md transition-all duration-500">
                                    <div className="relative w-64 h-80 border-2 border-indigo-200 rounded-[2rem] overflow-hidden bg-slate-50/50 shadow-2xl">
                                        {/* Scanning Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 via-indigo-500/30 to-indigo-500/0 animate-[scan_2.5s_ease-in-out_infinite]"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
                                                    <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-bold text-indigo-600 tracking-wider">AI ANALYZING</p>
                                                    <p className="text-[10px] text-muted-foreground mt-1 uppercase font-semibold">Generating Masterpiece...</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <style jsx>{`
                                        @keyframes scan {
                                            0%, 100% { transform: translateY(-100%); }
                                            50% { transform: translateY(100%); }
                                        }
                                    `}</style>
                                </div>
                            ) : isCameraOpen ? (
                                <div className="relative w-full h-full flex flex-col items-center justify-center bg-black rounded-xl overflow-hidden self-stretch">
                                    <video
                                        autoPlay playsInline muted
                                        ref={(video) => {
                                            if (video && cameraStream) video.srcObject = cameraStream;
                                            // @ts-ignore
                                            videoRef.current = video;
                                        }}
                                        className="w-full h-full object-cover transform scale-x-[-1]"
                                    />
                                    <div className="absolute bottom-6 flex gap-4 z-20">
                                        <button onClick={stopCamera} className="px-6 py-2 bg-white/20 backdrop-blur-md text-white rounded-full">Cancel</button>
                                        <button onClick={handleCapturePhoto} className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-110 transition-transform">
                                            <div className="w-12 h-12 bg-white rounded-full"></div>
                                        </button>
                                    </div>
                                </div>
                            ) : !userImage ? (
                                <div className="text-center space-y-6 w-full max-w-sm">
                                    <div className="flex flex-col gap-3">
                                        <button onClick={handleStartCamera} className="w-full px-6 py-7 bg-slate-900 text-white rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-black transition-all hover:scale-[1.02] shadow-xl group">
                                            <Camera size={32} className="group-hover:scale-110 transition-transform text-yellow-400" />
                                            <span className="text-xl font-bold">Use Camera</span>
                                            <span className="text-[10px] opacity-50 uppercase tracking-[0.2em]">High Precision Capture</span>
                                        </button>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button onClick={handleGalleryClick} className="px-4 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                                                <Upload size={16} /> <span className="text-sm font-semibold">Gallery</span>
                                            </button>
                                            <button onClick={() => setShowMobileConnect(true)} className="px-4 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                                                <Smartphone size={16} /> <span className="text-sm font-semibold">Mobile</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center py-4 md:py-8 bg-slate-50/30 overflow-hidden">
                                    {/* PREMIUM RIGID 3:4 Box with Glass effect */}
                                    <div className="relative w-full max-w-[420px] max-h-[70vh] aspect-[3/4] bg-white rounded-[3rem] overflow-hidden border border-white/40 shadow-[0_40px_80px_rgba(0,0,0,0.12)] flex items-center justify-center group/image shrink-0 mx-auto ring-1 ring-black/5">
                                        <img
                                            src={userImage || undefined}
                                            alt="User"
                                            className={`w-full h-full ${isDemoResult ? 'object-contain' : 'object-cover'} object-center transition-all duration-1000`}
                                        />

                                        <button
                                            onClick={handleReset}
                                            className="absolute top-8 right-8 p-3 bg-white/70 text-slate-900 rounded-full opacity-0 group-hover/image:opacity-100 transition-all backdrop-blur-xl hover:bg-white hover:scale-110 z-50 shadow-xl"
                                        >
                                            <X size={20} />
                                        </button>

                                        {!isDemoResult && (
                                            <motion.div
                                                drag={true}
                                                dragMomentum={false}
                                                className="absolute cursor-move z-20"
                                                style={{ top: "15%", left: "50%", x: "-50%", scale: scale, rotate: rotation }}
                                            >
                                                <div className="relative w-56 h-56 drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                                                    <Image src={product.image} alt="Fitting" fill className="object-contain" />
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Subtle overlay for depth */}
                                        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(255,255,255,0.2)]"></div>
                                    </div>

                                    <div className="mt-6 flex flex-col items-center gap-4 w-full">
                                        {!isDemoResult ? (
                                            <>
                                                <div className="flex items-center gap-4 bg-white/90 p-3 rounded-2xl shadow-lg border">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-[10px] uppercase font-bold text-gray-400">Size</span>
                                                        <input type="range" min="0.5" max="2" step="0.1" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-24" />
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-[10px] uppercase font-bold text-gray-400">Tilt</span>
                                                        <input type="range" min="-45" max="45" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} className="w-24" />
                                                    </div>
                                                </div>
                                                <button onClick={handleTryOn} disabled={isProcessing} className="w-full max-w-[200px] py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors">
                                                    {isProcessing ? <Loader2 className="animate-spin mx-auto text-white" /> : "Fit It!"}
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 w-full">
                                                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full flex items-center gap-2 text-sm">
                                                    <Check size={16} /> AI Fitting Complete
                                                </div>
                                                <button onClick={handleSaveResult} className={`w-full max-w-[220px] py-4 rounded-xl font-bold shadow-lg transition-all active:scale-95 ${isSaved ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-900 text-white hover:bg-black ring-4 ring-slate-900/10'}`}>
                                                    {isSaved ? "Saved to Gallery!" : "Save to Gallery"}
                                                </button>
                                                <div className="flex items-center justify-between mb-5 px-6">
                                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em] opacity-60">Try-On History</p>
                                                    <button onClick={clearHistory} className="group flex items-center gap-1.5 text-[10px] text-red-500 hover:text-red-600 font-bold uppercase tracking-wider transition-all bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100">
                                                        <Trash2 size={12} className="group-hover:rotate-12 transition-transform" />
                                                        <span>Clear History</span>
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-4 gap-3 px-6 pb-20">
                                                    {savedPhotos.map((photo, i) => (
                                                        <div key={i} className="group/slot relative aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-200/50 hover:border-indigo-400 hover:shadow-lg transition-all">
                                                            {photo ? (
                                                                <>
                                                                    <img src={photo} alt="" className="w-full h-full object-cover cursor-pointer" onClick={() => setUserImage(photo)} />
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); deletePhoto(i); }}
                                                                        className="absolute top-1 right-1 p-1 bg-red-500/90 text-white rounded-md opacity-0 group-hover/slot:opacity-100 transition-opacity hover:bg-red-600 shadow-xl"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <button onClick={handleReset} className="text-xs text-muted-foreground underline hover:text-foreground">
                                            Try Another Photo
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <input id="gallery-upload" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} ref={fileInputRef} />
                        <input id="camera-upload" type="file" className="hidden" accept="image/*" capture="user" onChange={handleFileUpload} ref={nativeCameraInputRef} />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
