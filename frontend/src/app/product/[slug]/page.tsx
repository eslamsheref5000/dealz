"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "../../../components/Header";
import moment from "moment";

import { useLanguage } from "../../../context/LanguageContext";
import { useFavorites } from "../../../context/FavoriteContext";
import { countries } from "../../../context/CountryContext";
import { useToast } from "../../../context/ToastContext";
import { useRecentlyViewed } from "../../../context/RecentlyViewedContext";
import Breadcrumb from "../../../components/Breadcrumb";
import ProductSkeleton from "../../../components/ProductSkeleton";
import ImageGallery from "../../../components/ImageGallery";

import SellerReviews from "../../../components/SellerReviews";

export default function ProductDetails() {
    const params = useParams();
    const slug = params?.slug as string;
    const { t } = useLanguage();
    const { toggleFavorite, isFavorite } = useFavorites();
    const { showToast } = useToast();
    const { addToRecentlyViewed } = useRecentlyViewed();

    const [product, setProduct] = useState<any>(null);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const handleShare = () => {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: product?.title,
                text: product?.description,
                url: url
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(url);
            showToast("Link copied to clipboard!", "success");
        }
    };

    useEffect(() => {
        // Fetch Current User
        const token = localStorage.getItem("jwt");
        if (token) {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
            fetch(`${API_URL}/api/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setCurrentUser(data))
                .catch(err => console.error(err));
        }

        if (slug) {
            // Fetch product by slug
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
            fetch(`${API_URL}/api/products?filters[slug][$eq]=${slug}&populate=*`)
                .then(res => res.json())
                .then(data => {
                    if (data.data && data.data.length > 0) {
                        const productData = data.data[0];
                        setProduct(productData);
                        addToRecentlyViewed(productData.documentId || productData.id);

                        // Fetch related products
                        if (productData.category?.id) {
                            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
                            fetch(`${API_URL}/api/products?filters[category][id][$eq]=${productData.category.id}&filters[documentId][$ne]=${productData.documentId}&populate=*&pagination[limit]=4`)
                                .then(res => res.json())
                                .then(relData => setRelatedProducts(relData.data));
                        }
                    }
                    setLoading(false);
                })
                .catch(err => setLoading(false));
        }
    }, [slug]);

    if (loading) return (
        <div className="container mx-auto px-4 py-8">
            <ProductSkeleton />
        </div>
    );
    if (!product) return <div className="text-center py-20 text-xl text-red-500">{t('home.noProducts')}</div>;

    const attrs = product;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <Breadcrumb
                    items={[
                        { label: attrs.category?.name || "Category", href: `/?category=${attrs.category?.name}` },
                        ...(attrs.sub_category?.name ? [{ label: attrs.sub_category.name, href: `/?category=${attrs.category?.name}&subCat=${attrs.sub_category.name}` }] : []),
                        { label: attrs.title }
                    ]}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Images & Desc */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Gallery */}
                        <ImageGallery
                            images={attrs.images}
                            title={attrs.title}
                            isFavorite={isFavorite(attrs.documentId)}
                            onToggleFavorite={() => toggleFavorite(attrs.documentId)}
                        />

                        {/* Description */}
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('product.description')}</h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                {attrs.description}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{t('product.details')}</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                                    <span className="text-gray-500 dark:text-gray-400">{t('postAd.labels.category')}</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{attrs.category?.name || "General"}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                                    <span className="text-gray-500 dark:text-gray-400">{t('postAd.labels.city')}</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{attrs.city}</span>
                                </div>
                            </div>
                        </div>

                        {/* Seller Reviews */}
                        {attrs.ad_owner && (
                            <SellerReviews
                                sellerId={attrs.ad_owner.id || attrs.ad_owner.documentId}
                                currentUserId={currentUser?.id}
                            />
                        )}
                    </div>

                    {/* Right Column: Price & Seller */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 sticky top-4">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
                                    {attrs.title}
                                </h1>
                                <div className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
                                    <span>📍 {attrs.city}</span>
                                    <span>•</span>
                                    <span>{t('product.postedOn')} {moment(attrs.publishedAt).fromNow()}</span>
                                    <span>•</span>
                                    <span>👁️ {attrs.views || 0} {t('product.viewsCount')}</span>
                                </div>
                            </div>

                            <div className="text-3xl font-extrabold text-red-600 mb-8">
                                {attrs.price?.toLocaleString()} <span className="text-lg text-gray-500 dark:text-gray-400">
                                    {countries.find(c => c.id === attrs.country)?.currency || 'AED'}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <button className="w-full bg-red-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-lg shadow-red-200 dark:shadow-red-900/20">
                                    <span>📞</span> {attrs.phone || t('product.showPhone')}
                                </button>

                                <Link href={`/inbox?seller=${attrs.ad_owner?.documentId || attrs.ad_owner?.id}&product=${attrs.documentId}`} className="w-full bg-green-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-600 transition flex items-center justify-center gap-2 shadow-lg shadow-green-200 dark:shadow-green-900/20">
                                    <span>💬</span> {t('product.chatSeller')}
                                </Link>

                                <button onClick={handleShare} className="w-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 py-3 rounded-xl font-bold text-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition flex items-center justify-center gap-2">
                                    <span>🔗</span> {t('product.share')}
                                </button>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3">{t('product.sellerInfo')}</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center text-xl">👤</div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            {attrs.ad_owner?.username || t('product.unknownUser')}
                                            {attrs.ad_owner?.isVerified && (
                                                <span className="text-blue-500 text-lg" title="Verified User">✓</span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('product.memberSince')} {moment(attrs.ad_owner?.createdAt).format("YYYY")}</div>
                                        {/* Badges */}
                                        <div className="flex flex-wrap gap-2">
                                            {attrs.ad_owner?.isVerified && (
                                                <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
                                                    <span>🛡️</span> {t('profile.identityVerification')}
                                                </span>
                                            )}
                                            {moment().diff(moment(attrs.ad_owner?.createdAt), 'days') > 7 && (
                                                <span className="flex items-center gap-1 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-100 dark:border-green-800">
                                                    <span>⚡</span> {t('product.quickResponder')}
                                                </span>
                                            )}
                                            {moment().diff(moment(attrs.ad_owner?.createdAt), 'days') > 30 && (
                                                <span className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/10 text-yellow-600 dark:text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-yellow-100 dark:border-yellow-800">
                                                    <span>🏆</span> {t('product.trustedSeller')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Related Products */}
                {/* Note: Updated links below to use slug if available, but for now related products might link to ID unless I update them too. Let's update them to verify properly. */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-12">
                        <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">{t('product.relatedProducts')}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((ad: any) => (
                                <Link href={`/product/${ad.slug || ad.documentId}`} key={ad.documentId} className="group">
                                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100 dark:border-gray-800 h-full flex flex-col">
                                        <div className="relative h-48 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                                            <img
                                                src={ad.images && ad.images.length > 0 ? (ad.images[0].url.startsWith('http') ? ad.images[0].url : `${process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space'}${ad.images[0].url}`) : "https://placehold.co/600x400/png?text=No+Image"}
                                                alt={ad.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                            />
                                        </div>
                                        <div className="p-4 flex-grow">
                                            <h3 className="font-bold text-gray-900 dark:text-white truncate mb-2">{ad.title}</h3>
                                            <div className="text-red-600 font-bold text-lg">
                                                {ad.price?.toLocaleString()} {countries.find(c => c.id === ad.country)?.currency || 'AED'}
                                            </div>
                                            <div className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                                                <span>📍</span> {ad.city}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
