"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";

export function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8 text-xs text-gray-500 font-sans mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12 mb-16">
                    {/* 1. Company Info */}
                    <div className="space-y-4">
                        <h3 className="text-gray-900 font-bold mb-4 text-sm">(주) K-Fit Mall</h3>
                        <div className="space-y-1.5 leading-relaxed tracking-tight">
                            <p>대표자 : 구진모 | 사업자 등록번호 : 186-81-01205</p>
                            <p>주소 : 06072 서울특별시 강남구 학동로97길 30 (청담동) ADLV빌딩 6층</p>
                            <p>통신판매업 신고 제 2018-서울강남-04088호</p>
                            <p>전화 : 02-3444-6226 | 팩스 : 02-959-7894</p>
                            <p>개인정보보호책임자 : 구민정(service@acmedelavie.com)</p>
                        </div>
                        <div className="flex gap-4 mt-8 text-gray-400">
                            <Link href="#" className="hover:text-gray-900">이용약관</Link>
                            <Link href="#" className="hover:text-gray-900">이용안내</Link>
                            <Link href="#" className="hover:text-gray-900">개인정보처리방침</Link>
                        </div>
                    </div>

                    {/* 2. CS Center & Menu */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-gray-900 font-bold text-lg mb-2">CS CENTER <span className="ml-2">070-8840-7894</span></h3>
                            <p className="text-[10px] text-gray-400">AM 10:00 - PM 17:00 | SAT, SUN, HOLIDAY OFF</p>
                        </div>

                        <div className="space-y-2 font-medium text-gray-700 text-sm">
                            <Link href="#" className="block hover:text-indigo-600">MEMBERSHIP</Link>
                            <Link href="#" className="block hover:text-indigo-600">NOTICE</Link>
                            <Link href="#" className="block hover:text-indigo-600">Q&A</Link>
                            <Link href="#" className="block hover:text-indigo-600">FAQ</Link>
                        </div>
                    </div>

                    {/* 3. Socials */}
                    <div>
                        <h3 className="text-gray-900 font-bold mb-6 text-sm">K-FIT MALL OFFICIAL</h3>
                        <div className="space-y-3 font-medium text-gray-700 text-sm">
                            <Link href="#" className="flex items-center gap-2 hover:text-indigo-600">
                                <span>INSTAGRAM OFFICIAL</span>
                            </Link>
                            <Link href="#" className="flex items-center gap-2 hover:text-indigo-600">
                                <span>INSTAGRAM CREW</span>
                            </Link>
                            <Link href="#" className="flex items-center gap-2 hover:text-indigo-600">
                                <span>FACEBOOK</span>
                            </Link>
                            <Link href="#" className="flex items-center gap-2 hover:text-indigo-600">
                                <span>YOUTUBE</span>
                            </Link>
                            <Link href="#" className="flex items-center gap-2 hover:text-indigo-600">
                                <span>TWITTER</span>
                            </Link>
                        </div>
                    </div>

                    {/* 4. Scroll Top */}
                    <div className="flex justify-end items-end h-full">
                        <button
                            onClick={scrollToTop}
                            className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors bg-white shadow-sm"
                        >
                            <ArrowUp size={20} className="text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
