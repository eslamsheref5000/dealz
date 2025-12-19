"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import moment from "moment";

interface Review {
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
    reviewer?: {
        username: string;
    };
}

interface SellerReviewsProps {
    sellerId: string | number;
    currentUserId?: string | number;
}

export default function SellerReviews({ sellerId, currentUserId }: SellerReviewsProps) {
    const { t } = useLanguage();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchReviews = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
            const res = await fetch(`${API_URL}/api/reviews?filters[seller][id][$eq]=${sellerId}&populate[reviewer]=*&sort[0]=createdAt:desc`);
            const data = await res.json();
            const formattedReviews = (data.data || []).map((item: any) => {
                // Strapi 5 may return flat structure (item) or Strapi 4 style (item.attributes)
                const attributes = item.attributes || item;
                const reviewerData = attributes.reviewer?.data?.attributes || attributes.reviewer;

                return {
                    id: item.id,
                    rating: attributes.rating,
                    comment: attributes.comment,
                    createdAt: attributes.createdAt,
                    reviewer: reviewerData
                };
            });
            setReviews(formattedReviews);
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        }
    };

    useEffect(() => {
        if (sellerId) fetchReviews();
    }, [sellerId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUserId) return alert(t('reviews.loginToReview'));

        setSubmitting(true);
        try {
            const token = localStorage.getItem("jwt");
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
            const res = await fetch(`${API_URL}/api/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    data: {
                        rating: Number(rating),
                        comment,
                        seller: Number(sellerId),
                        reviewer: Number(currentUserId)
                    }
                })
            });

            if (res.ok) {
                setComment("");
                setRating(5);
                fetchReviews(); // Refresh list
            } else {
                const errorText = await res.text();
                console.error("Raw Error Response:", errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    console.error("Parsed Error:", errorData);
                    alert(`Failed to post review: ${errorData.error?.message || errorData.message || "Unknown error"}`);
                } catch (e) {
                    alert(`Failed to post review: ${errorText}`);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mt-8">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <span>⭐</span> {t('reviews.title')} ({reviews.length})
            </h3>

            {/* Review List */}
            <div className="space-y-6 mb-8 max-h-96 overflow-y-auto pr-2">
                {reviews.length === 0 ? (
                    <p className="text-gray-500 italic">{t('reviews.noReviews')}</p>
                ) : (
                    reviews.map((rev) => (
                        <div key={rev.id} className="border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0">
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-bold text-gray-900 dark:text-white">
                                    {rev.reviewer?.username || t('product.unknownUser')}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {moment(rev.createdAt).fromNow()}
                                </div>
                            </div>
                            <div className="text-yellow-400 text-sm mb-1">
                                {"⭐".repeat(rev.rating)}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                                {rev.comment}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {/* Submit Form */}
            {currentUserId && String(currentUserId) !== String(sellerId) && (
                <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                    <h4 className="font-bold mb-3 text-sm uppercase text-gray-500">{t('reviews.writeReview')}</h4>
                    <div className="flex gap-2 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                onClick={() => setRating(star)}
                                className={`text-2xl transition hover:scale-110 ${rating >= star ? 'grayscale-0' : 'grayscale opacity-30'}`}
                            >
                                ⭐
                            </button>
                        ))}
                    </div>
                    <textarea
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={t('reviews.shareExperience')}
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition w-full disabled:opacity-50"
                    >
                        {submitting ? t('reviews.posting') : t('reviews.postBtn')}
                    </button>
                </form>
            )}
        </div>
    );
}
