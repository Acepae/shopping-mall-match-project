"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Smartphone, Check, Wallet } from "lucide-react";
import Image from "next/image";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    productPrice: string;
}

export function PaymentModal({ isOpen, onClose, productName, productPrice }: PaymentModalProps) {
    const [step, setStep] = useState<"select" | "processing" | "success">("select");
    const [selectedMethod, setSelectedMethod] = useState<"credit" | "apple" | "toss" | null>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep("select");
            setSelectedMethod(null);
        }
    }, [isOpen]);

    const handlePayment = () => {
        if (!selectedMethod) return;

        setStep("processing");

        // Simulate API call
        setTimeout(() => {
            setStep("success");
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]"
                    >
                        {/* Left Side: Order Summary & Total (Visual) */}
                        <div className="hidden md:flex w-1/3 bg-gray-50/50 border-r border-gray-100 p-8 flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Order Details</h3>
                                <div className="space-y-4">
                                    <div className="aspect-square relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-4">
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                            Product Image
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Item</p>
                                        <p className="font-medium text-gray-900 text-lg leading-tight">{productName}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-medium">{productPrice}</span>
                                </div>
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-gray-500">Tax</span>
                                    <span className="font-medium">$0.00</span>
                                </div>
                                <div className="flex justify-between items-center text-xl font-bold text-indigo-600">
                                    <span>Total</span>
                                    <span>{productPrice}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Payment Form */}
                        <div className="flex-1 p-8 flex flex-col h-full bg-white">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {step === "select" && (
                                <div className="space-y-6 flex-1 flex flex-col">

                                    {/* Mobile Order Summary (Visible only on small screens) */}
                                    <div className="md:hidden bg-gray-50 p-4 rounded-xl mb-4">
                                        <div className="flex justify-between font-bold">
                                            <span>{productName}</span>
                                            <span className="text-indigo-600">{productPrice}</span>
                                        </div>
                                    </div>

                                    {/* Payment Methods */}
                                    <div className="space-y-4 flex-1">
                                        <p className="text-base font-semibold text-gray-700">Select Payment Method</p>

                                        {/* Credit Card Option */}
                                        <div className={`border-2 rounded-2xl transition-all overflow-hidden ${selectedMethod === "credit" ? "border-indigo-600 bg-indigo-50/10" : "border-gray-200"}`}>
                                            <button
                                                onClick={() => setSelectedMethod("credit")}
                                                className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                                                    <CreditCard size={24} />
                                                </div>
                                                <div className="text-left flex-1">
                                                    <p className="font-bold text-gray-900">Credit Card</p>
                                                    <p className="text-xs text-gray-500">Visa, Mastercard, Amex</p>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === "credit" ? "border-indigo-600" : "border-gray-300"}`}>
                                                    {selectedMethod === "credit" && <div className="w-3 h-3 rounded-full bg-indigo-600" />}
                                                </div>
                                            </button>

                                            {/* Credit Card Input Form - Expands when selected */}
                                            <AnimatePresence>
                                                {selectedMethod === "credit" && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="px-4 pb-6 pt-2 border-t border-indigo-100 bg-white"
                                                    >
                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Card Number</label>
                                                                <div className="relative">
                                                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full pl-10 h-12 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder:text-gray-300" />
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-4">
                                                                <div className="flex-1">
                                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Expiry Date</label>
                                                                    <input type="text" placeholder="MM/YY" className="w-full px-4 h-12 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder:text-gray-300" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">CVC</label>
                                                                    <input type="text" placeholder="123" className="w-full px-4 h-12 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder:text-gray-300" />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cardholder Name</label>
                                                                <input type="text" placeholder="John Doe" className="w-full px-4 h-12 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder:text-gray-300" />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Apple Pay Option */}
                                        <button
                                            onClick={() => setSelectedMethod("apple")}
                                            className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${selectedMethod === "apple"
                                                ? "border-black bg-black text-white shadow-lg"
                                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${selectedMethod === 'apple' ? 'bg-white/20' : 'bg-black text-white'}`}>
                                                <svg viewBox="0 0 384 512" width="20" height="20" fill="currentColor">
                                                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                                                </svg>
                                            </div>
                                            <div className="text-left flex-1">
                                                <p className="font-bold text-lg leading-none mb-1">Apple Pay</p>
                                                <p className={`text-xs ${selectedMethod === 'apple' ? 'text-white/70' : 'text-gray-500'}`}>Pay with FaceID</p>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === "apple" ? "border-white" : "border-gray-300"}`}>
                                                {selectedMethod === "apple" && <div className="w-3 h-3 rounded-full bg-white" />}
                                            </div>
                                        </button>

                                        {/* Apple Pay Input Form */}
                                        <AnimatePresence>
                                            {selectedMethod === "apple" && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="px-4 pb-6 pt-2 border-t border-gray-200 bg-white"
                                                >
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Apple ID</label>
                                                            <input type="email" placeholder="example@icloud.com" className="w-full px-4 h-12 rounded-lg border border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-200 outline-none transition-all placeholder:text-gray-300" />
                                                        </div>
                                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200">
                                                                <Smartphone size={16} className="text-gray-600" />
                                                            </div>
                                                            <p className="text-sm text-gray-600 font-medium">Confirm on your iPhone</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Toss Pay Option */}
                                        <button
                                            onClick={() => setSelectedMethod("toss")}
                                            className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${selectedMethod === "toss"
                                                ? "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-200"
                                                : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/20"
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-black text-xl ${selectedMethod === 'toss' ? 'bg-white/20' : 'bg-blue-500 text-white'}`}>
                                                T
                                            </div>
                                            <div className="text-left flex-1">
                                                <p className="font-bold text-lg leading-none mb-1">Toss Pay</p>
                                                <p className={`text-xs ${selectedMethod === 'toss' ? 'text-white/80' : 'text-gray-500'}`}>Fast Mobile Payment</p>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === "toss" ? "border-white" : "border-gray-300"}`}>
                                                {selectedMethod === "toss" && <div className="w-3 h-3 rounded-full bg-white" />}
                                            </div>
                                        </button>

                                        {/* Toss Pay Input Form */}
                                        <AnimatePresence>
                                            {selectedMethod === "toss" && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="px-4 pb-6 pt-2 border-t border-blue-100 bg-white"
                                                >
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                                                            <input type="tel" placeholder="010-0000-0000" className="w-full px-4 h-12 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-gray-300" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Birth Date (6 digits)</label>
                                                            <input type="text" placeholder="YYMMDD" maxLength={6} className="w-full px-4 h-12 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all placeholder:text-gray-300" />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={handlePayment}
                                        disabled={!selectedMethod}
                                        className={`w-full py-5 rounded-2xl font-bold text-xl transition-all mt-auto ${selectedMethod
                                            ? "bg-gray-900 text-white shadow-xl shadow-gray-900/20 hover:scale-[1.02]"
                                            : "bg-gray-100 text-gray-300 cursor-not-allowed"
                                            }`}
                                    >
                                        Pay {productPrice}
                                    </button>
                                </div>
                            )}

                            {step === "processing" && (
                                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                                    <div className="relative w-20 h-20">
                                        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-lg font-bold text-gray-900">Processing Payment...</h3>
                                        <p className="text-sm text-gray-500">Please do not close this window.</p>
                                    </div>
                                </div>
                            )}

                            {step === "success" && (
                                <div className="flex flex-col items-center justify-center py-8 space-y-6">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                        className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center"
                                    >
                                        <Check size={48} strokeWidth={3} />
                                    </motion.div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-bold text-gray-900">Payment Successful!</h3>
                                        <p className="text-gray-500">Your order has been confirmed.</p>
                                    </div>
                                    <div className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Amount Paid</span>
                                            <span className="font-bold">{productPrice}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Transaction ID</span>
                                            <span className="font-mono text-xs">{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
