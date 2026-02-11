"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

interface ProductInfoProps {
    name: string;
    price: string;
    description: string;
    onTryOn?: (image?: string) => void;
    onBuyNow?: () => void;
    onAddToCart?: () => void;
}

export function ProductInfo({ name, price, description, onTryOn, onBuyNow, onAddToCart }: ProductInfoProps) {
    const { t } = useLanguage();
    // ... (rest of component)

    const [tryOnPhotos, setTryOnPhotos] = useState<(string | null)[]>([null, null, null, null]);

    // Log to confirm new version is running
    useEffect(() => { console.log("ProductInfo: Try-On Storage Version Loaded"); }, []);

    // Load photos from LocalStorage on mount and listen for updates
    useEffect(() => {
        const loadPhotos = () => {
            const savedPhotos = localStorage.getItem("my-tryon-photos");
            if (savedPhotos) {
                try {
                    setTryOnPhotos(JSON.parse(savedPhotos));
                } catch (e) {
                    console.error("Failed to parse saved photos", e);
                }
            }
        };

        loadPhotos();
        window.addEventListener("tryon-storage-update", loadPhotos);
        return () => window.removeEventListener("tryon-storage-update", loadPhotos);
    }, []);

    const handlePhotoUpload = (index: number, file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            const newPhotos = [...tryOnPhotos];
            newPhotos[index] = result;
            setTryOnPhotos(newPhotos);
            localStorage.setItem("my-tryon-photos", JSON.stringify(newPhotos));
            window.dispatchEvent(new Event("tryon-storage-update")); // Notify other components
        };
        reader.readAsDataURL(file);
    };

    const removePhoto = (index: number) => {
        const newPhotos = [...tryOnPhotos];
        newPhotos[index] = null;
        setTryOnPhotos(newPhotos);
        localStorage.setItem("my-tryon-photos", JSON.stringify(newPhotos));
        window.dispatchEvent(new Event("tryon-storage-update")); // Notify other components
    };

    return (
        <div className="space-y-8 sticky top-24 p-8 bg-indigo-200 rounded-[2.5rem] shadow-2xl shadow-indigo-400/50 border border-indigo-300">
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-[#eef2ff] text-[#4338ca] text-xs font-bold tracking-wider uppercase rounded-full border border-[#c7d2fe]">New Season</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif text-[#0f172a] tracking-tight leading-tight">{name}</h1>
                <p className="text-2xl font-light text-[#64748b] font-serif italic">{price}</p>
            </div>

            <div className="prose prose-lg text-[#475569] leading-relaxed font-light">
                <p>{description}</p>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#e2e8f0] to-transparent" />

            {/* Try-On Photo Storage Section */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-800 tracking-wide uppercase">My Try-On Photos</label>
                    <span className="text-xs text-indigo-500 font-medium bg-indigo-50 px-2 py-1 rounded-full">4 Slots Available</span>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    {tryOnPhotos.map((photo, index) => (
                        <div
                            key={index}
                            className={`aspect-square relative rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 transition-all duration-300 group flex flex-col items-center justify-center ${photo ? "border-indigo-300 bg-indigo-50/50" : "hover:border-indigo-400 hover:bg-slate-100 cursor-pointer"}`}
                            onClick={() => {
                                if (onTryOn) {
                                    onTryOn(photo || undefined);
                                }
                            }}
                        >
                            {photo ? (
                                <>
                                    <img src={photo} alt={`Try-On ${index + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removePhoto(index);
                                        }}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* Placeholder UI for Upload - Clicking this could allow direct upload too, but for now it's just a placeholder for the TryOnModal results */}
                                    <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-indigo-500 transition-colors">
                                        <span className="text-2xl font-light">+</span>
                                        <span className="text-[10px] font-medium uppercase tracking-wider">Empty</span>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-3 pt-6 flex-wrap">
                <Link
                    href="/"
                    className="flex-none w-12 h-12 flex items-center justify-center bg-white text-[#0f172a] rounded-xl border border-[#0f172a] hover:bg-[#0f172a] hover:text-white transition-all duration-300 font-bold text-lg shadow-sm hover:shadow-md"
                    aria-label="Back to Shop"
                >
                    ←
                </Link>

                {onTryOn && (
                    <button
                        onClick={() => onTryOn()}
                        className="flex-1 h-12 bg-gray-900 text-white rounded-xl font-bold text-base hover:shadow-xl hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-black/20 flex items-center justify-center gap-2 border border-gray-800"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" /></svg>
                        입어보기
                    </button>
                )}

                <button
                    onClick={onBuyNow}
                    className="flex-1 h-12 bg-gray-900 text-white rounded-xl font-bold text-base hover:shadow-xl hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-black/20 flex items-center justify-center gap-2 border border-gray-800"
                >
                    {t.product.buyNow}
                </button>
                <button
                    onClick={onAddToCart}
                    className="flex-1 h-12 bg-gray-900 text-white rounded-xl font-bold text-base hover:shadow-xl hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-black/20 flex items-center justify-center gap-2 border border-gray-800"
                >
                    {t.product.addToCart}
                </button>
            </div>
        </div>
    );
}
