"use client";

import Link from "next/link";
import { useComparison } from "../context/ComparisonContext";
import { useLanguage } from "../context/LanguageContext";

export default function ComparisonBar() {
    const { compareList, removeFromCompare, clearCompare } = useComparison();
    const { t } = useLanguage();

    if (compareList.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl animate-in slide-in-from-bottom-10 h-24">
            <div className="glass-card rounded-[2rem] shadow-2xl p-3 flex items-center justify-between gap-4 border-2 border-white/50 dark:border-white/10">
                <div className="flex -space-x-4 overflow-hidden px-4">
                    {compareList.map((product) => (
                        <div key={product.id} className="relative group/item">
                            <div className="w-14 h-14 rounded-2xl border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-800 overflow-hidden shadow-lg transition-transform hover:scale-110 hover:z-10">
                                <img
                                    src={product.images?.[0]?.url ? `http://localhost:1338${product.images[0].url}` : "https://placehold.co/100x100"}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button
                                onClick={() => removeFromCompare(product.documentId || product.id)}
                                className="absolute -top-1 -right-1 bg-red-600 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900 opacity-0 group-hover/item:opacity-100 transition-opacity"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    {compareList.length < 4 && (
                        <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400 bg-gray-50/50 dark:bg-gray-800/50">
                            <span className="text-xl">+</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 pr-4">
                    <button
                        onClick={clearCompare}
                        className="text-gray-500 dark:text-gray-400 hover:text-red-600 text-xs font-bold transition-colors"
                    >
                        {t('common.clear')}
                    </button>
                    <Link
                        href="/compare"
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg hover:shadow-red-500/30 flex items-center gap-2"
                    >
                        <span>{t('common.compareNow')}</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs">{compareList.length}</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
