"use client";

import { useCart } from "@/context/CartContext";
import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Shirt } from "lucide-react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
// import { ProductDetailContent } from "@/components/product/ProductDetailContent";
import { TryOnModal } from "@/components/features/TryOnModal";
import { PaymentModal } from "@/components/features/PaymentModal";
import { PRODUCTS } from "@/lib/products";
import { notFound } from "next/navigation";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    // ... existing code ...
    const { addToCart } = useCart();

    // Unwrap params using React.use() - Next.js 15+ pattern
    const resolvedParams = use(params);
    // ... existing code ...
    const [isTryOnOpen, setIsTryOnOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [showCartToast, setShowCartToast] = useState(false);

    const product = PRODUCTS.find((p) => p.id === resolvedParams.id);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product);
            setShowCartToast(true);
            setTimeout(() => setShowCartToast(false), 3000);
        }
    };

    if (!product) {
        return <div>Product not found</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 relative">
            {/* Toast Notification */}
            <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[70] transition-all duration-300 ${showCartToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
                    <div className="bg-green-500 rounded-full p-1">
                        <svg className="w-4 h-4 text-white" fill="none" strokeWidth="3" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"></path></svg>
                    </div>
                    <span className="font-medium">Added to Cart!</span>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 mb-8 transition-colors group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Collection
                </Link>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Left Column: Gallery */}
                    <ProductGallery images={product.images} productId={product.id} />

                    {/* Right Column: Info */}
                    <div className="relative">
                        <ProductInfo
                            name={product.name}
                            price={product.price}
                            description={product.description}
                            onTryOn={() => setIsTryOnOpen(true)}
                            onBuyNow={() => setIsPaymentOpen(true)}
                            onAddToCart={handleAddToCart}
                        />
                    </div>
                </div>

                {/* Content Sections */}
                <div className="border-t border-border pt-16 mt-16">
                    {/* <ProductDetailContent /> */}
                </div>
            </div>

            {/* Virtual Fitting Room Modal */}
            <TryOnModal
                isOpen={isTryOnOpen}
                onClose={() => setIsTryOnOpen(false)}
                product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image
                }}
            />

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                productName={product.name}
                productPrice={product.price}
            />
        </div>
    );
}
