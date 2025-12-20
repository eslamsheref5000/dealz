"use client";

import { useState, useEffect } from "react";
import Header from "../../../components/Header";
import { useRouter, useParams } from "next/navigation";
import { useLanguage } from "../../../context/LanguageContext";
import { useCountry } from "../../../context/CountryContext";
import { useToast } from "../../../context/ToastContext";
import { countryCodes } from "../../../utils/countryCodes";

export default function EditAdPage() {
    const router = useRouter();
    const params = useParams();
    const adId = params.id as string;

    const { t } = useLanguage();
    const { selectedCountry } = useCountry();
    const { showToast } = useToast();

    // Separate state for existing images (from backend)
    const [existingImages, setExistingImages] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        price: "",
        category: "",
        sub_category: "",
        description: "",
        city: "",
        phone: "",
        countryCode: "",
        images: [] as File[], // New files to upload
        specs: {} as any,
        showPhone: true,
        enableChat: true,
    });

    const [categories, setCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Initial data fetch
    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) {
            router.push("/login");
            return;
        }
        setIsAuthenticated(true);

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
        const token = localStorage.getItem("jwt");

        // 1. Fetch Categories
        fetch(`${API_URL}/api/categories`)
            .then(res => res.json())
            .then(data => {
                setCategories(data.data || []);
            });

        // 2. Fetch Ad Details
        fetch(`${API_URL}/api/products/${adId}?populate=*`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch ad");
                return res.json();
            })
            .then(data => {
                const ad = data.data;
                if (!ad) {
                    showToast("Ad not found", "error");
                    router.push("/profile");
                    return;
                }

                // Verify ownership (client-side check, backend validates too)
                const userData = JSON.parse(user);
                if (ad.ad_owner?.id !== userData.id && !userData.isAdmin) {
                    showToast("Unauthorized", "error");
                    router.push("/profile");
                    return;
                }

                // Parse existing phone
                // Assuming format "Code Phone" -> e.g. "+971 501234567"
                let code = selectedCountry.phoneCode;
                let number = ad.phone || "";
                if (ad.phone && ad.phone.includes(" ")) {
                    const parts = ad.phone.split(" ");
                    code = parts[0];
                    number = parts.slice(1).join(" "); // Join rest in case of spaces
                }

                setFormData({
                    title: ad.title || "",
                    price: ad.price?.toString() || "",
                    category: ad.category?.documentId || ad.category?.id || "",
                    sub_category: ad.sub_category?.documentId || ad.sub_category?.id || "", // Keep empty if null
                    description: ad.description || "",
                    city: ad.city || selectedCountry.cities[0],
                    phone: number,
                    countryCode: code,
                    images: [],
                    specs: ad.specifications || {},
                    showPhone: ad.showPhone ?? true,
                    enableChat: ad.enableChat ?? true,
                });

                if (ad.images) {
                    setExistingImages(ad.images);
                }

                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                showToast("Error loading ad", "error");
                setLoading(false);
            });

    }, [adId]);

    // Fetch SubCategories when Category changes (if changed by user or loaded)
    useEffect(() => {
        if (!formData.category) {
            setSubCategories([]);
            return;
        }

        const filterKey = typeof formData.category === 'string' && formData.category.length > 10 ? 'documentId' : 'id';
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';

        fetch(`${API_URL}/api/sub-categories?filters[category][${filterKey}][$eq]=${formData.category}`)
            .then(res => res.json())
            .then(data => {
                setSubCategories(data.data || []);
            });
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

    const removeNewImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const removeExistingImage = (imgId: number) => {
        setExistingImages(prev => prev.filter(img => img.id !== imgId));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation needed: At least 1 image total
        if (existingImages.length === 0 && formData.images.length === 0) {
            showToast("Please add at least one image.", "error");
            return;
        }

        if (!formData.showPhone && !formData.enableChat) {
            showToast(t('postAd.errors.contactRequired') || "At least one contact method (Phone or Chat) must be enabled.", "error");
            return;
        }

        try {
            const token = localStorage.getItem("jwt");
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';

            // 1. Upload NEW images if any
            let newImageIds: string[] = [];
            if (formData.images.length > 0) {
                const formDataImage = new FormData();
                formData.images.forEach((file) => {
                    formDataImage.append('files', file);
                });

                const uploadRes = await fetch(`${API_URL}/api/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formDataImage,
                });

                if (!uploadRes.ok) throw new Error("Image upload failed");
                const uploadData = await uploadRes.json();
                newImageIds = uploadData.map((img: any) => img.id);
            }

            // 2. Combine with existing image IDs
            const finalImageIds = [...existingImages.map(img => img.id), ...newImageIds];

            // 3. Prepare Payload
            const payload = {
                title: formData.title,
                price: parseFloat(formData.price),
                description: formData.description,
                category: formData.category,
                sub_category: formData.sub_category || null,
                images: finalImageIds,
                phone: `${formData.countryCode} ${formData.phone}`,
                city: formData.city,
                // We do NOT send country/ad_owner usually on update unless needed
                // But approvalStatus will be reset by backend
                // approvalStatus: 'pending' // Handled by backend, or we can send it to be sure
                specifications: formData.specs,
                showPhone: formData.showPhone,
                enableChat: formData.enableChat
            };

            // 4. Update Ad
            const res = await fetch(`${API_URL}/api/products/${adId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ data: payload }),
            });

            if (res.ok) {
                showToast("Ad Updated! It is now pending review.", "success");
                setTimeout(() => router.push("/profile"), 2000);
            } else {
                const errData = await res.json();
                console.error("Update failed", errData);
                showToast(errData.error?.message || "Failed to update ad", "error");
            }

        } catch (err: any) {
            console.error(err);
            showToast(`Error: ${err.message}`, "error");
        }
    };

    // Reusing the dynamic spec render logic (simplified for brevity, or need to copy fully)
    // I will copy the logic fully to ensure consistency.

    const renderSpecs = () => {
        const cat = categories.find(c => (c.documentId === formData.category || c.id === formData.category));
        const catName = cat?.attributes?.name || cat?.name || '';
        const subCat = subCategories.find(s => (s.documentId === formData.sub_category || s.id === formData.sub_category));
        const subCatName = subCat?.attributes?.name || subCat?.name || '';

        if (catName === 'Properties') {
            const showBedBath = ['Apartment', 'Villa', 'Townhouse', 'Penthouse'].some(k => subCatName.includes(k));
            return (
                <div className="grid grid-cols-2 gap-6">
                    {showBedBath && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filters.bedrooms')} <span className="text-red-500">*</span></label>
                                <input type="number" required value={formData.specs.bedrooms || ''} className="appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-red-500" onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, bedrooms: e.target.value } }))} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filters.bathrooms')} <span className="text-red-500">*</span></label>
                                <input type="number" required value={formData.specs.bathrooms || ''} className="appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-red-500" onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, bathrooms: e.target.value } }))} />
                            </div>
                        </>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filters.area')} <span className="text-red-500">*</span></label>
                        <input type="number" required value={formData.specs.area || ''} className="appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-red-500" onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, area: e.target.value } }))} />
                    </div>
                </div>
            );
        }

        if (catName === 'Motors') {
            const isVehicle = ['Car', 'Motorcycle', 'Heavy', 'Truck', 'Bus'].some(k => subCatName.includes(k));
            if (isVehicle) {
                return (
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filters.year')} <span className="text-red-500">*</span></label>
                            <input type="number" required value={formData.specs.year || ''} className="appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-red-500" onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, year: e.target.value } }))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filters.mileage')} <span className="text-red-500">*</span></label>
                            <input type="number" required value={formData.specs.mileage || ''} className="appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-red-500" onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, mileage: e.target.value } }))} />
                        </div>
                    </div>
                );
            }
        }

        // Jobs
        if (catName === 'Jobs') {
            return (
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filters.experience')} <span className="text-red-500">*</span></label>
                        <select required value={formData.specs.experience || ''} className="appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-red-500" onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, experience: e.target.value } }))}>
                            <option value="">{t('postAd.placeholders.selectLevel') || 'Select Level'}</option>
                            <option value="Entry Level">{t('options.experience.entry') || 'Entry Level'}</option>
                            <option value="Mid Level">{t('options.experience.mid') || 'Mid Level'}</option>
                            <option value="Senior Level">{t('options.experience.senior') || 'Senior Level'}</option>
                            <option value="Executive">{t('options.experience.executive') || 'Executive'}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filters.education')} <span className="text-red-500">*</span></label>
                        <select required value={formData.specs.education || ''} className="appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-red-500" onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, education: e.target.value } }))}>
                            <option value="">{t('postAd.placeholders.selectLevel') || 'Select Level'}</option>
                            <option value="High School">{t('options.education.highSchool') || 'High School'}</option>
                            <option value="Bachelor's Degree">{t('options.education.bachelors') || "Bachelor's Degree"}</option>
                            <option value="Master's Degree">{t('options.education.masters') || "Master's Degree"}</option>
                            <option value="PhD">{t('options.education.phd') || 'PhD'}</option>
                        </select>
                    </div>
                </div>
            );
        }

        // Fashion
        if (catName.includes('Fashion')) {
            return (
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filters.size')} <span className="text-red-500">*</span></label>
                        <input type="text" required value={formData.specs.size || ''} className="appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-red-500" onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, size: e.target.value } }))} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filters.condition')} <span className="text-red-500">*</span></label>
                        <select required value={formData.specs.condition || ''} className="appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-red-500" onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, condition: e.target.value } }))}>
                            <option value="">{t('postAd.placeholders.selectCondition') || 'Select Condition'}</option>
                            <option value="New">{t('options.condition.new') || 'New'}</option>
                            <option value="Used">{t('options.condition.used') || 'Used'}</option>
                        </select>
                    </div>
                </div>
            );
        }

        const needsCondition = ['Mobiles', 'Electronics', 'Furniture', 'Home Appliances', 'Sports', 'Computers'].some(k => catName.includes(k));
        if (needsCondition) {
            return (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filters.condition')} <span className="text-red-500">*</span></label>
                    <select required value={formData.specs.condition || ''} className="appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-red-500" onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, condition: e.target.value } }))}>
                        <option value="">{t('postAd.placeholders.selectCondition') || 'Select Condition'}</option>
                        <option value="New">{t('options.condition.new') || 'New'}</option>
                        <option value="Used">{t('options.condition.used') || 'Used'}</option>
                        <option value="Open Box">{t('options.condition.openBox') || 'Open Box'}</option>
                        <option value="Refurbished">{t('options.condition.refurbished') || 'Refurbished'}</option>
                    </select>
                </div>
            );
        }

        return null;
    }

    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-900 dark:text-white">{t('common.loading')}</div>;

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300">
            <Header />

            <div className="flex items-center justify-center pb-12 px-4 sm:px-6 lg:px-8 mt-8">
                <div className="max-w-2xl w-full bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">✏️ {t('postAd.editTitle') || 'Edit Your Ad'}</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('postAd.labels.title')} <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
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
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('postAd.labels.category')} <span className="text-red-500">*</span></label>
                                <select
                                    name="category"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.documentId || cat.id} value={cat.documentId || cat.id}>{t(`categories.${cat.attributes?.name || cat.name}`) || cat.attributes?.name || cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Sub-Category */}
                        {subCategories.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('postAd.labels.subCategory')}</label>
                                <select
                                    name="sub_category"
                                    value={formData.sub_category}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                    <option value="">{t('postAd.placeholders.subCategory') || "Select Sub-Category"}</option>
                                    {subCategories.map(sub => (
                                        <option key={sub.documentId || sub.id} value={sub.documentId || sub.id}>{t(`subCategories.${sub.attributes?.name || sub.name}`) || sub.attributes?.name || sub.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {renderSpecs()}

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('postAd.labels.description')} <span className="text-red-500">*</span></label>
                            <textarea
                                name="description"
                                rows={4}
                                required
                                value={formData.description}
                                onChange={handleChange}
                                className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Location & Contact */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('postAd.labels.city')} <span className="text-red-500">*</span></label>
                                <select
                                    name="city"
                                    required
                                    value={formData.city}
                                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-red-500"
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
                                            className="mt-1 block w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
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
                                        className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-red-500"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('postAd.labels.images')}</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl hover:border-red-500 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800/50">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none">
                                    <span>{t('postAd.addNewImages') || 'Add New Images'}</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" multiple />
                                </label>
                            </div>

                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {/* Existing Images */}
                                {existingImages.map((img) => (
                                    <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                        <img
                                            src={img.url.startsWith('http') ? img.url : `${process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space'}${img.url}`}
                                            alt="existing"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(img.id)}
                                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}

                                {/* New Images */}
                                {formData.images.map((file, idx) => (
                                    <div key={`new-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden border border-green-500 border-2">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt="new preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(idx)}
                                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                        <span className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-xs text-center py-1">{t('postAd.newImage') || 'New'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Privacy */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('postAd.privacy.title') || "Privacy"}</h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="showPhone"
                                        checked={formData.showPhone}
                                        onChange={handleCheckboxChange}
                                        className="w-5 h-5 text-red-600 rounded"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">{t('postAd.privacy.showPhone') || "Show Phone"}</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="enableChat"
                                        checked={formData.enableChat}
                                        onChange={handleCheckboxChange}
                                        className="w-5 h-5 text-red-600 rounded"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">{t('postAd.privacy.enableChat') || "Enable Chat"}</span>
                                </label>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-lg font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                            >
                                {t('postAd.saveChanges') || 'Save Changes & Submit for Review'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
