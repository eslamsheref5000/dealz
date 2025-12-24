"use client";

import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { Upload, CheckCircle, Smartphone } from "lucide-react";
import { useToast } from "../context/ToastContext";

interface ManualPaymentFormProps {
    transactionId: string;
    amount: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ManualPaymentForm({ transactionId, amount, onSuccess, onCancel }: ManualPaymentFormProps) {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!file) return showToast("Please upload the receipt screenshot", "error");

        setUploading(true);
        try {
            const token = localStorage.getItem("jwt");

            // 1. Upload File
            const formData = new FormData();
            formData.append("files", file);

            const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space'}/api/upload`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (!uploadRes.ok) throw new Error("File upload failed");
            const uploadData = await uploadRes.json();
            const fileId = uploadData[0].id;

            // 2. Confirm Payment
            const confirmRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space'}/api/payment/manual/confirm`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    transactionId,
                    fileId,
                    method: "instapay"
                })
            });

            if (!confirmRes.ok) throw new Error("Confirmation failed");

            showToast("Receipt submitted! We will review shortly.", "success");
            onSuccess();

        } catch (err) {
            console.error(err);
            showToast("Something went wrong. Please try again.", "error");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                    <Smartphone className="text-purple-600" />
                    {t('checkout.manualPayment') || "InstaPay / Wallet Transfer"}
                </h3>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl mb-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Transfer <strong className="text-gray-900 dark:text-white">{amount} EGP</strong> to:</p>
                    <div className="text-2xl font-mono font-bold text-purple-600 my-2 select-all">
                        010 1234 5678
                    </div>
                    <p className="text-xs text-gray-400">@username (InstaPay)</p>
                </div>

                <div className="space-y-4">
                    <label className="block w-full cursor-pointer">
                        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 hover:border-purple-500 dark:border-gray-600'}`}>
                            {file ? (
                                <div className="flex flex-col items-center text-green-600">
                                    <CheckCircle size={32} className="mb-2" />
                                    <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-gray-500">
                                    <Upload size={32} className="mb-2" />
                                    <p className="text-sm font-medium">Click to upload Receipt</p>
                                    <p className="text-xs text-gray-400 mt-1">Screenshots accepted</p>
                                </div>
                            )}
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!file || uploading}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Uploading...
                                </>
                            ) : (
                                "Confirm Payment"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
