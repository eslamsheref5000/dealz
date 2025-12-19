"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../context/LanguageContext";

export default function StoriesBar() {
    const [stories, setStories] = useState<any[]>([]);
    const { t } = useLanguage();

    useEffect(() => {
        // Fetch featured products for stories
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1338';
        fetch(`${API_URL}/api/products?filters[isFeatured][$eq]=true&populate=*&pagination[limit]=10&sort[0]=publishedAt:desc`)
            .then(res => res.json())
            .then(data => setStories(data.data || []))
            .catch(console.error);
    }, []);

    if (stories.length === 0) return null;

    return (
        <div className="mb-8 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-4 px-2">
                {stories.map((story) => (
                    <Link href={`/product/${story.slug || story.documentId}`} key={story.id} className="flex flex-col items-center gap-2 group min-w-[80px]">
                        <div className="relative w-20 h-20 rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 group-hover:scale-105 transition-transform duration-300">
                            <div className="w-full h-full rounded-full border-2 border-white dark:border-gray-900 overflow-hidden relative bg-white dark:bg-gray-800">
                                <img
                                    src={story.images?.[0]?.url ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1338'}${story.images[0].url}` : "https://placehold.co/100x100"}
                                    alt={story.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-[10px] px-1.5 rounded-full border-2 border-white dark:border-gray-900 font-bold">
                                {t('common.dealz')}
                            </div>
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[80px] truncate text-center group-hover:text-red-600 transition-colors">
                            {story.title}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
