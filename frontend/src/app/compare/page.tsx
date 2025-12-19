"use client";

import Link from "next/link";
import { useComparison } from "../../context/ComparisonContext";
import { useLanguage } from "../../context/LanguageContext";
import Header from "../../components/Header";

export const dynamic = 'force-dynamic';

export default function ComparePage() {
    const { compareList, removeFromCompare, clearCompare } = useComparison();
    const { t } = useLanguage();

    if (compareList.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
                <Header />
                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="text-8xl mb-6">🔄</div>
                    <h1 className="text-3xl font-black mb-4 dark:text-white">{t('compare.emptyTitle')}</h1>
                    <p className="text-gray-500 mb-8">{t('compare.emptySubtitle')}</p>
                    <Link href="/" className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-red-700 transition shadow-lg">
                        {t('common.browseAds')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
            <Header />
            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl font-black dark:text-white mb-2">{t('common.compareNow')}</h1>
                        <p className="text-gray-500">{t('compare.compareSubtitle').replace('{count}', compareList.length.toString())}</p>
                    </div>

                    <button onClick={clearCompare} className="text-red-600 font-bold hover:underline">
                        {t('common.clearAll')}
                    </button>
                </div>

                <div className="overflow-x-auto pb-8">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="p-6 text-left min-w-[200px] border-b dark:border-gray-800">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('compare.features')}</span>
                                </th>
                                {compareList.map(item => (
                                    <th key={item.id} className="p-6 min-w-[280px] border-b dark:border-gray-800 relative group">
                                        <button
                                            onClick={() => removeFromCompare(item.documentId || item.id)}
                                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 transition"
                                        >
                                            ✕
                                        </button>
                                        <div className="flex flex-col items-center">
                                            <div className="w-40 h-40 rounded-3xl overflow-hidden mb-4 shadow-xl">
                                                <img
                                                    src={item.images?.[0]?.url ? `http://localhost:1338${item.images[0].url}` : "https://placehold.co/400x400"}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <h3 className="font-bold text-lg dark:text-white line-clamp-2 h-14">{item.title}</h3>
                                            <div className="text-red-600 font-black text-xl mt-2">{item.price?.toLocaleString()}</div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-800">
                            <tr>
                                <td className="p-6 font-bold text-gray-500 dark:text-gray-400">{t('postAd.labels.category')}</td>
                                {compareList.map(item => (
                                    <td key={item.id} className="p-6 text-center font-medium dark:text-gray-200">
                                        {item.category?.name || "—"}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="p-6 font-bold text-gray-500 dark:text-gray-400">{t('filters.selectCity')}</td>
                                {compareList.map(item => (
                                    <td key={item.id} className="p-6 text-center font-medium dark:text-gray-200">
                                        {item.city || "—"}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="p-6 font-bold text-gray-500 dark:text-gray-400">{t('postAd.labels.description')}</td>
                                {compareList.map(item => (
                                    <td key={item.id} className="p-6 text-sm text-gray-500 dark:text-gray-400 line-clamp-3 text-center h-32 overflow-hidden">
                                        {item.description || "—"}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="p-6 font-bold text-gray-500 dark:text-gray-400">{t('common.postedDate')}</td>
                                {compareList.map(item => (
                                    <td key={item.id} className="p-6 text-center text-sm dark:text-gray-400">
                                        {new Date(item.publishedAt || item.createdAt).toLocaleDateString()}
                                    </td>
                                ))}
                            </tr>
                            {/* Action Row */}
                            <tr>
                                <td className="p-6"></td>
                                {compareList.map(item => (
                                    <td key={item.id} className="p-6 text-center">
                                        <Link
                                            href={`/product/${item.slug || item.documentId || item.id}`}
                                            className="inline-block bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-colors"
                                        >
                                            {t('common.viewDetails')}
                                        </Link>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
