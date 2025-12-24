"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface PaymobCheckoutProps {
    iframeUrl: string;
    onClose: () => void;
}

export default function PaymobCheckout({ iframeUrl, onClose }: PaymobCheckoutProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl relative overflow-hidden shadow-2xl flex flex-col">
                <div className="bg-blue-900 text-white p-4 flex justify-between items-center shrink-0">
                    <h3 className="font-bold flex items-center gap-2">
                        <img src="https://paymob.com/images/logo.png" alt="Paymob" className="h-6 bg-white rounded px-1" />
                        Secure Checkout
                    </h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 bg-gray-100 relative">
                    {/* Loading State Behind Iframe */}
                    <div className="absolute inset-0 flex items-center justify-center -z-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                    </div>
                    <iframe
                        src={iframeUrl}
                        className="w-full h-full border-0"
                        title="Payment Frame"
                        allow="payment"
                    />
                </div>
            </div>
        </div>
    );
}
