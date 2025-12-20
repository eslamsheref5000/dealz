"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "../../../../components/Header";
import ProductCard from "../../../../components/ProductCard";
import ProductSkeleton from "../../../../components/ProductSkeleton";
import { useLanguage } from "../../../../context/LanguageContext";
import { useCountry } from "../../../../context/CountryContext";
import Link from "next/link";
import Breadcrumb from "../../../../components/Breadcrumb";

export default function SubCategoryPage() {
    const params = useParams();
    // Safe decoding with fallback
    const categoryName = params?.category ? decodeURIComponent(params.category as string) : "";
    const subCategoryName = params?.subcategory ? decodeURIComponent(params.subcategory as string) : "";

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();
    const { selectedCountry } = useCountry();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';

            try {
                const productRes = await fetch(`${API_URL}/api/products?populate=*&filters[country][$eq]=${selectedCountry.id}&filters[category][name][$eq]=${encodeURIComponent(categoryName)}&filters[sub_category][name][$eq]=${encodeURIComponent(subCategoryName)}&filters[approvalStatus][$eq]=approved&sort[0]=isFeatured:desc&sort[1]=publishedAt:desc`);
                const productData = await productRes.json();
                setProducts(productData.data || []);
            } catch (error) {
                console.error("Error fetching sub-category data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (subCategoryName) {
            fetchData();
        }
    }, [subCategoryName, categoryName, selectedCountry.id]);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <Breadcrumb
                    items={[
                        { label: categoryName, href: `/c/${encodeURIComponent(categoryName)}` },
                        { label: subCategoryName }
                    ]}
                />

                <div className="mb-8 mt-4 flex items-center justify-between">
                    <div>
                        <Link href={`/c/${encodeURIComponent(categoryName)}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 mb-2 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 rtl:rotate-180">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            {t('common.back')}
                        </Link>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white capitalize">
                            {t(`subCategories.${subCategoryName}`) || subCategoryName}
                        </h1>
                        <p className="text-gray-500 mt-1">{t('common.browseAdsIn')} {t(`subCategories.${subCategoryName}`) || subCategoryName}</p>
                    </div>
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
                        <Link href={`/c/${encodeURIComponent(categoryName)}`} className="text-red-600 hover:underline font-bold">
                            {t('common.viewAll')} {t(`categories.${categoryName}`) || categoryName}
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
