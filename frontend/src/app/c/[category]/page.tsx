"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "../../../components/Header";
import ProductCard from "../../../components/ProductCard";
import ProductSkeleton from "../../../components/ProductSkeleton";
import { useLanguage } from "../../../context/LanguageContext";
import { useCountry } from "../../../context/CountryContext";
import Link from "next/link";

export default function CategoryPage() {
    const params = useParams();
    const categoryName = decodeURIComponent(params?.category as string);
    const [products, setProducts] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();
    const { selectedCountry } = useCountry();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';

            try {
                // Fetch Products
                const productRes = await fetch(`${API_URL}/api/products?populate=*&filters[country][$eq]=${selectedCountry.id}&filters[category][name][$eq]=${encodeURIComponent(categoryName)}&filters[approvalStatus][$eq]=approved&sort[0]=isFeatured:desc&sort[1]=publishedAt:desc`);
                const productData = await productRes.json();
                setProducts(productData.data || []);

                // Fetch Subcategories
                const subCatRes = await fetch(`${API_URL}/api/sub-categories?filters[category][name][$eq]=${encodeURIComponent(categoryName)}`);
                const subCatData = await subCatRes.json();
                setSubCategories(subCatData.data || []);

            } catch (error) {
                console.error("Error fetching category data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (categoryName) {
            fetchData();
        }
    }, [categoryName, selectedCountry.id]);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
            <Header />

            <main className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white capitalize mb-4">
                        {categoryName}
                    </h1>

                    {/* Subcategories Pills */}
                    {subCategories.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href={`/c/${params?.category}`}
                                className="px-4 py-2 rounded-full text-sm font-bold bg-gray-900 text-white dark:bg-white dark:text-gray-900 transition-colors"
                            >
                                {t('common.all')}
                            </Link>
                            {subCategories.map((sub: any) => (
                                <Link
                                    key={sub.id}
                                    href={`/c/${encodeURIComponent(categoryName)}/${encodeURIComponent(sub.name)}`}
                                    className="px-4 py-2 rounded-full text-sm font-bold bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {sub.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Products Grid */}
                {loading ? (
                    <ProductSkeleton />
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {products.map((product) => (
                            <div key={product.id} className="h-full">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl">
                        <div className="text-6xl mb-4">🔍</div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('home.noProducts')}</h2>
                        <p className="text-gray-500">{t('home.tryAdjustingFilters')}</p>
                    </div>
                )}
            </main>
        </div>
    );
}
