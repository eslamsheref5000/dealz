"use client";

import { useLanguage } from "../context/LanguageContext";

interface AdvancedFiltersProps {
    category: string;
    filters: any;
    setFilters: (filters: any) => void;
    onApply: () => void;
}

export default function AdvancedFilters({ category, filters, setFilters, onApply }: AdvancedFiltersProps) {
    const { t } = useLanguage();

    if (!category || (category !== "Motors" && category !== "Properties")) return null;

    const handleChange = (name: string, value: string) => {
        setFilters({ ...filters, [name]: value });
    };

    return (
        <div className="bg-white/5 dark:bg-gray-900/50 backdrop-blur-xl border border-white/20 dark:border-gray-800 p-6 rounded-3xl mb-8 animate-in fade-in slide-in-from-top-4 duration-500 shadow-2xl">
            <div className="flex flex-wrap gap-6 items-end">
                {category === "Motors" && (
                    <>
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ltr:ml-1 rtl:mr-1">
                                {t('filters.year') || "Year"}
                            </label>
                            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 border border-gray-200 dark:border-gray-700">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-full bg-transparent px-3 py-2 text-sm focus:outline-none"
                                    value={filters.minYear || ""}
                                    onChange={(e) => handleChange("minYear", e.target.value)}
                                />
                                <div className="w-[1px] bg-gray-300 dark:bg-gray-700 mx-1"></div>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="w-full bg-transparent px-3 py-2 text-sm focus:outline-none"
                                    value={filters.maxYear || ""}
                                    onChange={(e) => handleChange("maxYear", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ltr:ml-1 rtl:mr-1">
                                {t('filters.mileage') || "Mileage (km)"}
                            </label>
                            <input
                                type="number"
                                placeholder="Max KM"
                                className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-red-500 outline-none transition"
                                value={filters.maxKM || ""}
                                onChange={(e) => handleChange("maxKM", e.target.value)}
                            />
                        </div>
                    </>
                )}

                {category === "Properties" && (
                    <>
                        <div className="flex-1 min-w-[120px]">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ltr:ml-1 rtl:mr-1">
                                {t('filters.bedrooms') || "Bedrooms"}
                            </label>
                            <select
                                className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-red-500 outline-none transition appearance-none"
                                value={filters.bedrooms || ""}
                                onChange={(e) => handleChange("bedrooms", e.target.value)}
                            >
                                <option value="">Any</option>
                                <option value="1">1+</option>
                                <option value="2">2+</option>
                                <option value="3">3+</option>
                                <option value="4">4+</option>
                                <option value="5">5+</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[120px]">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ltr:ml-1 rtl:mr-1">
                                {t('filters.bathrooms') || "Bathrooms"}
                            </label>
                            <select
                                className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-red-500 outline-none transition appearance-none"
                                value={filters.bathrooms || ""}
                                onChange={(e) => handleChange("bathrooms", e.target.value)}
                            >
                                <option value="">Any</option>
                                <option value="1">1+</option>
                                <option value="2">2+</option>
                                <option value="3">3+</option>
                                <option value="4">4+</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ltr:ml-1 rtl:mr-1">
                                {t('filters.area') || "Area (sqft)"}
                            </label>
                            <input
                                type="number"
                                placeholder="Min sqft"
                                className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-red-500 outline-none transition"
                                value={filters.minArea || ""}
                                onChange={(e) => handleChange("minArea", e.target.value)}
                            />
                        </div>
                    </>
                )}

                <button
                    onClick={onApply}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-2xl font-bold transition shadow-lg shadow-red-200 dark:shadow-red-900/20 whitespace-nowrap"
                >
                    {t('filters.apply') || "Apply Filters"}
                </button>
            </div>
        </div>
    );
}
