"use client";

import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import {
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Linkedin,
    Smartphone,
    CreditCard,
    Send,
    ArrowUp,
    QrCode,
    ChevronDown,
    Activity,
    Users,
    Tag,
    ShieldCheck,
    X,
    Truck,
    Globe,
    Zap,
    Leaf,
    Crown,
    Bot,
    Award,
    Bitcoin,
    Clock,
    TrendingUp,
    Mic,
    CloudSun,
    Glasses,
    Box,
    Fingerprint,
    Cpu,
    BrainCircuit,
    Plane,
    Languages,
    Wifi,
    MapPin,
    Radio
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Footer() {
    const { t, locale } = useLanguage();
    const [openSection, setOpenSection] = useState<string | null>(null);
    const [showCookieConsent, setShowCookieConsent] = useState(false);
    const [activeTickerIndex, setActiveTickerIndex] = useState(0);
    const [time, setTime] = useState<Date | null>(null);

    // Activation States
    const [showChat, setShowChat] = useState(false);
    const [showVR, setShowVR] = useState(false);
    const [showNeural, setShowNeural] = useState(false);
    const [showDrone, setShowDrone] = useState(false);
    const [isQuantumScanning, setIsQuantumScanning] = useState(false);
    const [galacticMode, setGalacticMode] = useState(false);

    const [chatMessages, setChatMessages] = useState<{ sender: 'bot' | 'user', text: string }[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [tokenPrice, setTokenPrice] = useState(42.50);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Mock Live Activity Data
    const activities = [
        { user: "Ali", action: t('footer.justSold'), item: "iPhone 15 Pro", location: "Dubai" },
        { user: "Sarah", action: t('footer.justSold'), item: "Toyota Camry", location: "Abu Dhabi" },
        { user: "Ahmed", action: t('footer.justSold'), item: "PS5 Console", location: "Sharjah" },
        { user: "John", action: t('footer.justSold'), item: "MacBook Air", location: "Riyadh" },
    ];

    useEffect(() => {
        setTime(new Date());

        // Dynamic Ticker & Token Price
        const interval = setInterval(() => {
            setActiveTickerIndex((prev) => (prev + 1) % activities.length);
            setTime(new Date());
            setTokenPrice(prev => prev + (Math.random() - 0.4) * 0.1); // Fluctuate price
        }, 3000);

        // Mock cookie check
        const consent = localStorage.getItem("dealz_cookie_consent");
        if (!consent) {
            setTimeout(() => setShowCookieConsent(true), 1500);
        }

        // Initialize Chat
        if (chatMessages.length === 0) {
            setChatMessages([{ sender: 'bot', text: t('footer.chatWelcome') }]);
        }

        return () => clearInterval(interval);
    }, [activities.length, chatMessages.length, t]);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleAcceptCookies = () => {
        localStorage.setItem("dealz_cookie_consent", "true");
        setShowCookieConsent(false);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleSection = (title: string) => {
        setOpenSection(openSection === title ? null : title);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        setChatMessages(prev => [...prev, { sender: 'user', text: chatInput }]);
        setChatInput("");

        // Mock Response
        setTimeout(() => {
            setChatMessages(prev => [...prev, { sender: 'bot', text: "I am a demo AI. Actual intelligence coming in V11! 🤖" }]);
        }, 1000);
    };

    const triggerQuantumScan = () => {
        setIsQuantumScanning(true);
        setTimeout(() => setIsQuantumScanning(false), 3000);
    };

    const triggerHaptics = () => {
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
    };

    const stats = [
        { icon: Tag, label: t('footer.adsPosted'), value: "1M+" },
        { icon: Users, label: t('footer.activeUsers'), value: "500K+" },
        { icon: Activity, label: t('footer.dailyDeals'), value: "10K+" },
    ];

    const sections = [
        {
            title: t('footer.trending'),
            links: [
                { label: t('categories.Motors'), href: "/c/Motors" },
                { label: t('categories.Properties'), href: "/c/Properties" },
                { label: t('categories.Mobiles'), href: "/c/Mobiles" },
                { label: t('categories.Jobs'), href: "/c/Jobs" },
                { label: t('categories.Electronics'), href: "/c/Electronics" },
            ]
        },
        {
            title: t('footer.support'),
            links: [
                { label: t('footer.helpCenter'), href: "/help" },
                { label: t('footer.contactUs'), href: "/help" },
                { label: t('footer.safety'), href: "/help" },
                { label: t('footer.sitemap'), href: "/sitemap" },
                { label: t('footer.about'), href: "/help" },
            ]
        },
        {
            title: t('common.dealz'),
            links: [
                { label: t('footer.about'), href: "/help" },
                { label: t('footer.careers'), href: "/help" },
                { label: t('footer.privacy'), href: "/privacy" },
                { label: t('footer.terms'), href: "/terms" },
            ]
        }
    ];

    const socialIcons = [
        { Icon: Facebook, href: "#", color: "hover:text-blue-600" },
        { Icon: Twitter, href: "#", color: "hover:text-sky-500" },
        { Icon: Instagram, href: "#", color: "hover:text-pink-600" },
        { Icon: Linkedin, href: "#", color: "hover:text-blue-700" },
        { Icon: Youtube, href: "#", color: "hover:text-red-600" },
    ];

    // Format time helpers
    const formatTime = (offset: number) => {
        if (!time) return "00:00";
        const d = new Date(time.getTime() + offset * 3600 * 1000);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    return (
        <div className={`relative ${galacticMode ? 'font-mono' : ''}`}>
            {/* V10 Exclusive: Singularity Top Bar */}
            <div className="bg-gray-900 border-t-4 border-red-600 text-white py-2 overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center relative z-10 gap-4 md:gap-0">

                    {/* Live Ticker & V8: DLZ Token & V10: Zero Latency */}
                    <div className="flex items-center gap-4 bg-gray-800/50 py-1.5 px-4 rounded-full border border-gray-700 w-full md:w-auto overflow-hidden">
                        <div className="flex items-center gap-2 text-red-500 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap">
                            <Zap size={12} className="fill-current animate-pulse" />
                            {t('footer.recentActivity')}
                        </div>
                        <div className="h-4 w-[1px] bg-gray-600 hidden md:block"></div>
                        <div className="text-xs text-gray-300 truncate w-full md:w-36 relative h-4">
                            {activities.map((activity, idx) => (
                                <div
                                    key={idx}
                                    className={`absolute inset-0 transition-all duration-500 transform ${idx === activeTickerIndex ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                                        }`}
                                >
                                    <span className="font-bold text-white">{activity.user}</span> {activity.action} <span className="text-red-400">{activity.item}</span>
                                </div>
                            ))}
                        </div>
                        {/* V8 DLZ Token (Active) */}
                        <div className="hidden md:flex items-center gap-2 border-l border-gray-600 pl-4 border-r pr-4">
                            <TrendingUp size={12} className="text-green-500" />
                            <span className="text-[10px] font-mono text-gray-300">
                                {t('footer.dlzToken')}: <span className="text-green-400 font-bold">${tokenPrice.toFixed(2)}</span> <span className="text-green-600 text-[9px]">(+{(tokenPrice - 40).toFixed(1)}%)</span>
                            </span>
                        </div>
                        {/* V10 Zero Latency */}
                        <div className="hidden lg:flex items-center gap-1.5 text-[9px] text-gray-400">
                            <Wifi size={10} className="text-emerald-500" />
                            <span>{t('footer.zeroLatency')}</span>
                        </div>
                    </div>

                    {/* V9: VR Mode & V10: Neural Link */}
                    <div className="hidden lg:flex items-center gap-4 text-[10px] text-gray-400 font-mono">
                        {/* V10: Neural Link Button (Active) */}
                        <button
                            onClick={() => setShowNeural(true)}
                            className="flex items-center gap-2 px-3 py-1 bg-pink-900/30 border border-pink-500/30 rounded-full hover:bg-pink-900/50 transition-colors group/neural"
                        >
                            <BrainCircuit size={14} className="text-pink-400 group-hover/neural:animate-pulse" />
                            <span className="text-pink-200 font-bold">{t('footer.neuralLink')}</span>
                        </button>

                        {/* V9: VR Mode Button (Active) */}
                        <button
                            onClick={() => setShowVR(true)}
                            className="flex items-center gap-2 px-3 py-1 bg-purple-900/30 border border-purple-500/30 rounded-full hover:bg-purple-900/50 transition-colors group/vr"
                        >
                            <Glasses size={14} className="text-purple-400 group-hover/vr:rotate-180 transition-transform duration-700" />
                            <span className="text-purple-200 font-bold">{t('footer.enterVR')}</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <Clock size={12} className="text-gray-500" />
                            <span className="text-gray-300">DXB {time ? time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-12 pb-8 transition-colors duration-300 relative group/footer">
                {/* Back to Top Button */}
                <button
                    onClick={scrollToTop}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 hover:scale-110 transition-all opacity-0 group-hover/footer:opacity-100 md:opacity-100 z-10 ring-4 ring-white dark:ring-gray-900"
                    aria-label={t('footer.backToTop')}
                >
                    <ArrowUp size={20} />
                </button>

                {/* V7/V8: AI Assistant with Voice (Active) */}
                <div className="absolute top-0 right-8 -translate-y-1/2 hidden md:block z-20">
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/ai-btn:opacity-100 transition-opacity whitespace-nowrap">
                            {t('footer.voiceCmd')}
                        </div>
                        <button
                            onClick={() => setShowChat(!showChat)}
                            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white pl-4 pr-6 py-3 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group/ai-btn relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/ai-btn:translate-x-[100%] transition-transform duration-1000"></div>
                            <div className="bg-white/20 p-1.5 rounded-full animate-pulse">
                                <Bot size={18} />
                            </div>
                            <span className="font-bold text-sm tracking-wide">{t('footer.askAI')}</span>
                            <div className="ml-2 border-l border-white/20 pl-2">
                                <Mic size={14} className="opacity-70 group-hover/ai-btn:opacity-100" />
                            </div>
                        </button>
                    </div>
                    {/* Active Chat Window */}
                    {showChat && (
                        <div className="absolute bottom-16 right-0 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                            <div className="bg-violet-600 p-4 text-white flex justify-between items-center">
                                <h4 className="font-bold flex items-center gap-2"><Bot size={16} /> Dealz AI</h4>
                                <button onClick={() => setShowChat(false)}><X size={16} /></button>
                            </div>
                            <div className="h-64 p-4 overflow-y-auto bg-gray-50 dark:bg-black/50 space-y-3">
                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${msg.sender === 'user' ? 'bg-violet-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder={t('footer.chatPlaceholder')}
                                    className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                                <button type="submit" className="bg-violet-600 text-white p-2 rounded-full hover:bg-violet-700 transition-colors">
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">

                        {/* Brand Column */}
                        <div className="lg:col-span-4 space-y-6">
                            <Link href="/" className="group inline-block">
                                <span className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 tracking-tighter hover:to-red-800 transition-all ${galacticMode ? 'font-serif' : ''}`}>
                                    Dealz.
                                </span>
                            </Link>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed border-l-2 border-red-100 dark:border-red-900 pl-4">
                                {t('footer.brandParams')}
                            </p>

                            {/* V10: Galactic Language (Activated) & V5: Currency Selector */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setGalacticMode(!galacticMode)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${galacticMode ? 'bg-purple-900/30 text-purple-400 border border-purple-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                >
                                    <Languages size={14} className={galacticMode ? "text-purple-400" : "text-gray-500"} />
                                    {/* V10 Galactic Lang Option */}
                                    {isActive => galacticMode ? "⏃⌖⟒⌰⌇" : (locale === 'en' ? 'English' : locale === 'ar' ? 'العربية' : locale === 'fr' ? 'Français' : locale === 'hi' ? 'हिंदी' : 'اردو')}
                                    <span className="text-[9px] ml-1 opacity-70">({t('footer.galacticLang')})</span>
                                </button>
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                    <span className="text-gray-500 font-bold">$</span>
                                    USD
                                </button>
                            </div>

                            {/* V8: Holographic Elite Card & V9: NFT Gallery Link */}
                            <div className="group/elite perspective-1000">
                                <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl border border-yellow-500/30 shadow-xl relative overflow-hidden transition-transform duration-500 transform preserve-3d group-hover/elite:rotate-x-12 group-hover/elite:rotate-y-12 group-hover/elite:scale-105">
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>

                                    <div className="flex items-start justify-between relative z-10 mb-4 translate-z-10">
                                        <div>
                                            <h4 className="font-bold text-yellow-500 text-lg mb-1 flex items-center gap-2">
                                                <Crown size={18} className="fill-current" />
                                                {t('footer.dealzElite')}
                                            </h4>
                                            <p className="text-xs text-gray-400">Unlock 0% fees & priority support.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 relative z-10 translate-z-20">
                                        <button className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold py-2.5 rounded-xl transition-all shadow-md text-sm">
                                            {t('footer.joinElite')}
                                        </button>
                                        <button className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 text-gray-300 py-2 rounded-xl text-xs transition-colors backdrop-blur-sm border border-white/5">
                                            <Box size={12} />
                                            {t('footer.nftGallery')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Links Columns */}
                        <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
                            {sections.map((section, idx) => (
                                <div key={idx} className="border-b border-gray-100 dark:border-gray-800 md:border-none pb-4 md:pb-0">
                                    <button
                                        onClick={() => toggleSection(section.title)}
                                        className="flex w-full md:w-auto justify-between items-center md:cursor-default"
                                    >
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg md:mb-6">{section.title}</h3>
                                        <ChevronDown
                                            className={`md:hidden text-gray-400 transition-transform duration-300 ${openSection === section.title ? 'rotate-180' : ''}`}
                                            size={20}
                                        />
                                    </button>
                                    <ul className={`space-y-3 mt-4 md:mt-0 ${openSection === section.title ? 'block' : 'hidden md:block'}`}>
                                        {section.links.map((link, lIdx) => (
                                            <li key={lIdx}>
                                                <Link href={link.href} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 text-sm transition-colors flex items-center gap-2 group w-fit">
                                                    <span className="w-0 group-hover:w-1.5 h-1.5 rounded-full bg-red-600 transition-all duration-300 opacity-0 group-hover:opacity-100"></span>
                                                    <span className="relative">
                                                        {link.label}
                                                        <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-red-600 transition-all group-hover:w-full"></span>
                                                    </span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* App & Socials Column */}
                        <div className="lg:col-span-3 space-y-8">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">{t('footer.followUs')}</h3>
                                <div className="flex gap-4">
                                    {socialIcons.map(({ Icon, href, color }, idx) => (
                                        <a key={idx} href={href} className={`w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 ${color} transition-all hover:scale-110 hover:shadow-md hover:border-red-100 dark:hover:border-red-900`}>
                                            <Icon size={20} />
                                        </a>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">{t('footer.downloadApp')}</h3>
                                <div className="bg-gray-900 text-white p-5 rounded-2xl shadow-xl flex items-center gap-4 relative overflow-hidden group/app">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover/app:bg-white/10 transition-all"></div>
                                    <div className="bg-white p-2 rounded-xl shadow-sm z-10">
                                        <QrCode className="w-14 h-14 text-black" />
                                    </div>
                                    <div className="space-y-2 z-10 w-full">
                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                                            {t('footer.scanToDownload')}
                                        </p>
                                        <div className="flex flex-col gap-2">
                                            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors text-xs w-full backdrop-blur-sm border border-white/5">
                                                <Smartphone size={14} className="text-white" />
                                                <span className="font-bold">App Store</span>
                                            </button>
                                            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors text-xs w-full backdrop-blur-sm border border-white/5">
                                                <div className="w-3.5 h-3.5 flex items-center justify-center bg-white text-black rounded-full text-[8px] font-bold">▶</div>
                                                <span className="font-bold">Google Play</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar: Logistics, Payment, Crypto */}
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-8 mt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                            <div className="space-y-2 text-center md:text-left">
                                <p className="text-sm text-gray-400">
                                    © {new Date().getFullYear()} Dealz. {t('footer.rights')}.
                                </p>
                                {/* V9: Haptics & V10: Drone Delivery (Active) */}
                                <div className="hidden md:flex items-center gap-4 text-xs text-gray-400">
                                    <div className="flex items-center gap-2 text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        {t('footer.statusOperational')}
                                    </div>
                                    {/* V9 Active Haptics */}
                                    <button
                                        onClick={triggerHaptics}
                                        className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-gray-100 dark:border-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 active:scale-95 transition-all text-indigo-400 font-bold uppercase tracking-widest"
                                    >
                                        <Fingerprint size={10} className="text-indigo-500" />
                                        {t('footer.haptics')}
                                    </button>
                                    {/* V10 Active Drone */}
                                    <button
                                        onClick={() => setShowDrone(true)}
                                        className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/10 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all font-bold uppercase"
                                    >
                                        <Plane size={10} className="text-blue-500" />
                                        {t('footer.droneDelivery')}
                                    </button>
                                </div>
                            </div>

                            {/* V7: Award & Crypto Badge & V9 Quantum Badge (Active) */}
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full border border-yellow-100 dark:border-yellow-700/30">
                                    <Award size={14} className="text-yellow-600 dark:text-yellow-500" />
                                    <span className="text-[10px] font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-wide">{t('footer.bestTechAward')}</span>
                                </div>

                                <div className="flex items-center gap-3 text-gray-400">
                                    <div className="flex -space-x-1">
                                        <div className="h-6 w-8 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-l flex items-center justify-center relative z-10"><CreditCard size={12} /></div>
                                        <div className="h-6 w-8 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-r flex items-center justify-center relative z-0"><Bitcoin size={12} className="text-orange-500" /></div>
                                    </div>
                                    {/* V9 Active Quantum Badge */}
                                    <button
                                        onClick={triggerQuantumScan}
                                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded border transition-all ${isQuantumScanning ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/50' : 'bg-cyan-900/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400'}`}
                                    >
                                        <Cpu size={10} className={isQuantumScanning ? "animate-spin" : "text-cyan-500"} />
                                        <span className="text-[9px] font-bold">{isQuantumScanning ? t('footer.quantumSafe') : t('footer.quantumSecured')}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-6 text-sm text-gray-400">
                                <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                    {t('footer.privacyShort')}
                                </Link>
                                <Link href="/terms" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                    {t('footer.termsShort')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Cookie Consent Modal */}
            {showCookieConsent && (
                <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-500">
                    <button onClick={() => setShowCookieConsent(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={16} />
                    </button>
                    <div className="flex items-start gap-4 mb-4">
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-full text-red-600 dark:text-red-400">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-1">{t('footer.cookieTitle')}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                {t('footer.cookieDesc')}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleAcceptCookies}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-medium transition-colors text-sm"
                        >
                            {t('footer.accept')}
                        </button>
                        <button
                            onClick={() => setShowCookieConsent(false)}
                            className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white py-2.5 rounded-xl font-medium transition-colors text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* V10: VR Mode Modal */}
            {showVR && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="text-center space-y-6 max-w-md px-4">
                        <div className="relative mx-auto w-24 h-24">
                            <div className="absolute inset-0 bg-purple-500 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                            <Glasses size={96} className="text-white relative z-10" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white mb-2">{t('footer.vrTitle')}</h2>
                            <p className="text-purple-200 text-lg">{t('footer.vrDesc')}</p>
                        </div>
                        <div className="flex flex-col gap-3 pt-8">
                            <div className="flex items-center justify-center gap-2 text-white/50 text-sm uppercase tracking-widest font-mono">
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
                                {t('footer.simulated')}
                            </div>
                            <button onClick={() => setShowVR(false)} className="text-white hover:text-purple-400 transition-colors">Close Simulation</button>
                        </div>
                    </div>
                </div>
            )}

            {/* V10: Neural Link Modal */}
            {showNeural && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
                    <div className="text-center space-y-6 max-w-md px-4">
                        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                            <div className="absolute inset-0 border-4 border-pink-500/30 rounded-full animate-[spin_3s_linear_infinite]"></div>
                            <div className="absolute inset-4 border-4 border-pink-500/50 rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
                            <BrainCircuit size={64} className="text-pink-500 relative z-10" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500 mb-2">{t('footer.neuralTitle')}</h2>
                            <p className="text-pink-200/50 font-mono text-sm">{t('footer.neuralDesc')}</p>
                        </div>
                        <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-pink-500 w-2/3 animate-[shimmer_1s_infinite]"></div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="text-pink-500 text-xs font-mono animate-pulse">
                                {t('footer.connecting')}
                            </div>
                            <button onClick={() => setShowNeural(false)} className="text-gray-500 hover:text-white transition-colors text-xs mt-8">Abort Connection</button>
                        </div>
                    </div>
                </div>
            )}

            {/* V10: Drone Tracking Modal */}
            {showDrone && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-900/90 backdrop-blur-2xl animate-in fade-in duration-500">
                    <div className="w-full max-w-lg bg-gray-900 border border-blue-500/30 rounded-3xl overflow-hidden shadow-2xl m-4">
                        <div className="h-48 bg-gray-800 relative overflow-hidden">
                            {/* Fake Map Grid */}
                            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-32 h-32 border-2 border-blue-500/20 rounded-full animate-ping absolute"></div>
                                <Plane className="text-blue-400 rotate-45 animate-bounce relative z-10" size={32} />
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Radio className="text-blue-500 animate-pulse" size={20} />
                                    {t('footer.droneTrack')}
                                </h3>
                                <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded font-mono">LIVE</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm text-gray-400 border-b border-gray-800 pb-2">
                                    <span>Status</span>
                                    <span className="text-green-400">In Transit</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-400 border-b border-gray-800 pb-2">
                                    <span>Altitude</span>
                                    <span className="text-white font-mono">450ft</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>Speed</span>
                                    <span className="text-white font-mono">120 km/h</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDrone(false)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                Close Tracker
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
