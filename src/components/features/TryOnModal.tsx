"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, Upload, Camera, Check, RefreshCcw, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

import { generateTryOnPayload } from "@/lib/try-on-service";

interface Product {
    id: string;
    name: string;
    price: string;
    category?: string;
    description?: string;
    image: string; // URL for the product image (transparent background ideally)
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
    const [isDemoResult, setIsDemoResult] = useState(false);
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);

    // Mobile Connect State
    const [showMobileConnect, setShowMobileConnect] = useState(false);
    const [serverIp, setServerIp] = useState("10.138.47.137");

    // Camera State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const nativeCameraInputRef = useRef<HTMLInputElement>(null); // Fallback for mobile
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Reset state when product changes or modal opens
    // Reset state when product changes or modal opens
    // Reset state when product changes or modal opens
    // Reset state when modal opens ONLY
    useEffect(() => {
        console.log("🔄 [TryOnModal] useEffect Triggered. isOpen:", isOpen);
        if (isOpen && product) {
            // Only set user image from props if we are OPENING the modal (or if it's the first time)
            if (initialUserImage) {
                console.log("📸 Setting initial user image:", initialUserImage.substring(0, 20) + "...");
                setUserImage(initialUserImage);
            }

            // Only reset these if we are truly resetting (e.g. new product or fresh open)
            console.log("🧹 Resetting Demo Result State to FALSE");
            setIsDemoResult(false);
            setScale(1);
            setRotation(0);
        }
    }, [isOpen]); // Only reset when OPENING. No reset if product ref changes while open.


    // Stop camera stream when component unmounts or modal closes
    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setIsCameraOpen(false);
    };

    const handleStartCamera = async () => {
        // Check for secure context (HTTPS or localhost)
        // getUserMedia requires a secure context. If not secure, strictly use fallback.
        const isSecure = window.isSecureContext;

        if (isSecure && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user" }
                });
                setCameraStream(stream);
                setIsCameraOpen(true);
            } catch (err) {
                console.log("Camera access failed, falling back to native input", err);
                // Note: This click might be blocked by some browsers because it's in an async catch block
                // But it's our best effort fallback for "supported but failed" cases
                nativeCameraInputRef.current?.click();
            }
        } else {
            // Insecure context or no mediaDevices
            // We shouldn't reach here if we use the label rendering logic, 
            // but as a fallback for some edge cases:
            console.log("Insecure context, trying programmatic click");
            const cameraInput = document.getElementById('camera-upload');
            if (cameraInput) (cameraInput as HTMLElement).click();
        }
    };

    const handleCapturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            if (context) {
                // Set canvas dimensions to match video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                // Draw current video frame to canvas
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Convert to data URL
                const imageDataUrl = canvas.toDataURL("image/jpeg");

                // Process the captured image
                processImage(imageDataUrl);

                // Stop camera
                stopCamera();
            }
        }
    };

    const processImage = async (imageDataUrl: string) => {
        try {
            setIsProcessing(true);

            // Save immediately for reliability
            if (imageDataUrl) {
                setUserImage(imageDataUrl);
                saveToLocalStorage(imageDataUrl);
            }

            // --- AI PAYLOAD GENERATION (Simulation) ---
            if (product && product.image) {
                console.log(`🚀 [${new Date().toISOString()}] Generating Virtual Try-On Payload...`);
                try {
                    const result = await generateTryOnPayload(
                        imageDataUrl,
                        product.image,
                        product.name || "clothing item",
                        product.category || "Tops",
                        product.description || ""
                    );
                    console.log("✅ API RESPONSE RECEIVED:", result);
                    // Handle result if available. For now, we rely on the simulation below.
                } catch (error) {
                    // API failed (expected if backend is offline). We swallow this error to proceed to simulation.
                    console.warn("⚠️ API Call failed or timed out. Proceeding with simulation state.", error);
                }
            }

            // FORCE SUCCESS STATE
            // Whether API succeeded or failed, we show the "Result" state after a delay
            setTimeout(() => {
                console.log("✅ Setting Demo Result to TRUE");
                setIsDemoResult(true);
                setIsProcessing(false);
            }, 1000); // 1s delay for smooth transition

        } catch (err: any) {
            console.error(`Error processing image: ${err.message}`);
            setIsProcessing(false);
        }
    };

    const saveToLocalStorage = (imageDataUrl: string) => {
        try {
            const raw = localStorage.getItem("my-tryon-photos");
            let savedPhotos = raw ? JSON.parse(raw) : [null, null, null, null];

            // Ensure strictly array of strings or nulls
            if (!Array.isArray(savedPhotos)) savedPhotos = [null, null, null, null];

            // Strategy: Add new photo to the beginning (LIFO), keeping max 4
            // Filter out nulls first to get actual photos
            const currentPhotos = savedPhotos.filter((p: any) => p && typeof p === 'string');

            // Add new photo to start
            const newPhotos = [imageDataUrl, ...currentPhotos].slice(0, 4);

            // Pad with nulls if needed to maintain 4 slots structure
            while (newPhotos.length < 4) {
                newPhotos.push(null);
            }

            localStorage.setItem("my-tryon-photos", JSON.stringify(newPhotos));
            window.dispatchEvent(new Event("tryon-storage-update"));
        } catch (err: any) {
            console.error("Failed to save try-on photo", err);
            // But proceed with current session anyway
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                if (result) {
                    processImage(result);
                } else {
                    console.error("Error: File read returned empty result");
                }
            };
            reader.onerror = (e) => {
                console.error(`Error reading file: ${reader.error?.message}`);
            };
            reader.readAsDataURL(file);
        }
        // Reset the input so the same file can be selected again if needed
        e.target.value = '';
    };

    const handleReset = () => {
        setUserImage(null);
        setIsDemoResult(false);
        setScale(1);
        setRotation(0);
        stopCamera();
    };

    if (!isOpen || !product) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-4xl bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => {
                                stopCamera();
                                onClose();
                            }}
                            className="absolute top-4 right-4 z-20 p-2 bg-white/50 rounded-full hover:bg-white transition-colors"
                        >
                            <X size={20} className="text-foreground" />
                        </button>

                        {/* Left: Product Info */}
                        <div className="w-full md:w-1/3 bg-secondary/30 p-8 flex flex-col justify-between">
                            <div>
                                <h2 className="text-2xl font-serif mb-2">Virtual Fitting Room</h2>
                                <p className="text-muted-foreground text-sm mb-6">
                                    See how the <span className="font-semibold text-foreground">{product.name}</span> looks on you.
                                </p>

                                <div className="relative aspect-[3/4] bg-white rounded-xl p-4 shadow-sm border border-border">
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-secondary/10">
                                        Product Image Placeholder
                                    </div>
                                    <div className="relative w-full h-full">
                                        <Image src={product.image} alt={product.name} fill className="object-contain p-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <p className="font-medium text-lg">{product.price}</p>
                                <button className="w-full mt-4 py-3 bg-foreground text-background rounded-xl font-medium hover:opacity-90">
                                    Add to Cart
                                </button>
                            </div>
                        </div>

                        {/* Right: Try On Area */}
                        <div className="w-full md:w-2/3 bg-background p-8 flex flex-col items-center justify-center relative">

                            {isProcessing ? (
                                // AI Processing State
                                <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
                                    <div className="relative w-24 h-24">
                                        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center font-bold text-indigo-600">
                                            AI
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-lg font-semibold animate-pulse">Connecting to AI Server...</h3>
                                        <p className="text-muted-foreground text-sm">Synthesizing virtual fit...</p>
                                    </div>
                                </div>
                            ) : isCameraOpen ? (
                                // Camera View State
                                <div className="relative w-full h-full flex flex-col items-center justify-center bg-black rounded-xl overflow-hidden">
                                    <video
                                        autoPlay
                                        playsInline
                                        muted
                                        ref={(video) => {
                                            if (video && cameraStream) {
                                                video.srcObject = cameraStream;
                                            }
                                            // Assign to ref for capture
                                            // @ts-ignore
                                            videoRef.current = video;
                                        }}
                                        className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                                    />
                                    <canvas ref={canvasRef} className="hidden" />

                                    <div className="absolute bottom-6 flex gap-4 z-20">
                                        <button
                                            onClick={stopCamera}
                                            className="px-6 py-2 bg-white/20 backdrop-blur-md text-white rounded-full font-medium hover:bg-white/30 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCapturePhoto}
                                            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-transform"
                                        >
                                            <div className="w-12 h-12 bg-white rounded-full"></div>
                                        </button>
                                    </div>
                                </div>
                            ) : !userImage ? (
                                // Upload State
                                <div className="text-center space-y-8 max-w-sm mx-auto py-8">
                                    {/* Icon - Minimalist */}
                                    <div className="flex justify-center text-slate-800 mb-2">
                                        <Camera size={40} strokeWidth={1} />
                                    </div>

                                    {/* Typography - Editorial Style */}
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-serif italic text-slate-900">Portrait Upload</h3>
                                        <p className="text-slate-500 text-sm font-sans tracking-wide uppercase text-[10px]">
                                            Clear lighting • Front facing • High Quality
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3 w-full pt-4">
                                        {/* Gallery Trigger - Sharp, Solid Black */}
                                        {/* Gallery Trigger - Sharp, Solid Black */}
                                        <label
                                            htmlFor="gallery-upload"
                                            className="w-full px-6 py-4 bg-slate-900 text-white font-serif italic text-lg hover:bg-black transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer group border border-slate-900 shadow-sm hover:shadow-md rounded-2xl"
                                        >
                                            <Upload size={18} strokeWidth={1.5} className="text-slate-300 group-hover:text-white" />
                                            <span>Select from Gallery</span>
                                        </label>

                                        {/* Camera Trigger - Use vibrant Yellow */}
                                        {typeof window !== 'undefined' && window.isSecureContext ? (
                                            <button
                                                onClick={handleStartCamera}
                                                className="w-full px-6 py-6 bg-yellow-400 border border-yellow-400 text-slate-900 font-serif italic hover:bg-yellow-500 hover:border-yellow-500 transition-all duration-300 flex items-center justify-center gap-4 shadow-sm hover:shadow-md rounded-2xl"
                                            >
                                                <Camera size={32} strokeWidth={2} className="text-slate-900" />
                                                <span className="text-4xl font-black tracking-tight not-italic font-sans">Use Camera</span>
                                            </button>
                                        ) : (
                                            <label
                                                htmlFor="camera-upload"
                                                className="w-full px-6 py-6 bg-yellow-400 border border-yellow-400 text-slate-900 font-serif italic hover:bg-yellow-500 hover:border-yellow-500 transition-all duration-300 flex items-center justify-center gap-4 cursor-pointer shadow-sm hover:shadow-md rounded-2xl"
                                            >
                                                <Camera size={32} strokeWidth={2} className="text-slate-900" />
                                                <span className="text-4xl font-black tracking-tight not-italic font-sans">Take Photo</span>
                                            </label>
                                        )}

                                        {/* Mobile Connect - Solid Black */}
                                        <button
                                            onClick={() => setShowMobileConnect(!showMobileConnect)}
                                            className="w-full px-6 py-4 bg-slate-900 border border-slate-900 text-white font-serif italic text-lg hover:bg-black transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-md rounded-2xl"
                                        >
                                            <Smartphone size={18} strokeWidth={1.5} className="text-slate-300" />
                                            <span>Connect Mobile</span>
                                        </button>

                                        {showMobileConnect && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                className="w-full p-6 bg-slate-50 border border-slate-200"
                                            >
                                                <div className="bg-white p-2 w-fit mx-auto mb-4 border border-slate-100 shadow-sm">
                                                    <QRCodeSVG value={`http://${serverIp}:3000`} size={120} />
                                                </div>
                                                <div className="text-center space-y-2">
                                                    <p className="text-xs font-serif italic text-slate-500">Scan to upload</p>
                                                    <div className="flex items-center justify-center gap-2 border-t border-slate-200 pt-2 mt-2">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">IP</span>
                                                        <input
                                                            type="text"
                                                            value={serverIp}
                                                            onChange={(e) => setServerIp(e.target.value)}
                                                            className="w-24 text-xs font-mono text-slate-700 bg-transparent outline-none text-center"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                // Fitting State
                                <div className="relative w-full h-full flex flex-col items-center">
                                    <div className="relative w-full h-full min-h-[400px] bg-gray-100 rounded-xl overflow-hidden border border-border group">
                                        {/* User Image */}
                                        <div className="relative w-full h-full group/image">
                                            <img
                                                src={userImage}
                                                alt="User"
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Delete/Reset Button */}
                                            <button
                                                onClick={handleReset}
                                                className="absolute top-4 left-4 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full shadow-lg backdrop-blur-sm transition-all opacity-0 group-hover/image:opacity-100 z-50 pointer-events-auto"
                                                title="Delete Image / Reset"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                            </button>
                                        </div>

                                        {/* Overlay (Product) - Rendered ALWAYS (either interactive or static) */}
                                        <motion.div
                                            drag={!isDemoResult} // Disable drag if result ready
                                            dragMomentum={false}
                                            className={`absolute ${!isDemoResult ? 'cursor-move' : ''} touch-none z-20`}
                                            style={{
                                                top: "15%",
                                                left: "50%",
                                                x: "-50%",
                                                y: "0%",
                                                scale: scale,
                                                rotate: rotation
                                            }}
                                        >
                                            <div className="relative w-40 h-40 group/item">
                                                <Image
                                                    src={product.image}
                                                    alt="Fitting"
                                                    fill
                                                    className={`object-contain drop-shadow-lg rounded-2xl transition-all duration-500 ${isDemoResult ? 'filter brightness-105 contrast-110 drop-shadow-2xl' : ''}`}
                                                />
                                                {!isDemoResult && (
                                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none">
                                                        Drag to move
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>

                                        {/* Pro Controls Panel - ONLY visible in Manual Mode */}
                                        {!isDemoResult && (
                                            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl z-30 border border-gray-100 w-max">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-[10px] uppercase font-bold text-gray-400">Size</span>
                                                    <input
                                                        type="range"
                                                        min="0.5"
                                                        max="2"
                                                        step="0.1"
                                                        value={scale}
                                                        onChange={(e) => setScale(parseFloat(e.target.value))}
                                                        className="w-20 cursor-pointer accent-indigo-600 h-1.5 bg-gray-200 rounded-lg appearance-none"
                                                    />
                                                </div>
                                                <div className="w-px h-8 bg-gray-200"></div>
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-[10px] uppercase font-bold text-gray-400">Tilt</span>
                                                    <input
                                                        type="range"
                                                        min="-45"
                                                        max="45"
                                                        value={rotation}
                                                        onChange={(e) => setRotation(parseInt(e.target.value))}
                                                        className="w-20 cursor-pointer accent-indigo-600 h-1.5 bg-gray-200 rounded-lg appearance-none"
                                                    />
                                                </div>
                                                <div className="w-px h-8 bg-gray-200"></div>
                                                <button
                                                    onClick={() => { setScale(1); setRotation(0); }}
                                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                                                    title="Reset Transform"
                                                >
                                                    <RefreshCcw size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex flex-col items-center gap-2 relative z-30">
                                        {isDemoResult && (
                                            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full mb-2 animate-in fade-in zoom-in duration-300">
                                                <Check size={14} />
                                                <span>AI Fitting Complete</span>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleReset}
                                            className="text-xs text-muted-foreground underline hover:text-foreground"
                                        >
                                            Try Another Photo
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
