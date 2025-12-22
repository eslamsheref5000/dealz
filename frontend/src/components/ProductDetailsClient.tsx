"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import moment from "moment";
import { useLanguage } from "../context/LanguageContext";
import { useFavorites } from "../context/FavoriteContext";
import { countries } from "../data/countries";
import { useToast } from "../context/ToastContext";
import { useRecentlyViewed } from "../context/RecentlyViewedContext";
import Breadcrumb from "./Breadcrumb";
import ImageGallery from "./ImageGallery";
import SellerReviews from "./SellerReviews";
import Header from "./Header";

export default function ProductDetailsClient({ product: initialProduct, relatedProducts: initialRelated }: { product: any, relatedProducts: any[] }) {
    const { t } = useLanguage();
    const { toggleFavorite, isFavorite } = useFavorites();
    const { showToast } = useToast();
    const { addToRecentlyViewed } = useRecentlyViewed();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showNumber, setShowNumber] = useState(false);

    // Auction State
    const [product, setProduct] = useState(initialProduct);
    const [bidAmount, setBidAmount] = useState("");
    const [timeLeft, setTimeLeft] = useState("");
    const [isBidding, setIsBidding] = useState(false);
    const [recentBids, setRecentBids] = useState<any[]>([]);

    // Initial hydration
    const attrs = product;

    // Logic from original page
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
        // Fetch Current User for reviews/chat
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

        if (product) {
            addToRecentlyViewed(product.documentId || product.id);
            // Increment Views (Client Side Trigger)
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
            fetch(`${API_URL}/api/products/${product.documentId || product.id}/view`, { method: 'PUT' }).catch(console.error);
        }
    }, []); // Run once on mount

    // Real-time Polling for Auction Updates
    useEffect(() => {
        if (!product.isAuction || timeLeft === t('common.auctionEnded')) return;

        const interval = setInterval(async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
                // Need to populate bids to show history
                const res = await fetch(`${API_URL}/api/products/${product.documentId || product.id}?populate[bids][populate][bidder]=true&populate[ad_owner]=true`);
                const data = await res.json();

                if (data.data) {
                    const newProduct = data.data;

                    // Check for Anti-Sniping Extension
                    if (newProduct.auctionEndTime !== product.auctionEndTime) {
                        showToast(t('postAd.auction.auctionExtended'), "info");
                    }

                    setProduct(newProduct);

                    // Update local bids list
                    if (newProduct.bids) {
                        // Sort by amount desc
                        const sortedBids = (newProduct.bids as any[]).sort((a: any, b: any) => b.amount - a.amount);
                        setRecentBids(sortedBids.slice(0, 5)); // Show top 5
                    }
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(interval);
    }, [product.documentId, product.id, product.isAuction, product.auctionEndTime, timeLeft, t]);


    // Countdown Timer for Auctions
    useEffect(() => {
        if (!product.isAuction || !product.auctionEndTime) return;

        const timer = setInterval(() => {
            const end = moment(product.auctionEndTime);
            const now = moment();
            const duration = moment.duration(end.diff(now));

            if (duration.asSeconds() <= 0) {
                setTimeLeft(t('common.auctionEnded'));
                clearInterval(timer);
            } else {
                setTimeLeft(`${Math.floor(duration.asDays())}d ${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [product.isAuction, product.auctionEndTime, t]);


    const handlePlaceBid = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return showToast(t('reviews.loginToReview'), "error");

        const amount = parseFloat(bidAmount);
        const currentPrice = Number(product.currentBid) > 0 ? Number(product.currentBid) : Number(product.price);
        const minIncrement = Number(product.minBidIncrement || 10);

        if (amount < currentPrice + minIncrement) {
            return showToast(`${t('common.minBid')} ${currentPrice + minIncrement}`, "error");
        }

        setIsBidding(true);
        try {
            const token = localStorage.getItem("jwt");
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
            const res = await fetch(`${API_URL}/api/bids`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    data: {
                        amount: amount,
                        product: product.documentId || product.id
                    }
                })
            });

            const data = await res.json();
            if (res.ok) {
                showToast(data.meta?.message || "Bid Placed Successfully!", "success");
                setBidAmount("");
                // Immediate refresh handled by polling or response
                // Optimistically update
                setProduct({
                    ...product,
                    currentBid: amount,
                    bidCount: (product.bidCount || 0) + 1,
                    // If backend returned extension info, handle it? 
                    // Polling will catch it in 3s anyway.
                });
            } else {
                showToast(data.error?.message || "Bid Failed", "error");
            }

        } catch (err) {
            console.error(err);
            showToast("Network Error", "error");
        } finally {
            setIsBidding(false);
        }
    };

    const handleBuyNow = async () => {
        if (!currentUser) return showToast(t('reviews.loginToReview'), "error");

        if (!confirm(`${t('postAd.auction.buyNow')} ${product.buyNowPrice}?`)) return;

        setIsBidding(true);
        try {
            const token = localStorage.getItem("jwt");
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
            const res = await fetch(`${API_URL}/api/products/${product.documentId || product.id}/buy-now`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (res.ok) {
                showToast("Item Purchased Successfully! 🎉", "success");
                // Force refresh / redirect
                window.location.reload();
            } else {
                showToast(data.error?.message || "Purchase Failed", "error");
            }
        } catch (err) {
            showToast("Network Error", "error");
        } finally {
            setIsBidding(false);
        }
    };


    if (!product) return <div className="text-center py-20 text-xl text-red-500">{t('home.noProducts')}</div>;

    const isAuction = product.isAuction;
    const currentPrice = isAuction && Number(product.currentBid) > 0 ? Number(product.currentBid) : Number(product.price);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300">
            <Header />

            <main className="container mx-auto px-4 py-8">
                {/* Canonical & JSON-LD are handled in Server Page */}

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
                        <ImageGallery
                            images={attrs.images}
                            title={attrs.title}
                            isFavorite={isFavorite(attrs.documentId)}
                            onToggleFavorite={() => toggleFavorite(attrs.documentId)}
                        />

                        {/* Bid History (Only for Auctions) */}
                        {isAuction && recentBids.length > 0 && (
                            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-4">
                                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                    📜 {t('postAd.auction.bidHistory')}
                                </h3>
                                <div className="space-y-3">
                                    {recentBids.map((bid, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                                                    {bid.bidder?.username ? bid.bidder.username.substring(0, 2).toUpperCase() : '??'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                                                        {bid.bidder?.username || t('postAd.auction.bidder')}
                                                        {idx === 0 && <span className="ml-2 bg-yellow-400 text-black text-[10px] px-1 rounded">WINNING</span>}
                                                    </div>
                                                    <div className="text-xs text-gray-500">{moment(bid.publishedAt).fromNow()}</div>
                                                </div>
                                            </div>
                                            <div className="font-mono font-bold text-green-600">
                                                {Number(bid.amount).toLocaleString()} AED
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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
                                {attrs.specifications && Object.entries(attrs.specifications).map(([key, value]) => (
                                    <div key={key} className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                                        <span className="text-gray-500 dark:text-gray-400 capitalize">
                                            {/* Try to map to dictionary, fallback to key */}
                                            {t(`filters.${key}`) !== `filters.${key}` ? t(`filters.${key}`) : key}
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">{value as string}</span>
                                    </div>
                                ))}
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

                            {/* Price / Auction Block */}
                            <div className={`mb-8 p-4 rounded-xl ${isAuction ? 'bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200' : ''}`}>
                                {isAuction && (
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-yellow-700 dark:text-yellow-500 font-bold uppercase text-xs tracking-wider">
                                            {timeLeft === t('common.auctionEnded') ? '🏁 ' : '🔥 '}
                                            {timeLeft === t('common.auctionEnded') ? t('common.auctionEnded') : t('common.auctionEndsIn')}
                                        </span>
                                        <span className="font-mono font-bold text-red-600">{timeLeft}</span>
                                    </div>
                                )}

                                <div className="text-3xl font-extrabold text-red-600">
                                    {currentPrice.toLocaleString()} <span className="text-lg text-gray-500 dark:text-gray-400">
                                        {countries.find(c => c.id === attrs.country)?.currency || 'AED'}
                                    </span>
                                </div>

                                {isAuction && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        {product.bidCount || 0} {t('common.bidHistory') || "Bids"}
                                    </div>
                                )}
                            </div>

                            {/* Auction Bidding UI */}
                            {isAuction && timeLeft !== t('common.auctionEnded') && (
                                <div className="space-y-4 mb-6">
                                    {/* Buy Now Button */}
                                    {product.buyNowPrice && (
                                        <button
                                            onClick={handleBuyNow}
                                            disabled={isBidding}
                                            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 flex justify-center items-center gap-2"
                                        >
                                            🚀 {t('postAd.auction.buyNow')} @ {Number(product.buyNowPrice).toLocaleString()}
                                        </button>
                                    )}

                                    <form onSubmit={handlePlaceBid} className="animate-in fade-in">
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                required
                                                placeholder={(currentPrice + (Number(product.minBidIncrement) || 10)).toString()}
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(e.target.value)}
                                                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
                                            />
                                            <button
                                                type="submit"
                                                disabled={isBidding}
                                                className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50"
                                            >
                                                {isBidding ? "..." : t('common.placeBid')}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2 text-center">
                                            {t('common.minBid')}: {(currentPrice + (Number(product.minBidIncrement) || 10)).toLocaleString()}
                                        </p>
                                    </form>

                                </div>
                            )}


                            <div className="space-y-3">
                                {/* Phone Button - Respects Privacy */}
                                {product.showPhone !== false && (
                                    <button
                                        onClick={() => setShowNumber(true)}
                                        className={`w-full py-3 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2 shadow-lg ${showNumber
                                            ? 'bg-white text-red-600 border-2 border-red-600 hover:bg-gray-50'
                                            : 'bg-red-600 text-white hover:bg-red-700 shadow-red-200 dark:shadow-red-900/20'
                                            }`}
                                    >
                                        <span>📞</span>
                                        {showNumber ? (
                                            <a href={`tel:${attrs.phone}`} className="hover:underline">{attrs.phone}</a>
                                        ) : (
                                            t('product.showPhone')
                                        )}
                                    </button>
                                )}

                                {/* Chat Button - Respects Privacy */}
                                {product.enableChat !== false && (
                                    <Link href={`/inbox?seller=${attrs.ad_owner?.documentId || attrs.ad_owner?.id}&product=${attrs.documentId}`} className="w-full bg-green-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-600 transition flex items-center justify-center gap-2 shadow-lg shadow-green-200 dark:shadow-green-900/20">
                                        <span>💬</span> {t('product.chatSeller')}
                                    </Link>
                                )}

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
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {initialRelated.length > 0 && (
                    <div className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-12">
                        <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">{t('product.relatedProducts')}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {initialRelated.map((ad: any) => (
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
