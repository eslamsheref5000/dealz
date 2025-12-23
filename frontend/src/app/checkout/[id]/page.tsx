"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "../../../context/LanguageContext";
import { useToast } from "../../../context/ToastContext";
import Header from "../../../components/Header";

export default function CheckoutPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
                const res = await fetch(`${API_URL}/api/products/${id}?populate=*`);
                const data = await res.json();
                if (data.data) {
                    setProduct(data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProduct();
    }, [id]);

    const handlePayment = async () => {
        setProcessing(true);
        try {
            const token = localStorage.getItem("jwt");
            if (!token) {
                showToast("Please login to continue", "error");
                router.push("/login");
                return;
            }

            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
            const res = await fetch(`${API_URL}/api/transactions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    data: {
                        product: product.documentId || product.id,
                        paymentMethod: "card"
                    }
                })
            });

            const data = await res.json();

            if (res.ok) {
                showToast("Payment Successful! Funds held in Escrow.", "success");
                setTimeout(() => router.push("/profile?tab=orders"), 2000);
            } else {
                showToast(data.error?.message || "Payment Failed", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Network Error", "error");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center text-red-500">Product not found</div>;

    // Price Logic
    let price;
    if (product.isAuction) {
        // If auction, use highest bid OR buy now price if specified in query/state? 
        // For simplicity, we assume if they are here via buy-now button on auction, it might be BuyNowPrice.
        // But usually currentBid is the winning bid.
        // Let's assume: if winner exists (post-auction), use currentBid.
        // If pre-auction buy-now, use buyNowPrice.

        // Actually, let's look at the product state. 
        // If the user clicked "Buy Now" on an active auction, the backend should probably lock it or we pass a query param.
        // For now, let's use the BuyNowPrice if it exists and auction is active, else currentBid.
        // A safer bet for MVP: Use BuyNowPrice if checking out an active auction via Buy Now button.
        // But the previous page logic just sends them here.
        // Let's use:
        price = (product.isAuction && product.buyNowPrice && !product.winner)
            ? Number(product.buyNowPrice)
            : (Number(product.currentBid) > 0 ? Number(product.currentBid) : Number(product.price));
    } else {
        price = Number(product.price);
    }

    // Shipping Logic
    const shippingCost = Number(product.shippingCost) || 0;
    const shippingMethod = product.shippingMethod || 'pickup';

    const fee = price * 0.05; // 5% Buyer Protection
    const total = price + fee + shippingCost;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Header />
            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                    <div className="bg-green-600 p-6 text-white text-center">
                        <div className="text-4xl mb-2">🛡️</div>
                        <h1 className="text-2xl font-bold">Secure Checkout</h1>
                        <p className="opacity-90">Your payment is held safely in Dealz Escrow until you receive the item.</p>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="flex gap-4 items-start pb-6 border-b border-gray-100 dark:border-gray-800">
                            <img
                                src={product.images?.[0]?.url.startsWith('http') ? product.images[0].url : `${process.env.NEXT_PUBLIC_API_URL}${product.images?.[0]?.url}`}
                                className="w-24 h-24 object-cover rounded-lg bg-gray-100"
                                alt={product.title}
                            />
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{product.title}</h3>
                                <p className="text-sm text-gray-500">{product.city}</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>{t('checkout.itemPrice') || "Item Price"}</span>
                                <span>{Number(price).toLocaleString()} AED</span>
                            </div>

                            {shippingCost > 0 && (
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>
                                        {t('postAd.shipping.title') || "Shipping"}
                                        <span className="text-xs ml-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded capitalize">
                                            ({t(`postAd.shipping.methods.${shippingMethod}`) || shippingMethod})
                                        </span>
                                    </span>
                                    <span>{shippingCost.toLocaleString()} AED</span>
                                </div>
                            )}

                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>{t('checkout.buyerProtection') || "Buyer Protection Fee"} (5%)</span>
                                <span>{fee.toLocaleString()} AED</span>
                            </div>
                            <div className="flex justify-between font-bold text-xl text-gray-900 dark:text-white pt-4 border-t border-gray-100 dark:border-gray-800">
                                <span>Total to Pay</span>
                                <span>{total.toLocaleString()} AED</span>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
                            <strong>How it works:</strong>
                            <ol className="list-decimal ml-4 mt-2 space-y-1">
                                <li>{t('checkout.step1') || "You pay now, money is held securely."}</li>
                                <li>{t('checkout.step2') || "Seller ships the item to you."}</li>
                                <li>{t('checkout.step3') || "You inspect and confirm receipt."}</li>
                                <li>{t('checkout.step4') || "Money is released to the seller."}</li>
                            </ol>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={processing}
                            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {processing ? "Processing..." : "Confirm & Pay Now 🔒"}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
