import Link from "next/link";
import Image from "next/image";

export function Hero() {
    return (
        <section className="relative w-full py-5 md:py-10 px-4 overflow-hidden bg-green-100 rounded-3xl mx-auto container mt-4 shadow-sm border border-green-200">
            <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-3">

                <h1 className="text-3xl md:text-4xl font-serif font-medium text-foreground tracking-tight leading-snug flex items-center justify-center gap-6">
                    <div className="flex flex-col items-center">
                        <span className="block mb-1">K-Fit Mall</span>
                        <span>
                            <span className="italic text-slate-500">오신 것을</span> 환영 합니다.
                        </span>
                    </div>
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-white shadow-md mt-2 ml-4">
                        <Image
                            src="/character.png"
                            alt="Character"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                </h1>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Link
                        href="/shop"
                        className="px-6 py-2.5 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-90 transition-all shadow-md hover:shadow-lg"
                    >
                        Start Shopping
                    </Link>
                    <button className="px-6 py-2.5 bg-white/50 backdrop-blur-sm text-foreground border border-white/20 rounded-full text-sm font-medium hover:bg-white/80 transition-all">
                        Learn More
                    </button>
                </div>
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        </section>
    );
}
