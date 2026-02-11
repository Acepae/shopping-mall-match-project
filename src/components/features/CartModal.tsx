"use client";

import { useCart } from "@/context/CartContext";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { PaymentModal } from "./PaymentModal";
import { useState } from "react";

export function CartModal() {
    const { isCartOpen, toggleCart, items, removeFromCart, cartTotal, clearCart } = useCart();
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    const handleCheckout = () => {
        setIsPaymentOpen(true);
        // toggleCart(); // Optionally close cart, or keep it open behind payment modal
    };

    return (
        <>
            <AnimatePresence>
                {isCartOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleCart}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <ShoppingBag size={20} />
                                    Your Cart ({items.length})
                                </h2>
                                <button
                                    onClick={toggleCart}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {items.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-500">
                                        <ShoppingBag size={48} className="opacity-20" />
                                        <p>Your cart is empty.</p>
                                        <button
                                            onClick={toggleCart}
                                            className="text-indigo-600 font-medium hover:underline"
                                        >
                                            Continue Shopping
                                        </button>
                                    </div>
                                ) : (
                                    items.map((item, index) => (
                                        <div key={`${item.id}-${index}`} className="flex gap-4">
                                            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                                                {item.image && (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{item.name}</h3>
                                                    <p className="text-sm text-gray-500">{item.price}</p>
                                                    {item.selectedSize && <p className="text-xs text-gray-400">Size: {item.selectedSize}</p>}
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1">
                                                        <button className="p-1 hover:text-indigo-600 transition-colors">
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                                        <button className="p-1 hover:text-indigo-600 transition-colors">
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-xs text-red-500 hover:underline"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {items.length > 0 && (
                                <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
                                    <div className="flex items-center justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span>{cartTotal}</span>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                    >
                                        Checkout
                                        <span className="bg-white/20 px-2 py-0.5 rounded text-sm">{cartTotal}</span>
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Payment Modal Integration */}
            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                productName={`Cart (${items.length} items)`}
                productPrice={cartTotal}
            />
        </>
    );
}
