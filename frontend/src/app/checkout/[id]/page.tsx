"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "../../../context/LanguageContext";
import { useCountry } from "../../../context/CountryContext";
import { useToast } from "../../../context/ToastContext";
import Header from "../../../components/Header";
import { CreditCard, Smartphone, ShieldCheck, Loader2 } from "lucide-react";
import PaymobCheckout from "../../../components/PaymobCheckout";
import ManualPaymentForm from "../../../components/ManualPaymentForm";

export default function CheckoutPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useLanguage();
    const { selectedCountry } = useCountry();
    const { showToast } = useToast();

    // Data State
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Payment Logic State
    const [selectedMethod, setSelectedMethod] = useState<'card' | 'instapay'>('card');
    const [paymobUrl, setPaymobUrl] = useState<string | null>(null);
    const [manualTxId, setManualTxId] = useState<string | null>(null);

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

    // Price Logic (Memoized calculation would be better but this is fine)
    const getPrice = () => {
        if (!product) return 0;
        if (product.isAuction) {
            return (product.buyNowPrice && !product.winner)
                ? Number(product.buyNowPrice)
                : (Number(product.currentBid) > 0 ? Number(product.currentBid) : Number(product.price));
        }
        return Number(product.price);
    };

    const price = getPrice();
    const shippingCost = Number(product?.shippingCost) || 0;
    const total = price + shippingCost;


    const handlePayment = async () => {
        setProcessing(true);
        try {
            const token = localStorage.getItem("jwt");
            if (!token) {
                showToast("Please login to continue", "error");
                router.push("/login"); // Fixed route
                return;
            }

            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';

            // 1. Create Transaction Record (Pending)
            const txRes = await fetch(`${API_URL}/api/transactions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    data: {
                        product: product.documentId || product.id,
                        paymentMethod: selectedMethod,
                        amount: total,
                        status: 'pending_payment' // Initial status
                    }
                })
            });

            const txData = await txRes.json();

            if (!txRes.ok) throw new Error(txData.error?.message || "Failed to initiate transaction");

            const transactionId = txData.data.documentId || txData.data.id;

            // 2. Route based on Method
            if (selectedMethod === 'card') {
                // Initiate Paymob
                const payRes = await fetch(`${API_URL}/api/payment/paymob/initiate`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        amount: total,
                        transactionId: transactionId,
                        orderType: "product"
                        // billingData can be passed here if we had a form for address
                    })
                });

                const payData = await payRes.json();
                if (!payData.iframeUrl) throw new Error("Failed to get payment URL");

                setPaymobUrl(payData.iframeUrl);

            } else {
                // Open Manual Upload Modal
                setManualTxId(transactionId);
            }

        } catch (err: any) {
            console.error(err);
            showToast(err.message || "Network Error", "error");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">{t('common.loading')}</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center text-red-500">{t('home.noProducts')}</div>;

    const shippingMethod = product.shippingMethod || 'pickup';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
            <Header />
            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                    <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6 text-white text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="text-4xl mb-2 relative z-10">🛡️</div>
                        <h1 className="text-2xl font-bold relative z-10">{t('checkout.title')}</h1>
                        <p className="opacity-90 text-sm relative z-10">{t('checkout.subtitle')}</p>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Product Summary */}
                        <div className="flex gap-4 items-start pb-6 border-b border-gray-100 dark:border-gray-800">
                            <img
                                src={product.images?.[0]?.url.startsWith('http') ? product.images[0].url : `${process.env.NEXT_PUBLIC_API_URL}${product.images?.[0]?.url}`}
                                className="w-24 h-24 object-cover rounded-lg bg-gray-100 ring-1 ring-gray-200"
                                alt={product.title}
                            />
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight mb-1">{product.title}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1"><span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{product.city}</span></p>
                            </div>
                        </div>

                        {/* Payment Method Selection */}
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Select Payment Method</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-all ${selectedMethod === 'card' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        className="hidden"
                                        checked={selectedMethod === 'card'}
                                        onChange={() => setSelectedMethod('card')}
                                    />
                                    <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center">
                                        {selectedMethod === 'card' && <div className="w-3 h-3 bg-purple-600 rounded-full"></div>}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <CreditCard size={18} className="text-purple-600" />
                                            Credit Card
                                        </div>
                                        <div className="text-xs text-gray-500">Visa, Mastercard, & more</div>
                                    </div>
                                    <img src="https://paymob.com/images/logo.png" className="h-4" alt="Paymob" />
                                </label>

                                <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-all ${selectedMethod === 'instapay' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        className="hidden"
                                        checked={selectedMethod === 'instapay'}
                                        onChange={() => setSelectedMethod('instapay')}
                                    />
                                    <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center">
                                        {selectedMethod === 'instapay' && <div className="w-3 h-3 bg-purple-600 rounded-full"></div>}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Smartphone size={18} className="text-purple-600" />
                                            InstaPay / Wallet
                                        </div>
                                        <div className="text-xs text-gray-500">Manual Transfer & Upload</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="space-y-3 text-sm bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>{t('checkout.itemPrice')}</span>
                                <span>{Number(price).toLocaleString()} {selectedCountry.currency}</span>
                            </div>

                            {shippingCost > 0 && (
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>
                                        {t('checkout.shipping')}
                                        <span className="text-xs ml-1 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded capitalize">
                                            {t(`postAd.shipping.methods.${shippingMethod}`) || shippingMethod}
                                        </span>
                                    </span>
                                    <span>{shippingCost.toLocaleString()} {selectedCountry.currency}</span>
                                </div>
                            )}

                            <div className="flex justify-between font-bold text-xl text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">
                                <span>{t('checkout.total')}</span>
                                <span>{total.toLocaleString()} {selectedCountry.currency}</span>
                            </div>
                        </div>

                        {/* Security Notice */}
                        <div className="flex gap-3 items-start text-xs text-gray-500 bg-green-50 dark:bg-green-900/10 p-4 rounded-lg">
                            <ShieldCheck className="text-green-600 shrink-0" size={16} />
                            <p>
                                <strong>Secure Escrow:</strong> Your payment is held safely until you confirm receipt of the item. We protect you from fraud.
                            </p>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={processing}
                            className="w-full bg-slate-900 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white py-4 rounded-xl font-bold text-lg transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {processing ? <Loader2 className="animate-spin" /> : (selectedMethod === 'card' ? `Pay ${total.toLocaleString()} ${selectedCountry.currency}` : "Proceed to Transfer")}
                        </button>
                    </div>
                </div>
            </main>

            {/* Modals */}
            {paymobUrl && (
                <PaymobCheckout
                    iframeUrl={paymobUrl}
                    onClose={() => setPaymobUrl(null)}
                />
            )}

            {manualTxId && (
                <ManualPaymentForm
                    transactionId={manualTxId}
                    amount={total}
                    onSuccess={() => {
                        setManualTxId(null);
                        router.push("/profile?tab=orders");
                    }}
                    onCancel={() => setManualTxId(null)}
                />
            )}
        </div>
    );
}

