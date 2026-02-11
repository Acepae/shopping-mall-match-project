"use client";

import { Home, Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Search, label: "Search", href: "/search" },
    { icon: ShoppingBag, label: "Cart", href: "/cart" },
    { icon: User, label: "Profile", href: "/profile" },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-t border-border flex items-center justify-around z-50 md:hidden">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex flex-col items-center justify-center w-full h-full space-y-1"
                    >
                        <item.icon
                            size={24}
                            className={clsx(
                                "transition-colors duration-200",
                                isActive ? "text-primary-foreground" : "text-muted-foreground"
                            )}
                        />
                        <span
                            className={clsx(
                                "text-[10px] font-medium",
                                isActive ? "text-primary-foreground" : "text-muted-foreground"
                            )}
                        >
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
