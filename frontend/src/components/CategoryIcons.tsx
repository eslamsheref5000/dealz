import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

const CATEGORY_ICONS: Record<string, string> = {
    "Motors": "🚗",
    "Properties": "🏠",
    "Mobiles": "📱",
    "Electronics": "💻",
    "Furniture & Garden": "🛋️",
    "Jobs": "💼",
    "Services": "🛠️",
    "Community": "🤝",
    "Pets": "🐾",
    "Fashion & Beauty": "👗",
    "Hobbies, Sports & Kids": "⚽",
};

const CATEGORY_COLORS: Record<string, string> = {
    "Motors": "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
    "Properties": "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300",
    "Mobiles": "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300",
    "Electronics": "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300",
    "Furniture & Garden": "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300",
    "Jobs": "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    "Services": "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
    "Community": "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300",
    "Pets": "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300",
    "Fashion & Beauty": "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300",
    "Hobbies, Sports & Kids": "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300",
};

export default function CategoryIcons() {
    const { t } = useLanguage();
    const categories = Object.keys(CATEGORY_ICONS);

    return (
        <div className="flex overflow-x-auto pb-4 gap-4 px-2 no-scrollbar scroll-smooth snap-x">
            {categories.map((cat) => (
                <Link
                    key={cat}
                    href={`/c/${encodeURIComponent(cat)}`}
                    className={`snap-center flex flex-col items-center gap-2 min-w-[80px] group transition-all duration-500 p-3 rounded-2xl border-2 hover:translate-y-[-4px] border-transparent hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none`}
                >
                    <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 ${CATEGORY_COLORS[cat] || "bg-gray-100 dark:bg-gray-800"
                            }`}
                    >
                        {CATEGORY_ICONS[cat]}
                    </div>
                    <span
                        className={`text-xs font-black tracking-tight text-center whitespace-nowrap px-1 transition-colors duration-300 text-gray-500 dark:text-gray-400 group-hover:text-red-500`}
                    >
                        {t(`categories.${cat}`)}
                    </span>
                </Link>

            ))}
        </div>
    );
}
