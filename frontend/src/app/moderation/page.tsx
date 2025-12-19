"use client";

import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { countries } from "../../context/CountryContext";
import moment from "moment";

export default function ModerationPage() {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [ads, setAds] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [expandedAdId, setExpandedAdId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'kyc' | 'settings'>('pending');
    const [globalSettings, setGlobalSettings] = useState<{ allowFeaturedAds: boolean }>({ allowFeaturedAds: true });
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.isAdmin) {
                setIsAdmin(true);
                if (activeTab === 'kyc') {
                    fetchUsers();
                } else if (activeTab === 'settings') {
                    fetchSettings();
                } else {
                    fetchAds();
                }
            } else {
                window.location.href = "/";
            }
        } else {
            window.location.href = "/login";
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        setLoading(true);
        const token = localStorage.getItem("jwt");
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1338';
            const res = await fetch(`${API_URL}/api/moderation/kyc/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch KYC requests");
            const data = await res.json();
            setUsers(data.data || []);
        } catch (err: any) {
            showToast(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchAds = async () => {
        setLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1338';
            const res = await fetch(`${API_URL}/api/products?filters[approvalStatus][$eq]=${activeTab}&populate=*&sort=createdAt:desc`);
            if (!res.ok) throw new Error("Failed to fetch ads");
            const data = await res.json();
            setAds(data.data || []);
        } catch (err: any) {
            showToast(`Failed to fetch ads: ${err.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        setLoading(true);
        const token = localStorage.getItem("jwt");
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1338';
            const res = await fetch(`${API_URL}/api/moderation/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const result = await res.json();
                setGlobalSettings(result.data.data || result.data);
            }
        } catch (err) {
            showToast("Failed to fetch global settings", "error");
        } finally {
            setLoading(false);
        }
    };

    const updateGlobalSettings = async (newData: any) => {
        setSavingSettings(true);
        const token = localStorage.getItem("jwt");
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1338';
            const res = await fetch(`${API_URL}/api/moderation/settings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ data: newData })
            });
            if (res.ok) {
                showToast("Settings updated successfully", "success");
                setGlobalSettings(newData);
            } else {
                showToast("Failed to update settings", "error");
            }
        } catch (err) {
            showToast("Error updating settings", "error");
        } finally {
            setSavingSettings(false);
        }
    };

    const handleAction = async (id: string, action: 'approve' | 'reject' | 'delete' | 'disable' | 'approveKYC' | 'rejectKYC') => {
        const token = localStorage.getItem("jwt");
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1338';
            let res;
            if (action === 'delete') {
                res = await fetch(`${API_URL}/api/products/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else if (action === 'approveKYC' || action === 'rejectKYC') {
                const endpoint = action === 'approveKYC' ? 'approve' : 'reject';
                res = await fetch(`${API_URL}/api/moderation/kyc/${id}/${endpoint}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                res = await fetch(`${API_URL}/api/products/${id}/${action}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            if (res.ok) {
                showToast(`Action performed successfully`, "success");
                if (activeTab === 'kyc') fetchUsers(); else fetchAds();
            } else {
                showToast(`Failed to perform action`, "error");
            }
        } catch (err) {
            showToast(`Error performing action`, "error");
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Moderation & Management</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage all ads on the platform</p>
                    </div>
                    <button
                        onClick={fetchAds}
                        className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        🔄 Refresh
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`pb-4 px-4 font-bold transition-all relative ${activeTab === 'pending' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        🕒 Pending Review
                        {activeTab === 'pending' && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">{ads.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('approved')}
                        className={`pb-4 px-4 font-bold transition-all ${activeTab === 'approved' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        ✅ Active Ads
                    </button>
                    <button
                        onClick={() => setActiveTab('kyc')}
                        className={`pb-4 px-4 font-bold transition-all relative ${activeTab === 'kyc' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        🛡️ KYC Verification
                        {users.length > 0 && <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">{users.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`pb-4 px-4 font-bold transition-all relative ${activeTab === 'settings' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        ⚙️ Global Settings
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    </div>
                ) : (activeTab === 'kyc' ? users.length === 0 : ads.length === 0) ? (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-800">
                        <div className="text-5xl mb-4">✨</div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nothing found here</h2>
                        <p className="text-gray-500">Everything looks clean in this category!</p>
                    </div>
                ) : activeTab === 'settings' ? (
                    <div className="max-w-2xl mx-auto py-8">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="p-8 border-b dark:border-gray-800 bg-purple-50/50 dark:bg-purple-900/10">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    ⚙️ Platform Configuration
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400">Manage global features and site-wide rules</p>
                            </div>
                            <div className="p-8 space-y-8">
                                <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Featured Ads Feature</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Allow users to pay and request their ads to be featured on top.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={globalSettings.allowFeaturedAds}
                                            onChange={(e) => updateGlobalSettings({ ...globalSettings, allowFeaturedAds: e.target.checked })}
                                            disabled={savingSettings}
                                        />
                                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>

                                <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl flex gap-3">
                                    <span className="text-xl">⚠️</span>
                                    <div className="text-sm text-orange-800 dark:text-orange-300">
                                        <b>Important:</b> Disabling "Featured Ads" will hide the payment options and featured request sections from the "Post Ad" page for all users immediately.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'kyc' ? (
                    <div className="grid gap-6">
                        {users.map((u) => (
                            <div key={u.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row gap-8">
                                        {/* User Info */}
                                        <div className="flex-grow space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl uppercase">
                                                    {u.username?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold dark:text-white">{u.fullName || u.username}</h3>
                                                    <p className="text-sm text-gray-500">{u.email}</p>
                                                </div>
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-sm">
                                                <div><span className="text-gray-500 block">ID Type</span> <span className="font-bold dark:text-white uppercase">{u.kycType}</span></div>
                                                <div><span className="text-gray-500 block">Full Name</span> <span className="font-bold dark:text-white">{u.fullName || 'N/A'}</span></div>
                                                <div className="sm:col-span-2"><span className="text-gray-500 block">Address</span> <span className="font-bold dark:text-white">{u.address || 'N/A'}</span></div>
                                            </div>
                                        </div>

                                        {/* Document Preview */}
                                        <div className="w-full md:w-64 h-48 bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 relative group">
                                            {u.kycDocument?.[0]?.url || u.kycDocument?.url ? (
                                                <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1338'}${u.kycDocument?.[0]?.url || u.kycDocument?.url}`} target="_blank" className="block w-full h-full">
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1338'}${u.kycDocument?.[0]?.url || u.kycDocument?.url}`}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                                        alt="KYC Document"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                                                        VIEW FULL IMAGE
                                                    </div>
                                                </a>
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                                    <span className="text-3xl">📄</span>
                                                    No Document Attached
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-row md:flex-col gap-2 justify-center">
                                            <button
                                                onClick={() => handleAction(u.id, 'approveKYC')}
                                                className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-100 dark:shadow-none"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(u.id, 'rejectKYC')}
                                                className="px-8 py-3 bg-white dark:bg-gray-800 text-red-600 border border-red-200 dark:border-red-900/50 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {ads.map((ad) => (
                            <div key={ad.documentId} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6 flex flex-col md:flex-row gap-6">
                                    {/* Ad Preview Image */}
                                    <div className="w-full md:w-48 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                        {ad.images?.[0] ? (
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1338'}${ad.images[0].url}`}
                                                alt={ad.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                        )}
                                    </div>

                                    {/* Ad Details Summary */}
                                    <div className="flex-grow">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">{ad.title}</h3>
                                            <span className="text-lg font-black text-red-600">{ad.price?.toLocaleString()} {countries.find(c => c.id === ad.country)?.currency || 'AED'}</span>
                                        </div>

                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            <div><span className="font-bold">User:</span> {ad.ad_owner?.username || 'Unknown'}</div>
                                            <div><span className="font-bold">Category:</span> {ad.category?.name || 'Uncategorized'}</div>
                                            <div><span className="font-bold">City:</span> {ad.city}</div>
                                            <div><span className="font-bold">Posted:</span> {moment(ad.createdAt).fromNow()}</div>
                                        </div>

                                        <button
                                            onClick={() => setExpandedAdId(expandedAdId === ad.documentId ? null : ad.documentId)}
                                            className="text-red-600 font-bold text-sm hover:underline flex items-center gap-1 mb-4"
                                        >
                                            {expandedAdId === ad.documentId ? '🔼 Hide Details' : '🔽 Show Detailed Review'}
                                        </button>

                                        {/* Featured & Payment Status */}
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                            <div className="flex flex-wrap gap-4 items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-blue-800 dark:text-blue-300">Featured Request:</span>
                                                    {ad.isFeatured ? (
                                                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold ring-1 ring-yellow-300">YES 🔥</span>
                                                    ) : (
                                                        <span className="text-gray-400">No</span>
                                                    )}
                                                </div>
                                                {ad.isFeatured && (
                                                    <>
                                                        <div className="h-4 w-px bg-blue-200 dark:bg-blue-800"></div>
                                                        <div><span className="text-sm font-bold text-blue-800 dark:text-blue-300">Method:</span> <span className="uppercase">{ad.paymentMethod || 'N/A'}</span></div>
                                                        <div className="h-4 w-px bg-blue-200 dark:bg-blue-800"></div>
                                                        <div><span className="text-sm font-bold text-blue-800 dark:text-blue-300">Transaction ID:</span> <code className="bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-700 text-xs">{ad.paymentTransactionId || 'MISSING'}</code></div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-row md:flex-col gap-2 justify-center">
                                        {activeTab === 'pending' ? (
                                            <>
                                                <button
                                                    onClick={() => handleAction(ad.documentId, 'approve')}
                                                    className="flex-grow md:flex-none px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition shadow-sm"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleAction(ad.documentId, 'reject')}
                                                    className="flex-grow md:flex-none px-6 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition shadow-sm"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleAction(ad.documentId, 'disable')}
                                                className="flex-grow md:flex-none px-6 py-2 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 transition shadow-sm"
                                            >
                                                Disable Ad
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleAction(ad.documentId, 'delete')}
                                            className="flex-grow md:flex-none px-6 py-2 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200 transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details Section */}
                                {expandedAdId === ad.documentId && (
                                    <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-6 animate-in slide-in-from-top duration-300">
                                        <div className="grid lg:grid-cols-2 gap-8">
                                            {/* All Images Gallery */}
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                    🖼️ All Images ({ad.images?.length || 0})
                                                </h4>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {ad.images?.map((img: any, idx: number) => (
                                                        <a key={idx} href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1338'}${img.url}`} target="_blank" rel="noreferrer" className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:ring-2 ring-red-500 transition-all">
                                                            <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1338'}${img.url}`} className="w-full h-full object-cover" alt="Ad detail" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Full Description & Payment Details */}
                                            <div className="space-y-6">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                                        📝 Full Description
                                                    </h4>
                                                    <div className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 whitespace-pre-line max-h-48 overflow-y-auto">
                                                        {ad.description || 'No description provided.'}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                                        💳 Payment Information
                                                    </h4>
                                                    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 text-sm space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Method:</span>
                                                            <span className="font-bold uppercase text-gray-900 dark:text-white">{ad.paymentMethod || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Status:</span>
                                                            <span className="font-bold uppercase text-orange-600">{ad.paymentStatus || 'UNPAID'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Transaction ID:</span>
                                                            <span className="font-mono text-gray-900 dark:text-white">{ad.paymentTransactionId || 'None'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
