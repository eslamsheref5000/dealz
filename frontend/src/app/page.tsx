"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import StoriesBar from "../components/StoriesBar";
import CategoryIcons from "../components/CategoryIcons";
import CategoryRow from "../components/CategoryRow";
import RecentlyViewed from "../components/RecentlyViewed";
import AdvancedFilters from "../components/AdvancedFilters";
import ProductSkeleton from "../components/ProductSkeleton";
import ProductCard from "../components/ProductCard";
import { useLanguage } from "../context/LanguageContext";
import { useFavorites } from "../context/FavoriteContext";
import { useCountry } from "../context/CountryContext";
import { useComparison } from "../context/ComparisonContext";
import { isWithinTwoHours } from "../utils/dateUtils";
import ComparisonBar from "../components/ComparisonBar";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [extraFilters, setExtraFilters] = useState<any>({});
  const { t } = useLanguage();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { selectedCountry } = useCountry();
  const { addToCompare, isInCompare, removeFromCompare } = useComparison();


  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Phase 2: Sorting & Pagination State
  const [sortBy, setSortBy] = useState("publishedAt:desc");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = selectedCountry.id === 'eg-ar' ? 'ar-EG' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
        setIsListening(false);
        fetchAds(transcript, selectedCategory, selectedSubCategory, minPrice, maxPrice, selectedCity);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert("Voice search is not supported in this browser.");
    }
  };

  const fetchAds = (query = "", category = "", subCat = "", minP = "", maxP = "", city = "", sort = "publishedAt:desc", pageNum = 1) => {
    setLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
    // Updated URL with Sort and Pagination
    let url = `${API_URL}/api/products?populate=*&filters[country][$eq]=${selectedCountry.id}&filters[approvalStatus][$eq]=approved&sort[0]=isFeatured:desc&sort[1]=${sort}&pagination[page]=${pageNum}&pagination[pageSize]=12`;

    // Build query filters
    const filters = [];
    if (query) filters.push(`filters[title][$containsi]=${encodeURIComponent(query)}`);
    if (category) filters.push(`filters[category][name][$eq]=${encodeURIComponent(category)}`);
    if (subCat) filters.push(`filters[sub_category][name][$eq]=${encodeURIComponent(subCat)}`);
    if (minP) filters.push(`filters[price][$gte]=${minP}`);
    if (maxP) filters.push(`filters[price][$lte]=${maxP}`);
    if (city) filters.push(`filters[city][$eq]=${encodeURIComponent(city)}`);

    // Advanced Filters
    if (extraFilters.minYear) filters.push(`filters[year][$gte]=${extraFilters.minYear}`);
    if (extraFilters.maxYear) filters.push(`filters[year][$lte]=${extraFilters.maxYear}`);
    if (extraFilters.maxKM) filters.push(`filters[mileage][$lte]=${extraFilters.maxKM}`);
    if (extraFilters.bedrooms) filters.push(`filters[bedrooms][$gte]=${extraFilters.bedrooms}`);
    if (extraFilters.bathrooms) filters.push(`filters[bathrooms][$gte]=${extraFilters.bathrooms}`);
    if (extraFilters.minArea) filters.push(`filters[area][$gte]=${extraFilters.minArea}`);

    if (filters.length > 0) {
      url += '&' + filters.join('&');
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (pageNum === 1) {
          setProducts(data.data || []);
        } else {
          setProducts(prev => [...prev, ...(data.data || [])]);
        }

        // Check for more pages
        if (data.meta && data.meta.pagination) {
          setHasMore(data.meta.pagination.page < data.meta.pagination.pageCount);
        } else {
          setHasMore(false);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching items:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    // Reset page to 1 on filter change
    setPage(1);
    fetchAds(searchTerm, selectedCategory, selectedSubCategory, minPrice, maxPrice, selectedCity, sortBy, 1);
  }, [selectedCountry.id, sortBy, extraFilters]); // Added new deps

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAds(searchTerm, selectedCategory, selectedSubCategory, minPrice, maxPrice, selectedCity, sortBy, nextPage);
  };

  useEffect(() => {
    if (selectedCategory) {
      // Fetch sub-categories
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';
      fetch(`${API_URL}/api/sub-categories?filters[category][name][$eq]=${encodeURIComponent(selectedCategory)}`)
        .then(res => res.json())
        .then(data => setSubCategories(data.data || []))
        .catch(err => console.error(err));
    } else {
      setSubCategories([]);
    }
    setSelectedSubCategory(""); // Reset sub-cat when cat changes
  }, [selectedCategory]);

  const handleSearch = () => {
    setPage(1);
    fetchAds(searchTerm, selectedCategory, selectedSubCategory, minPrice, maxPrice, selectedCity, sortBy, 1);
  };

  const handleCategoryClick = (cat: string) => {
    // If clicking same category, toggle off
    // If clicking different, select it
    const newCat = selectedCategory === cat ? "" : cat;
    setSelectedCategory(newCat);
    // Sub-category fetch is handled by useEffect
    setPage(1);
    fetchAds(searchTerm, newCat, "", minPrice, maxPrice, selectedCity, sortBy, 1);
  };

  const handleSubCategoryClick = (sub: string) => {
    const newSub = selectedSubCategory === sub ? "" : sub;
    setSelectedSubCategory(newSub);
    setPage(1);
    fetchAds(searchTerm, selectedCategory, newSub, minPrice, maxPrice, selectedCity, sortBy, 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <Header />

      <div className="container mx-auto px-4 pt-4">
        <StoriesBar />
      </div>

      {/* Hero Search with Glassmorphism */}
      <div className="relative overflow-hidden pt-12 pb-24 px-4 bg-gradient-to-br from-red-600 via-red-500 to-orange-500 dark:from-red-900 dark:via-gray-950 dark:to-red-950 rounded-b-[3rem] shadow-2xl mb-12">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-400/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
          <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-orange-300/10 rounded-full blur-[80px]"></div>
        </div>

        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-700">
            ✨ {t('home.newBadge')} - {t('home.heroSubtitle')}
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-8 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {t('home.heroTitle').split(' ').map((word, i) => (
              <span key={i} className="inline-block mr-2 lg:mr-4 last:mr-0">
                {word === 'Cars' || word === 'السيارات' ? <span className="text-yellow-300 drop-shadow-sm">{word}</span> : word}
              </span>
            ))}
          </h1>

          <div className="glass-effect p-2 rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in duration-700 delay-300 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder={t('home.searchPlaceholder')}
                  className="w-full px-8 py-5 rounded-[2rem] text-lg focus:outline-none focus:ring-0 text-gray-800 dark:text-white bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm border-none shadow-inner placeholder-gray-400 transition-all focus:bg-white dark:focus:bg-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />

                {/* Voice Search Button */}
                <button
                  onClick={startListening}
                  className={`absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ltr:right-6 rtl:left-6 rtl:right-auto ${isListening ? 'bg-red-100 text-red-600 animate-bounce' : 'text-gray-400'}`}
                  title="Voice Search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 1.5a3 3 0 0 1 3 3v1.5a3 3 0 0 1-6 0v-1.5a3 3 0 0 1 3-3Z" />
                  </svg>
                </button>
              </div>

              <button
                onClick={handleSearch}
                className="bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-[2rem] font-black text-lg transition-all shadow-xl hover:shadow-red-500/30 flex items-center justify-center gap-2 group"
              >
                <span>{t('home.searchButton')}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Filters - Glass Chips */}
          <div className="flex flex-wrap gap-3 justify-center mt-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <div className="flex glass-effect rounded-2xl overflow-hidden p-1 group hover:scale-105 transition-transform duration-300">
              <input
                type="number"
                placeholder={`${t('filters.min')}`}
                className="w-20 px-4 py-2 bg-transparent text-sm font-bold focus:outline-none text-white placeholder-white/60"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <div className="w-[1px] bg-white/20 my-2"></div>
              <input
                type="number"
                placeholder={`${t('filters.max')}`}
                className="w-20 px-4 py-2 bg-transparent text-sm font-bold focus:outline-none text-white placeholder-white/60"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            <div className="glass-effect rounded-2xl p-1 group hover:scale-105 transition-transform duration-300">
              <select
                className="bg-transparent text-white px-5 py-2 rounded-2xl text-sm font-bold focus:outline-none cursor-pointer [&>option]:text-gray-900"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">{t('filters.selectCity')}</option>
                {selectedCountry.cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSearch}
              className="bg-white text-red-600 px-8 py-3 rounded-2xl text-sm font-black shadow-2xl hover:bg-gray-100 active:scale-95 transition-all"
            >
              {t('filters.apply')}
            </button>
          </div>
        </div>
      </div>


      <main className="container mx-auto px-4 py-8">
        {/* Categories */}
        <div className="mb-12 text-center">
          <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-[72px] z-30 shadow-sm/50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80">
            <div className="container mx-auto">
            </div>
          </div>
        </div>


        {/* Sub-Categories Chips */}
        {
          selectedCategory && subCategories.length > 0 && (
            <div className="mb-10 flex flex-wrap justify-center gap-2 animate-in fade-in slide-in-from-top-4">
              {subCategories.map((sub: any) => (
                <button
                  key={sub.id || sub.documentId}
                  onClick={() => handleSubCategoryClick(sub.attributes?.name || sub.name)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition border ${selectedSubCategory === (sub.attributes?.name || sub.name)
                    ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                    : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700"
                    }`}
                >
                  {t(`subCategories.${sub.attributes?.name || sub.name}`) || sub.attributes?.name || sub.name}
                </button>
              ))}
            </div>
          )
        }

        {/* Recently Viewed */}
        <RecentlyViewed />

        <AdvancedFilters
          category={selectedCategory}
          filters={extraFilters}
          setFilters={setExtraFilters}
          onApply={handleSearch}
        />

        {/* Main Product Grid */}
        <div id="main-feed" className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-8 bg-red-600 rounded-full block"></span>
            {t('common.freshRecommendations')}
          </h2>

          {/* Sort Dropdown */}
          <div className="relative group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer shadow-sm"
            >
              <option value="publishedAt:desc">{t('common.sortNewest') || "Newest"}</option>
              <option value="price:asc">{t('common.sortPriceLow') || "Price: Low to High"}</option>
              <option value="price:desc">{t('common.sortPriceHigh') || "Price: High to Low"}</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900">{t('home.noProducts')}</h3>
            <p className="text-gray-500">{t('home.searchPlaceholder')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((ad: any, index: number) => (
              <div
                key={ad.documentId || ad.id}
                className={`group h-full animate-in fade-in slide-in-from-bottom-8 duration-700`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={ad} />
              </div>
            ))}
          </div>
        )}
        {/* Load More Button */}
        {hasMore && !loading && products.length > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={handleLoadMore}
              className="px-8 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              {t('common.loadMore') || "Load More Results"}
            </button>
          </div>
        )}
        {loading && page > 1 && (
          <div className="mt-8 text-center py-4">
            <div className="inline-block w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

      </main >

      <ComparisonBar />
    </div >
  );
}
