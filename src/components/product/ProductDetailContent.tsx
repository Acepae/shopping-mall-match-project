"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Check, Droplets, Sun, Wind } from "lucide-react";

export function ProductDetailContent() {
    const { t } = useLanguage();

    return (
        <div className="py-16 space-y-20">
            {/* Section 1: Editorial Header */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/30 to-secondary/30 p-12 text-center space-y-6">
                <span className="inline-block px-3 py-1 bg-white/60 rounded-full text-xs font-semibold tracking-wider uppercase text-indigo-900">
                    2026 Spring Collection
                </span>
                <h2 className="text-3xl md:text-5xl font-serif text-foreground leading-tight">
                    "등산복? 아니요,<br />지금 가장 힙한 <span className="italic text-indigo-700">시티 고프코어</span>입니다."
                </h2>
                <p className="max-w-2xl mx-auto text-lg text-gray-700 leading-relaxed font-light">
                    아침저녁 쌀쌀한 바람, 낮에는 따가운 봄 햇살.<br />
                    변덕스러운 날씨로부터 나를 지켜줄 '한 겹'입니다.<br />
                    투박한 등산복이 아닌, 일상에 완벽하게 녹아드는<br />
                    <strong className="font-medium">세련된 명확성(Refined Clarity)</strong>의 시티 고프코어 룩을 경험하세요.
                </p>
            </div>

            {/* Section 2: Technical Features (Icons) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                    { icon: Wind, title: "Airy Weight", desc: "공기 같은 가벼움" },
                    { icon: Sun, title: "UV Cut", desc: "자외선 차단 99%" },
                    { icon: Droplets, title: "Water Repellent", desc: "생활 방수 기능" },
                    { icon: Check, title: "Daily Proof", desc: "일상 오염 방지" },
                ].map((feature, i) => (
                    <div key={i} className="flex flex-col items-center text-center space-y-3 p-6 rounded-xl bg-white border border-border shadow-sm">
                        <div className="p-3 bg-secondary/30 rounded-full text-foreground">
                            <feature.icon size={24} />
                        </div>
                        <h3 className="font-serif font-bold text-lg">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                ))}
            </div>

            {/* Section 3: Styling Guide (Mix & Match) */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h3 className="text-2xl font-serif text-foreground">
                        당신의 개성을 완성할<br />'스페셜 컬러 에디션'
                    </h3>
                    <p className="text-gray-600">
                        얼굴을 밝혀주는 '반사판 컬러'와 완벽한 핏을 위한 가이드.<br />
                        크롭이라 비율이 좋아 보이고, 소재가 너무 고급스러워서 매일 입고 싶어질 거예요.
                    </p>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#E8F3E8] border border-border" />
                            <div>
                                <strong className="block text-sm text-foreground">Soft Sage</strong>
                                <span className="text-xs text-muted-foreground">차분하고 지적인 무드</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#E8E6F3] border border-border" />
                            <div>
                                <strong className="block text-sm text-foreground">Muted Lavender</strong>
                                <span className="text-xs text-muted-foreground">우아하고 부드러운 포인트</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visual Placeholder for Mix & Match Images */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-[3/4] bg-accent/30 rounded-xl relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">Style 01. Urban</div>
                    </div>
                    <div className="aspect-[3/4] bg-primary/20 rounded-xl relative overflow-hidden mt-8">
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">Style 02. Daily</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
