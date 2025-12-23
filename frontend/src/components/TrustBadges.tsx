import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const TrustBadges = ({ isTopRated = false }: { isTopRated?: boolean }) => {
    const { t } = useLanguage();

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-3 uppercase tracking-wide">
                {t('common.shopWithConfidence') || 'Shop with confidence'}
            </h3>

            <div className="space-y-4">
                {/* Money Back Guarantee */}
                <div className="flex gap-3 items-start">
                    <div className="mt-1">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                            {t('common.moneyBackGuarantee') || 'Dealz Money Back Guarantee'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {t('common.moneyBackDesc') || 'Get the item you ordered or get your money back.'}
                        </div>
                        <a href="#" className="text-xs text-blue-600 hover:underline mt-1 block">
                            {t('common.learnMore') || 'Learn more'}
                        </a>
                    </div>
                </div>

                {/* Top Rated Plus */}
                {isTopRated && (
                    <div className="flex gap-3 items-start border-t border-gray-100 dark:border-gray-800 pt-3">
                        <div className="mt-1">
                            <span className="w-6 h-6 flex items-center justify-center bg-yellow-400 text-yellow-900 rounded-full text-[10px] font-bold shadow-sm">
                                ★
                            </span>
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                                {t('common.topRatedPlus') || 'Top Rated Plus'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {t('common.trustedSeller') || 'Trusted seller, fast shipping, and easy returns.'}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrustBadges;
