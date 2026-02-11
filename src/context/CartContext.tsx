"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/lib/products";

export interface CartItem extends Product {
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, size?: string, color?: string) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    isCartOpen: boolean;
    toggleCart: () => void;
    setIsCartOpen: (isOpen: boolean) => void;
    cartCount: number;
    cartTotal: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("k-fit-cart");
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("k-fit-cart", JSON.stringify(items));
    }, [items]);

    const addToCart = (product: Product, size?: string, color?: string) => {
        setItems((prevItems) => {
            const existingItemIndex = prevItems.findIndex(
                (item) => item.id === product.id && item.selectedSize === size && item.selectedColor === color
            );

            if (existingItemIndex > -1) {
                // Increment quantity if item already exists
                const newItems = [...prevItems];
                newItems[existingItemIndex].quantity += 1;
                return newItems;
            } else {
                // Add new item
                return [...prevItems, { ...product, quantity: 1, selectedSize: size, selectedColor: color }];
            }
        });
        setIsCartOpen(true); // Open cart when item is added
    };

    const removeFromCart = (productId: string) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    };

    const clearCart = () => {
        setItems([]);
    };

    const toggleCart = () => {
        setIsCartOpen((prev) => !prev);
    };

    const cartCount = items.reduce((total, item) => total + item.quantity, 0);

    // Calculate total price (parsing string price like "$120" to number)
    const cartTotal = items.reduce((total, item) => {
        const priceNumber = parseFloat(item.price.replace(/[^0-9.]/g, ""));
        return total + (isNaN(priceNumber) ? 0 : priceNumber) * item.quantity;
    }, 0).toLocaleString("en-US", { style: "currency", currency: "USD" });


    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                clearCart,
                isCartOpen,
                toggleCart,
                setIsCartOpen,
                cartCount,
                cartTotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
