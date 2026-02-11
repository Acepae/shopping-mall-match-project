import type { Metadata } from "next";
import { Noto_Serif_KR, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { clsx } from "clsx";

const serif = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "600", "900"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "K-Fit Mall | Virtual Fitting Shopping Mall",
  description: "Experience the new standard of online shopping with AI virtual fitting.",
};

import { Shell } from "@/components/layout/Shell";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { CartModal } from "@/components/features/CartModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={clsx(serif.variable, sans.variable)}>
      <body className="antialiased min-h-screen flex flex-col">
        <LanguageProvider>
          <CartProvider>
            <Shell>
              {children}
            </Shell>
            <CartModal />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
