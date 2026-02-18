"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface ProductGalleryProps {
    images: string[];
    productId: string;
    onMainImageClick?: () => void;
    selectedIndex?: number;
    onSelectIndex?: (index: number) => void;
}

export function ProductGallery({ images, productId, onMainImageClick, selectedIndex = 0, onSelectIndex }: ProductGalleryProps) {
    const [localSelectedIndex, setLocalSelectedIndex] = useState(0);

    // Use controlled state if available, otherwise local
    const currentIndex = onSelectIndex ? selectedIndex : localSelectedIndex;

    const handleSelect = (idx: number) => {
        if (onSelectIndex) {
            onSelectIndex(idx);
        } else {
            setLocalSelectedIndex(idx);
        }
    };

    return (
        <div className="flex flex-col-reverse md:flex-row gap-6 p-6 bg-indigo-200 rounded-[2.5rem] shadow-2xl shadow-indigo-400/50 border border-indigo-300 relative">
            {/* Decorative Background Element */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-slate-50/50 rounded-3xl -z-10" />

            {/* Thumbnails */}
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible py-2 md:py-4 px-2 md:px-0 scrollbar-hide md:w-24 justify-center">
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        className={`relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden transition-all duration-300 ${currentIndex === idx
                            ? "ring-2 ring-indigo-500 ring-offset-2 shadow-md scale-105 opacity-100"
                            : "ring-1 ring-slate-200 hover:ring-slate-300 opacity-60 hover:opacity-100 hover:scale-105"
                            }`}
                    >
                        <Image
                            src={`${img}?v=${Date.now()}`}
                            alt={`Thumbnail ${idx + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </button>
                ))}
            </div>

            {/* Main Image Area with Upload Option */}
            <div className={`flex-1 aspect-[3/4] md:aspect-square relative rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 p-8 group/main ${onMainImageClick ? 'cursor-pointer' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-indigo-50/50 -z-10" />

                {/* Image Container with Blue Background */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-blue-100 shadow-sm ring-1 ring-blue-200/50 p-6 flex items-center justify-center">
                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-white/50">
                        <Image
                            src={`${images[currentIndex]}?v=${Date.now()}`}
                            alt="Product"
                            fill
                            className="object-contain"
                            priority
                            unoptimized
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.srcset = "/placeholder.svg";
                                target.src = "/placeholder.svg";
                            }}
                            onClick={() => onMainImageClick && onMainImageClick()}
                        />
                    </div>
                </div>

                {/* Upload Button */}
                {productId && (
                    <div
                        className="absolute top-12 right-12 z-20 opacity-0 group-hover/main:opacity-100 transition-opacity duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white/90 backdrop-blur rounded-lg shadow-lg p-1">
                            <ImageUploader
                                targetFilename={
                                    productId === "1" ? "p1.jpg" :
                                        productId === "5" ? "cap.jpg" :
                                            `p${productId}.jpg`
                                }
                                onUploadComplete={() => {
                                    window.location.reload();
                                }}
                                label="Update Photo"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
