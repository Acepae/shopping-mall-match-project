import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";

interface ShellProps {
    children: ReactNode;
}

export function Shell({ children }: ShellProps) {
    return (
        <div className="min-h-screen bg-[#E2E8F0] flex justify-center">
            <div className="w-full max-w-[1440px] min-h-screen flex flex-col relative">
                <Header />
                <main className="flex-1 pb-16 md:pb-0 px-4 md:px-8 py-8">
                    {children}
                </main>
                <Footer />
                <BottomNav />
            </div>
        </div>
    );
}
