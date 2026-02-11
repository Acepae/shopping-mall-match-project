"use client";

import { Shirt } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ImageUploader } from "@/components/admin/ImageUploader";

import { Product } from "@/lib/products";

interface ProductCardProps {
    product: Product;
    onTryOn: (product: Product) => void;
    onSelect?: (product: Product) => void; // Optional handler for selection
}

export function ProductCard({ product, onTryOn, onSelect }: ProductCardProps) {
    const handleCardClick = (e: React.MouseEvent) => {
        if (onSelect) {
            e.preventDefault();
            onSelect(product);
            // Scroll to top to show detail view
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="group relative flex flex-col gap-3">
            <Link
                href={`/product/${product.id}`}
                onClick={handleCardClick}
                className="aspect-[3/4] w-full relative overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-lg shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-200/50 block"
            >
                {/* Product Image */}
                <div className="absolute inset-0 bg-slate-50">
                    <Image
                        src={`${product.image}?v=${Date.now()}`}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        unoptimized
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.srcset = "/placeholder.svg";
                            target.src = "/placeholder.svg";
                        }}
                    />
                </div>

                {/* Quick Upload Button (Admin Feature) - Enable for all products */}
                {product.id && (
                    <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ImageUploader
                            targetFilename={
                                product.id === "1" ? "p1.jpg" :
                                    product.id === "5" ? "cap.jpg" :
                                        `p${product.id}.jpg`
                            }
                            onUploadComplete={() => window.location.reload()}
                            minimal
                            label="Change"
                        />
                    </div>
                )}

                {/* Try On Button - Floating */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); // Stop navigation
                        onTryOn(product);
                    }}
                    className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all text-indigo-600 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 duration-300 z-10 flex items-center gap-2 border border-indigo-100"
                    aria-label="Try On"
                >
                    <Shirt size={20} className="text-indigo-600" />
                </button>
            </Link>

            <div className="px-2 space-y-1">
                <Link
                    href={`/product/${product.id}`}
                    onClick={handleCardClick}
                    className="font-serif text-lg leading-tight text-slate-800 hover:text-indigo-600 transition-colors block"
                >
                    {product.name}
                </Link>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-light">{product.category}</span>
                    <span className="font-bold text-slate-900">{product.price}</span>
                </div>
            </div>
        </div>
    );
}
