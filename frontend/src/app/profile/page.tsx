"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import { useLanguage } from "../../context/LanguageContext";
import { useFavorites } from "../../context/FavoriteContext";
import { countries } from "../../context/CountryContext";
import { useToast } from "../../context/ToastContext";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [ads, setAds] = useState<any[]>([]);
    const [savedAds, setSavedAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [kycUploading, setKycUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'my-ads' | 'saved'>('my-ads');

    // KYC Form State
    const [showKycModal, setShowKycModal] = useState(false);
    const [kycForm, setKycForm] = useState({
        kycType: 'national_id',
        fullName: '',
        address: '',
        file: null as File | null
    });
    const { t } = useLanguage();
    const { favorites } = useFavorites();
    const { showToast } = useToast();

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
            router.push("/login");
            return;
        }
        const userData = JSON.parse(userStr);
        setUser(userData);

        const fetchMyAds = fetch(`http://localhost:1338/api/products?filters[ad_owner][id][$eq]=${userData.id}&populate=*`).then(r => r.json());

        const fetchSavedAds = favorites.length > 0
            ? Promise.all(favorites.map(docId =>
                fetch(`http://localhost:1338/api/products/${docId}?populate=*`).then(r => r.json())
            ))
            : Promise.resolve([]);

        Promise.all([fetchMyAds, fetchSavedAds])
            .then(([myAdsData, savedAdsData]) => {
                setAds(myAdsData.data || []);
                // Filter out any null/error responses from savedAds
                setSavedAds(savedAdsData.map((res: any) => res.data).filter(Boolean));

                // Fetch latest user data for avatar
                const token = localStorage.getItem("jwt");
                if (token) {
                    fetch('http://localhost:1338/api/users/me?populate=avatar', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                        .then(res => res.json())
                        .then(fullUser => {
                            setUser(fullUser);
                            localStorage.setItem("user", JSON.stringify(fullUser));
                        });
                }

                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [favorites]);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('files', file);

            const token = localStorage.getItem("jwt");
            const uploadRes = await fetch('http://localhost:1338/api/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (uploadRes.status === 401) {
                localStorage.removeItem("user");
                localStorage.removeItem("jwt");
                router.push("/login");
                return;
            }

            if (uploadRes.status === 403) {
                showToast(t('errors.permissionDenied') || "Permission denied! Please enable 'Upload' in Admin Panel.", 'error');
                return;
            }

            if (!uploadRes.ok) {
                const errorData = await uploadRes.json();
                console.error("Upload Error Details:", errorData, "Status:", uploadRes.status);
                throw new Error(errorData.error?.message || "Upload failed");
            }
            const uploadData = await uploadRes.json();
            const avatarId = uploadData[0].id;

            const updateRes = await fetch(`http://localhost:1338/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ avatar: avatarId }),
            });

            if (updateRes.status === 401) {
                localStorage.removeItem("user");
                localStorage.removeItem("jwt");
                router.push("/login");
                return;
            }

            if (!updateRes.ok) {
                const errorData = await updateRes.json();
                console.error("Update User Error Details:", errorData);
                throw new Error(errorData.error?.message || "Update failed");
            }

            if (updateRes.ok) {
                const updatedUser = await updateRes.json();
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
                showToast(t('profile.avatarUpdated') || "Profile picture updated successfully!", 'success');
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to update profile picture", 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleKycSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!kycForm.file) {
            showToast("Please upload a document", "error");
            return;
        }
        setKycUploading(true);

        try {
            // 1. Upload File
            const formData = new FormData();
            formData.append('files', kycForm.file);

            const token = localStorage.getItem("jwt");
            const uploadRes = await fetch('http://localhost:1338/api/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!uploadRes.ok) throw new Error("Document upload failed");

            const uploadData = await uploadRes.json();
            const docId = uploadData[0].id;

            // 2. Update User Profile
            const updateRes = await fetch(`http://localhost:1338/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    kycStatus: 'pending',
                    kycDocument: docId,
                    kycType: kycForm.kycType,
                    fullName: kycForm.fullName,
                    address: kycForm.address
                }),
            });

            if (updateRes.ok) {
                const updatedUser = await updateRes.json();
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
                showToast(t('profile.verificationSubmitted') || "Verification request submitted! 🛡️", 'success');
                setShowKycModal(false);
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to submit verification", 'error');
        } finally {
            setKycUploading(false);
        }
    };

    const handleDelete = async (adId: string) => {
        if (!confirm("Are you sure you want to delete this ad?")) return;

        const token = localStorage.getItem("jwt");
        try {
            const res = await fetch(`http://localhost:1338/api/products/${adId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                setAds(prev => prev.filter(ad => (ad.documentId || ad.id) !== adId));
                alert("Ad deleted successfully");
            } else {
                alert("Failed to delete ad");
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting ad");
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">Loading profile...</div>;

    const displayAds = activeTab === 'my-ads' ? ads : savedAds;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300">
            <Header />

            <div className="container mx-auto px-4 py-8">
                {/* User Info Card */}
                <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8 flex items-center gap-6">
                    <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-input')?.click()}>
                        <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-4xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
                            {user?.avatar ? (
                                <img
                                    src={`http://localhost:1338${user.avatar.url}`}
                                    className="w-full h-full object-cover"
                                    alt="Profile"
                                />
                            ) : (
                                "👤"
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {t('profile.changeAvatar')}
                        </div>
                        <input
                            id="avatar-input"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.username}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                </div>

                {/* KYC Status & Action */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl mb-8 flex items-center justify-between border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-2xl">
                            {user?.isVerified ? '✅' : '🛡️'}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {t('profile.identityVerification')}
                                {user?.isVerified && <span className="text-blue-500 text-lg">✓</span>}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {user?.isVerified
                                    ? t('profile.verifiedDesc')
                                    : user?.kycStatus === 'pending'
                                        ? t('profile.pendingDesc')
                                        : t('profile.unverifiedDesc')}
                            </p>
                        </div>
                    </div>

                    {!user?.isVerified && user?.kycStatus !== 'pending' && (
                        <button
                            onClick={() => setShowKycModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold transition flex items-center gap-2"
                        >
                            {t('profile.verifyNow')}
                        </button>
                    )}

                    {user?.kycStatus === 'pending' && (
                        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-bold text-sm">
                            {t('profile.underReview')} 🕒
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b dark:border-gray-800 mb-8">
                    <button
                        onClick={() => setActiveTab('my-ads')}
                        className={`pb-4 px-4 text-lg font-bold transition ${activeTab === 'my-ads' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {t('header.profile')} ({ads.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`pb-4 px-4 text-lg font-bold transition ${activeTab === 'saved' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {t('profile.savedItems')} ({savedAds.length})
                    </button>
                </div>

                {displayAds.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 p-12 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-center">
                        <div className="text-4xl mb-4">{activeTab === 'my-ads' ? '📢' : '❤️'}</div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {activeTab === 'my-ads' ? t('profile.noMyAds') : t('profile.noSavedItems')}
                        </h3>
                        {activeTab === 'my-ads' && (
                            <>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">{t('profile.startSelling')}</p>
                                <Link href="/post-ad" className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition">
                                    {t('header.postAd')}
                                </Link>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {displayAds.map((ad: any) => (
                            <div key={ad.documentId || ad.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 group h-full flex flex-col">
                                <Link href={`/product/${ad.slug || ad.documentId || ad.id}`}>
                                    <div className="relative h-48 bg-gray-200 dark:bg-gray-800">
                                        <img
                                            src={ad.images && ad.images.length > 0 ? `http://localhost:1338${ad.images[0].url}` : "https://placehold.co/600x400/png?text=No+Image"}
                                            alt={ad.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                        />
                                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                            {ad.views || 0} {t('product.viewsCount')}
                                        </div>
                                    </div>
                                    <div className="p-4 flex-grow">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white truncate flex-1">{ad.title}</h3>
                                            {activeTab === 'my-ads' && (
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${ad.approvalStatus === 'approved'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : ad.approvalStatus === 'rejected'
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    }`}>
                                                    {ad.approvalStatus === 'approved' ? '✓' : ad.approvalStatus === 'rejected' ? '✗' : '🕒'} {ad.approvalStatus || 'pending'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-red-600 font-extrabold">
                                            {ad.price?.toLocaleString()} {countries.find(c => c.id === ad.country)?.currency || 'AED'}
                                        </div>
                                    </div>
                                </Link>
                                {activeTab === 'my-ads' && (
                                    <div className="px-4 pb-4 pt-0">
                                        <button
                                            onClick={() => handleDelete(ad.documentId || ad.id)}
                                            className="w-full bg-gray-100 dark:bg-gray-800 text-red-600 py-2 rounded-lg font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center justify-center gap-2"
                                        >
                                            🗑️ {t('profile.deleteAd')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* KYC Modal */}
            {showKycModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('profile.kycModalTitle')}</h3>
                            <button onClick={() => setShowKycModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <form onSubmit={handleKycSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('profile.kycTypeLabel')}</label>
                                <select
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    value={kycForm.kycType}
                                    onChange={e => setKycForm({ ...kycForm, kycType: e.target.value })}
                                >
                                    <option value="national_id">{t('profile.kycTypeNationalId')}</option>
                                    <option value="passport">{t('profile.kycTypePassport')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('profile.fullNameLabel')}</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    placeholder={t('profile.fullNamePlaceholder')}
                                    value={kycForm.fullName}
                                    onChange={e => setKycForm({ ...kycForm, fullName: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('profile.addressLabel')}</label>
                                <textarea
                                    required
                                    rows={2}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    placeholder={t('profile.addressPlaceholder')}
                                    value={kycForm.address}
                                    onChange={e => setKycForm({ ...kycForm, address: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('profile.uploadIdLabel')}</label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 text-center cursor-pointer hover:border-blue-500 transition relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        required
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={e => e.target.files?.[0] && setKycForm({ ...kycForm, file: e.target.files[0] })}
                                    />
                                    <div className="text-gray-500 dark:text-gray-400">
                                        {kycForm.file ? (
                                            <span className="text-green-600 font-bold">{kycForm.file.name}</span>
                                        ) : (
                                            <span>{t('profile.uploadClickPrompt')}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={kycUploading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold mt-4 disabled:opacity-50 flex justify-center"
                            >
                                {kycUploading ? t('profile.submitting') : t('profile.submitVerification')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
