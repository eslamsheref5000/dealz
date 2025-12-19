"use client";

import React, { useState } from 'react';

interface ImageGalleryProps {
    images: any[];
    title: string;
    isFavorite: boolean;
    onToggleFavorite: () => void;
}

export default function ImageGallery({ images, title, isFavorite, onToggleFavorite }: ImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const hasImages = images && images.length > 0;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
    const currentImage = hasImages ? (images[selectedIndex].url.startsWith('http') ? images[selectedIndex].url : `${API_URL}${images[selectedIndex].url}`) : "https://placehold.co/800x600/png?text=No+Image";

    const nextImage = () => {
        if (!hasImages) return;
        setSelectedIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        if (!hasImages) return;
        setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="space-y-4">
            {/* Main Image Container */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 relative group aspect-[4/3]">
                <img
                    src={currentImage}
                    alt={title}
                    className="w-full h-full object-contain bg-gray-50 dark:bg-gray-800"
                />

                {/* Navigation Arrows */}
                {hasImages && images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.preventDefault(); prevImage(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition duration-300 hover:bg-white dark:hover:bg-black text-gray-800 dark:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); nextImage(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition duration-300 hover:bg-white dark:hover:bg-black text-gray-800 dark:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </>
                )}

                {/* Heart Button */}
                <button
                    onClick={onToggleFavorite}
                    className="absolute top-4 right-4 p-3 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full shadow-lg hover:scale-110 transition z-10"
                >
                    <span className={`text-2xl ${isFavorite ? 'text-red-500' : 'text-gray-400 dark:text-gray-200'}`}>
                        {isFavorite ? '❤️' : '🤍'}
                    </span>
                </button>

                {/* Image Counter */}
                {hasImages && (
                    <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur text-white text-xs rounded-full font-medium">
                        {selectedIndex + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {hasImages && images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img, idx) => (
                        <button
                            key={img.id || idx}
                            onClick={() => setSelectedIndex(idx)}
                            className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${selectedIndex === idx ? 'border-red-500 ring-2 ring-red-500/20' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        >
                            <img
                                src={img.url.startsWith('http') ? img.url : `${process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space'}${img.url}`}
                                alt={`${title} ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
