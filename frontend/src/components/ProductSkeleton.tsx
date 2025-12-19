
export default function ProductSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 h-full flex flex-col animate-pulse">
            {/* Image Placeholder */}
            <div className="h-48 w-full bg-gray-200 dark:bg-gray-800"></div>

            <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                    {/* Title Placeholder */}
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-3"></div>
                    {/* Price Placeholder */}
                    <div className="h-7 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-3"></div>
                </div>

                {/* Location Date Placeholder */}
                <div className="flex justify-between items-center mt-4 border-t border-gray-100 dark:border-gray-800 pt-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                </div>
            </div>
        </div>
    );
}
