"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";
import { useCountry } from "../../context/CountryContext";
import { useToast } from "../../context/ToastContext";
import { countryCodes } from "../../utils/countryCodes";

export default function PostAdPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const { selectedCountry } = useCountry();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        title: "",
        price: "",
        category: "",
        sub_category: "",
        description: "",
        city: "",
        phone: "",
        countryCode: "",
        images: [] as File[],
        specs: {} as any
    });

    // Payment State
    const [isFeatured, setIsFeatured] = useState(false);
    const [transactionId, setTransactionId] = useState("");
    const FEATURE_PRICE = 50; // AED/EGP depending on country

    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [selectedCity, setSelectedCity] = useState("");



    const [categories, setCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [allowFeaturedAds, setAllowFeaturedAds] = useState(true);

    // Update city and phone code when country changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            city: prev.city || selectedCountry.cities[0],
            countryCode: selectedCountry.phoneCode
        }));
    }, [selectedCountry]);

    useEffect(() => {
        // Check for auth
        const user = localStorage.getItem("user");
        if (user) {
            setIsAuthenticated(true);
        }
        setLoading(false);

        // Fetch Global Settings
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
        fetch(`${API_URL}/api/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setAllowFeaturedAds(data.data.allowFeaturedAds ?? true);
                }
            })
            .catch(err => console.error("Settings fetch error:", err));

        // API_URL already declared above
        const catUrl = `${API_URL}/api/categories`;
        console.log("Fetching categories from:", catUrl);
        fetch(catUrl)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                const cats = data.data || [];
                console.log("Categories fetched successfully:", cats.length);
                setCategories(cats);
                if (cats.length > 0) {
                    const firstCatId = cats[0].documentId || cats[0].id;
                    console.log("Setting default category:", firstCatId);
                    setFormData(prev => ({ ...prev, category: firstCatId }));
                }
            })
            .catch(err => {
                console.error("Failed to fetch categories:", err);
                showToast("Failed to load categories. Please check your internet or server.", "error");
            });
    }, []);

    // Fetch SubCategories when Category changes
    useEffect(() => {
        if (!formData.category) {
            setSubCategories([]);
            return;
        }

        const filterKey = typeof formData.category === 'string' && formData.category.length > 10 ? 'documentId' : 'id';
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
        const subCatUrl = `${API_URL}/api/sub-categories?filters[category][${filterKey}][$eq]=${formData.category}`;
        console.log("Fetching sub-categories from:", subCatUrl);

        fetch(subCatUrl)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                console.log("Sub-categories fetched:", data.data?.length || 0);
                setSubCategories(data.data || []);
                setFormData(prev => ({ ...prev, sub_category: "" }));
            })
            .catch(err => console.error("Failed to fetch sub-categories:", err));
    }, [formData.category]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFormData(prev => ({ ...prev, images: [...prev.images, ...newFiles] }));
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Upload Images logic
            let imageIds: string[] = [];
            const token = localStorage.getItem("jwt");

            if (formData.images.length > 0) {
                const formDataImage = new FormData();
                formData.images.forEach((file) => {
                    formDataImage.append('files', file);
                });

                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
                const uploadRes = await fetch(`${API_URL}/api/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formDataImage,
                });

                if (uploadRes.status === 403) {
                    showToast("Permission denied! Enable 'Upload' in Admin Panel", "error");
                    return;
                }

                if (!uploadRes.ok) throw new Error("Image upload failed");
                const uploadData = await uploadRes.json();
                imageIds = uploadData.map((img: any) => img.id);
            }

            const payload = {
                title: formData.title,
                price: parseFloat(formData.price),
                description: formData.description,
                category: formData.category, // Strapi 5 relationships use documentId strings
                sub_category: formData.sub_category || null,
                images: imageIds,
                phone: `${formData.countryCode} ${formData.phone}`,
                city: formData.city,
                country: selectedCountry.id,
                approvalStatus: 'pending',
                // Payment Fields
                isFeatured: isFeatured, // Will be pending approval
                paymentMethod: isFeatured ? 'instapay' : 'none',
                paymentStatus: isFeatured ? 'pending' : 'unpaid',
                paymentTransactionId: isFeatured ? transactionId : null,
                specifications: formData.specs
            };

            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
            const res = await fetch(`${API_URL}/api/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ data: payload }),
            });

            const responseData = await res.json();

            if (res.ok) {
                showToast("Ad Submitted Successfully!", "success");
                setTimeout(() => window.location.href = "/", 1500);
            } else {
                console.error("Backend Error:", responseData);
                const msg = responseData.error?.message || "Unknown error";
                showToast(`Failed to submit: ${msg}`, "error");
            }
        } catch (err: any) {
            console.error(err);
            showToast(`Error: ${err.message || "Network Error"}`, "error");
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-900 dark:text-white transition-colors duration-300">{t('common.loading')}</div>;

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300">
                <Header />
                <div className="flex items-center justify-center h-[calc(100vh-80px)] px-4">
                    <div className="text-center max-w-md w-full bg-white dark:bg-gray-900 p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
                        <div className="text-6xl mb-6">🔒</div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('header.login')} Required</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                            Please log in to post an ad.
                        </p>
                        <button
                            onClick={() => router.push("/login")}
                            className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition shadow-lg shadow-red-200"
                        >
                            {t('header.login')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300">
            <Header />

            <div className="flex items-center justify-center pb-12 px-4 sm:px-6 lg:px-8 mt-8">
                <div className="max-w-2xl w-full bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('postAd.title')}</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">{t('home.heroSubtitle')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Form Fields */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('postAd.labels.title')} <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors ${formData.title.length >= 10
                                    ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                                    : (formData.title.length > 0 ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-red-500')
                                    }`}
                                placeholder={t('postAd.placeholders.title')}
                            />
                            <p className={`text-xs mt-1 text-right ${formData.title.length >= 10 ? 'text-green-600' : 'text-gray-500'}`}>
                                {formData.title.length >= 10 ? '✅ ' : ''}{formData.title.length}/10 chars
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('postAd.labels.price')} ({selectedCountry.currency}) <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    value={formData.price}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors ${formData.price
                                        ? 'border-green-500 focus:ring-green-500'
                                        : 'border-gray-300 dark:border-gray-700 focus:ring-red-500'
                                        }`}
                                    placeholder={t('postAd.placeholders.price')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('postAd.labels.category')} <span className="text-red-500">*</span></label>
                                <select
                                    name="category"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors ${formData.category
                                        ? 'border-green-500 focus:ring-green-500'
                                        : 'border-gray-300 dark:border-gray-700 focus:ring-red-500'
                                        }`}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.documentId || cat.id} value={cat.documentId || cat.id}>{t(`categories.${cat.attributes?.name || cat.name}`) || cat.attributes?.name || cat.name}</option>
                                    ))}
                                    {categories.length === 0 && <option value="">{t('common.loading')}</option>}
                                </select>
                            </div>
                        </div>

                        {/* Sub-Category Dropdown */}
                        {subCategories.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('postAd.labels.subCategory')}</label>
                                <select
                                    name="sub_category"
                                    value={formData.sub_category}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                    <option value="">{t('postAd.placeholders.subCategory') || "Select Sub-Category"}</option>
                                    {subCategories.map(sub => (
                                        <option key={sub.documentId || sub.id} value={sub.documentId || sub.id}>{t(`subCategories.${sub.attributes?.name || sub.name}`) || sub.attributes?.name || sub.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Dynamic Specifications */}
                        {/* Dynamic Specifications */}
                        {(() => {
                            const cat = categories.find(c => (c.documentId === formData.category || c.id === formData.category));
                            const catName = cat?.attributes?.name || cat?.name || '';
                            const subCat = subCategories.find(s => (s.documentId === formData.sub_category || s.id === formData.sub_category));
                            const subCatName = subCat?.attributes?.name || subCat?.name || '';

                            // 1. Properties Logic
                            if (catName === 'Properties') {
                                const showBedBath = ['Apartment', 'Villa', 'Townhouse', 'Penthouse'].some(k => subCatName.includes(k));
                                // Show Area for everything in Properties
                                return (
                                    <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                                        {showBedBath && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filters.bedrooms')} <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="number"
                                                        placeholder="e.g. 3"
                                                        required
                                                        className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${formData.specs.bedrooms ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 dark:border-gray-700 focus:ring-red-500'}`}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, bedrooms: e.target.value } }))}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filters.bathrooms')} <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="number"
                                                        placeholder="e.g. 2"
                                                        required
                                                        className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${formData.specs.bathrooms ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 dark:border-gray-700 focus:ring-red-500'}`}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, bathrooms: e.target.value } }))}
                                                    />
                                                </div>
                                            </>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filters.area')} <span className="text-red-500">*</span></label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 1200"
                                                required
                                                className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${formData.specs.area ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 dark:border-gray-700 focus:ring-red-500'}`}
                                                onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, area: e.target.value } }))}
                                            />
                                        </div>
                                    </div>
                                );
                            }

                            // 2. Motors Logic
                            if (catName === 'Motors') {
                                const isVehicle = ['Car', 'Motorcycle', 'Heavy', 'Truck', 'Bus'].some(k => subCatName.includes(k));
                                if (isVehicle) {
                                    return (
                                        <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filters.year')} <span className="text-red-500">*</span></label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g. 2023"
                                                    required
                                                    className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${formData.specs.year ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 dark:border-gray-700 focus:ring-red-500'}`}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, year: e.target.value } }))}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filters.mileage')} <span className="text-red-500">*</span></label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g. 50000"
                                                    required
                                                    className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${formData.specs.mileage ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 dark:border-gray-700 focus:ring-red-500'}`}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, mileage: e.target.value } }))}
                                                />
                                            </div>
                                        </div>
                                    );
                                }
                            }

                            // 3. Jobs Logic
                            if (catName === 'Jobs') {
                                return (
                                    <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filters.experience')} <span className="text-red-500">*</span></label>
                                            <select
                                                required
                                                className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${formData.specs.experience ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 dark:border-gray-700 focus:ring-red-500'}`}
                                                onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, experience: e.target.value } }))}
                                            >
                                                <option value="">Select Level</option>
                                                <option value="Entry Level">Entry Level</option>
                                                <option value="Mid Level">Mid Level</option>
                                                <option value="Senior Level">Senior Level</option>
                                                <option value="Executive">Executive</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filters.education')} <span className="text-red-500">*</span></label>
                                            <select
                                                required
                                                className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${formData.specs.education ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 dark:border-gray-700 focus:ring-red-500'}`}
                                                onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, education: e.target.value } }))}
                                            >
                                                <option value="">Select Level</option>
                                                <option value="High School">High School</option>
                                                <option value="Bachelor's Degree">Bachelor's Degree</option>
                                                <option value="Master's Degree">Master's Degree</option>
                                                <option value="PhD">PhD</option>
                                            </select>
                                        </div>
                                    </div>
                                );
                            }

                            // 4. Fashion (Size + Condition)
                            if (catName.includes('Fashion')) {
                                return (
                                    <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filters.size')} <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Medium, 42, 10"
                                                required
                                                className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${formData.specs.size ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 dark:border-gray-700 focus:ring-red-500'}`}
                                                onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, size: e.target.value } }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filters.condition')} <span className="text-red-500">*</span></label>
                                            <select
                                                required
                                                className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${formData.specs.condition ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 dark:border-gray-700 focus:ring-red-500'}`}
                                                onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, condition: e.target.value } }))}
                                            >
                                                <option value="">Select Condition</option>
                                                <option value="New">New</option>
                                                <option value="Used">Used</option>
                                            </select>
                                        </div>
                                    </div>
                                );
                            }


                            // 5. Generic Condition (Electronics, Furniture, etc.)
                            const needsCondition = ['Mobiles', 'Electronics', 'Furniture', 'Home Appliances', 'Sports', 'Computers'].some(k => catName.includes(k));
                            if (needsCondition) {
                                return (
                                    <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filters.condition')} <span className="text-red-500">*</span></label>
                                            <select
                                                required
                                                className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${formData.specs.condition ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 dark:border-gray-700 focus:ring-red-500'}`}
                                                onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, condition: e.target.value } }))}
                                            >
                                                <option value="">Select Condition</option>
                                                <option value="New">New</option>
                                                <option value="Used">Used</option>
                                                <option value="Open Box">Open Box</option>
                                                <option value="Refurbished">Refurbished</option>
                                            </select>
                                        </div>
                                    </div>
                                );
                            }

                            return null;
                        })()}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('postAd.labels.description')} <span className="text-red-500">*</span></label>
                            <textarea
                                name="description"
                                rows={4}
                                required
                                value={formData.description}
                                onChange={handleChange}
                                className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors ${formData.description.length >= 20
                                    ? 'border-green-500 focus:ring-green-500'
                                    : (formData.description.length > 0 ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-red-500')
                                    }`}
                                placeholder={t('postAd.placeholders.description')}
                            />
                            <p className={`text-xs mt-1 text-right ${formData.description.length >= 20 ? 'text-green-600' : 'text-gray-500'}`}>
                                {formData.description.length >= 20 ? '✅ ' : ''}{formData.description.length}/20 chars
                            </p>
                        </div>

                        {/* Location & Contact */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('postAd.labels.city')} <span className="text-red-500">*</span></label>
                                <select
                                    name="city"
                                    required
                                    value={formData.city}
                                    className={`mt-1 block w-full px-4 py-3 rounded-lg border shadow-sm focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${formData.city ? 'border-green-500' : 'border-gray-300 dark:border-gray-700'}`}
                                    onChange={handleChange}
                                >
                                    {selectedCountry.cities.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('postAd.labels.phone')} <span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                    <div className="w-[140px] flex-shrink-0">
                                        <select
                                            name="countryCode"
                                            value={formData.countryCode}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                        >
                                            {countryCodes.map((c) => (
                                                <option key={`${c.code}-${c.dial_code}`} value={c.dial_code}>
                                                    {c.flag} {c.dial_code} ({c.name})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        className={`mt-1 block w-full px-4 py-3 rounded-lg border shadow-sm focus:ring-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${formData.phone.length > 8
                                            ? 'border-green-500 focus:ring-green-500'
                                            : 'border-gray-300 dark:border-gray-700 focus:ring-red-500'
                                            }`}
                                        placeholder={t('postAd.placeholders.phone')}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('postAd.labels.images')} <span className="text-gray-400 text-xs">(At least 1 required)</span></label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl hover:border-red-500 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800/50">
                                <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500">
                                            <span>{t('postAd.uploadTip') || "Upload images"}</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" multiple />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            </div>

                            {/* Image Previews */}
                            {formData.images.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {formData.images.map((file, idx) => (
                                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt="preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Featured Ad Section with InstaPay */}
                        {allowFeaturedAds && (
                            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <span>⭐</span> {t('postAd.featured.title') || "Make it Featured!"}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">{t('postAd.featured.desc') || "Get 10x more views by featuring your ad."}</p>
                                    </div>
                                    <div className="text-right">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="sr-only peer" />
                                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-500"></div>
                                        </label>
                                        <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">{FEATURE_PRICE} {selectedCountry.currency}</div>
                                    </div>
                                </div>

                                {/* InstaPay Details (Show only if featured is checked) */}
                                {isFeatured && (
                                    <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-4">
                                        <div className="flex flex-col md:flex-row gap-6 items-center">
                                            <div className="flex-shrink-0">
                                                {/* Mock QR Code */}
                                                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                                                    <span className="text-4xl">📱</span>
                                                </div>
                                                <p className="text-xs text-center text-gray-500 mt-2">Scan with InstaPay</p>
                                            </div>
                                            <div className="flex-grow space-y-4 w-full">
                                                <div>
                                                    <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">Send {FEATURE_PRICE} {selectedCountry.currency} to:</p>
                                                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                                                        <span className="font-mono text-lg text-red-600 font-bold tracking-wider">shando5000</span>
                                                        <button type="button" onClick={() => navigator.clipboard.writeText("shando5000")} className="ml-auto text-sm text-blue-600 font-bold hover:underline">Copy</button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Enter Transaction ID (Reference No.)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required={isFeatured}
                                                        value={transactionId}
                                                        onChange={(e) => setTransactionId(e.target.value)}
                                                        placeholder="e.g. 12345678"
                                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Found in your InstaPay transaction receipt.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-lg font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                        >
                            {t('postAd.submit')}
                        </button>
                    </form>
                </div >
            </div >
        </div >
    );
}
