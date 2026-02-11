"use client";

import Link from "next/link";
import { Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function Header() {
    const { toggleCart, cartCount } = useCart();

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full shadow-md hover:scale-105 transition-transform">
                    <span className="font-serif text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                        K-Fit
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden xl:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
                    <Link href="/new" className="hover:text-foreground transition-colors">New In</Link>
                    <Link href="/apparel" className="hover:text-foreground transition-colors">Apparel</Link>
                    <Link href="/accessories" className="hover:text-foreground transition-colors">Accessories</Link>
                    <Link href="/editorial" className="hover:text-foreground transition-colors">Editorial</Link>
                </nav>

                {/* Icons */}
                <div className="flex items-center space-x-4">
                    <Link href="/search" className="p-2 hover:bg-secondary rounded-full transition-colors">
                        <Search size={20} className="text-foreground" />
                    </Link>
                    <button onClick={toggleCart} className="p-2 hover:bg-secondary rounded-full transition-colors relative">
                        <ShoppingBag size={20} className="text-foreground" />
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </button>
                    <Link href="/profile" className="hidden md:block p-2 hover:bg-secondary rounded-full transition-colors">
                        <User size={20} className="text-foreground" />
                    </Link>
                </div>
            </div>
        </header >
    );
}
