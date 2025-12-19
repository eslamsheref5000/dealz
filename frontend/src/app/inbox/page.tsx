"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../components/Header";
import moment from "moment";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space'}/api`;

import { useLanguage } from "../../context/LanguageContext";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

function InboxContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useLanguage();

    // ... (state vars same)
    const querySellerId = searchParams.get('seller');
    const queryProductId = searchParams.get('product');

    const [user, setUser] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const activeConvIdRef = useRef(activeConvId);

    // Sync ref with state
    useEffect(() => {
        activeConvIdRef.current = activeConvId;
    }, [activeConvId]);

    // 1. Initial Auth Check
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
            return;
        }
        setUser(JSON.parse(storedUser));
    }, [router]);

    // ... (fetch logic same) -> we only need to update the UI parts lower down inside return.

    const fetchMessages = async () => {
        if (!user) return;
        const token = localStorage.getItem("jwt");

        try {
            // Fetch messages where user is sender OR receiver
            const [sentRes, receivedRes] = await Promise.all([
                fetch(`${API_BASE}/messages?filters[sender][id][$eq]=${user.id}&populate=*`, {
                    headers: { "Authorization": `Bearer ${token}` }
                }),
                fetch(`${API_BASE}/messages?filters[receiver][id][$eq]=${user.id}&populate=*`, {
                    headers: { "Authorization": `Bearer ${token}` }
                })
            ]);

            const sent = await sentRes.json();
            const received = await receivedRes.json();

            const allMessages = [...(sent.data || []), ...(received.data || [])]
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

            setMessages(allMessages);

            // Grouping logic: Conversation = Other User ID + Product ID
            const threads: Record<string, any> = {};

            allMessages.forEach(msg => {
                const other = (msg.sender?.id === user.id) ? msg.receiver : msg.sender;
                if (!other) return;

                const productDocId = msg.product?.documentId || msg.product?.id || 'gen';
                const threadKey = `${other.id}-${productDocId}`;
                if (!threads[threadKey]) {
                    threads[threadKey] = {
                        key: threadKey,
                        otherUser: other,
                        product: msg.product,
                        lastMessage: msg,
                        messages: []
                    };
                }
                threads[threadKey].messages.push(msg);
                threads[threadKey].lastMessage = msg;
            });

            // Convert to array and sort by last message
            const sortedThreads = Object.values(threads).sort((a, b) =>
                new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
            );

            setConversations(sortedThreads);
            setLoading(false);

            if (querySellerId && queryProductId && !activeConvIdRef.current) {
                const matchConv = sortedThreads.find(c =>
                    (c.otherUser.id.toString() === querySellerId || c.otherUser.documentId === querySellerId) &&
                    (c.product?.documentId === queryProductId || c.product?.id?.toString() === queryProductId)
                );

                const preKey = matchConv ? matchConv.key : `${querySellerId}-${queryProductId}`;
                setActiveConvId(preKey);
            }
        } catch (err) {
            console.error("Fetch Messages Error:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMessages();
            const interval = setInterval(() => {
                fetchMessages();
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [user, querySellerId, queryProductId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, activeConvId]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !imageFile) || !activeConvId || !user) return;

        const token = localStorage.getItem("jwt");
        const activeThread = conversations.find(c => c.key === activeConvId);

        const receiverId = activeThread ? (activeThread.otherUser.documentId || activeThread.otherUser.id) : querySellerId;
        const productDocId = activeThread ? (activeThread.product?.documentId || activeThread.product?.id) : queryProductId;

        let uploadedImageId = null;

        if (imageFile) {
            setUploadingImage(true);
            try {
                const formData = new FormData();
                formData.append('files', imageFile);
                const uploadRes = await fetch(`${API_BASE.replace('/api', '')}/api/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });
                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    uploadedImageId = uploadData[0].id;
                }
            } catch (err) {
                console.error("Image Upload Error:", err);
            } finally {
                setUploadingImage(false);
            }
        }

        const payload = {
            data: {
                content: newMessage || (imageFile ? "📷 Photo" : ""),
                sender: user.id,
                receiver: receiverId,
                product: productDocId,
                image: uploadedImageId
            }
        };

        try {
            const res = await fetch(`${API_BASE}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setNewMessage("");
                setImageFile(null);
                fetchMessages();
            } else {
                alert("Failed to send message. Ensure you have permissions.");
            }
        } catch (err) {
            console.error("Send Error:", err);
        }
    };

    const activeThread = conversations.find(c => c.key === activeConvId);

    if (loading && conversations.length === 0) {
        return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300"><Header /><div className="text-center py-20 text-gray-900 dark:text-white">{t('common.loading')}</div></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col h-screen overflow-hidden transition-colors duration-300">
            <Header />

            <div className="flex-1 container mx-auto px-4 py-8 flex gap-6 overflow-hidden">
                {/* Conversations Sidebar */}
                <div className="w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden hidden md:flex">
                    <div className="p-4 border-b dark:border-gray-800">
                        <h2 className="font-bold text-xl text-gray-900 dark:text-white">{t('inbox.chats')}</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 && !querySellerId && (
                            <div className="p-6 text-center text-gray-400 text-sm">{t('inbox.noConversations')}</div>
                        )}
                        {conversations.map(conv => (
                            <button
                                key={conv.key}
                                onClick={() => setActiveConvId(conv.key)}
                                className={`w-full p-4 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition border-b dark:border-gray-800 ${activeConvId === conv.key
                                    ? "bg-red-50 dark:bg-red-900/10 border-r-4 border-r-red-600 rtl:border-r-0 rtl:border-l-4 rtl:border-l-red-600"
                                    : ""}`}
                            >
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-xl shrink-0">👤</div>
                                <div className="text-left rtl:text-right overflow-hidden">
                                    <div className="font-bold text-gray-900 dark:text-gray-100 truncate">{conv.otherUser.username}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{conv.product?.title || t('inbox.newChat')}</div>
                                    <div className="text-sm text-gray-400 dark:text-gray-500 truncate mt-1">{conv.lastMessage.content}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
                    {activeConvId ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-800 flex items-center gap-4">
                                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {activeThread?.otherUser.username[0].toUpperCase() || "?"}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{activeThread?.otherUser.username || t('inbox.newChat')}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {activeThread?.product?.title ? `${t('postAd.labels.title')}: ${activeThread.product.title}` : t('inbox.negotiation')}
                                    </p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
                                {activeThread?.messages.map((msg: any) => {
                                    const isMe = msg.sender.id === user.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${isMe
                                                ? "bg-red-600 text-white rounded-tr-none rtl:rounded-tr-2xl rtl:rounded-tl-none"
                                                : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none rtl:rounded-tl-2xl rtl:rounded-tr-none"
                                                }`}>
                                                {msg.image && (
                                                    <div className="mb-2 rounded-lg overflow-hidden border border-black/5 dark:border-white/5">
                                                        <img
                                                            src={`${msg.image.url.startsWith('http') ? msg.image.url : `${process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space'}${msg.image.url}`}`}
                                                            alt="Sent image"
                                                            className="max-w-full h-auto cursor-pointer hover:opacity-90 transition"
                                                            onClick={() => window.open(`${msg.image.url.startsWith('http') ? msg.image.url : `${process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space'}${msg.image.url}`}`, '_blank')}
                                                        />
                                                    </div>
                                                )}
                                                <p className="text-[15px]">{msg.content}</p>
                                                <div className={`text-[10px] mt-1 text-right ${isMe ? "text-red-100" : "text-gray-400 dark:text-gray-500"}`}>
                                                    {moment(msg.createdAt).format("h:mm A")}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSend} className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col gap-3">
                                {imageFile && (
                                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-2 rounded-xl animate-in zoom-in duration-300">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden border">
                                            <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" alt="Preview" />
                                        </div>
                                        <span className="text-xs text-gray-500 truncate flex-1">{imageFile.name}</span>
                                        <button onClick={() => setImageFile(null)} className="text-red-500 font-bold p-2">✕</button>
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('chat-image-input')?.click()}
                                        className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32a1.5 1.5 0 0 1-2.121-2.121l10.94-10.94a.75.75 0 1 1 1.06 1.06l-10.94 10.94a5.25 5.25 0 0 0 7.424 7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835" />
                                        </svg>
                                    </button>
                                    <input
                                        type="file"
                                        id="chat-image-input"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => e.target.files?.[0] && setImageFile(e.target.files[0])}
                                    />
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={t('inbox.typeMessage')}
                                        className="flex-1 h-12 px-5 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                                    />
                                    <button
                                        type="submit"
                                        disabled={uploadingImage}
                                        className="h-12 px-8 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-50"
                                    >
                                        {uploadingImage ? "..." : t('inbox.send')}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/30 dark:bg-gray-950/30">
                            <div className="text-6xl mb-4">💬</div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t('inbox.selectConversation')}</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm">{t('inbox.selectPrompt')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function InboxPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Inbox...</div>}>
            <InboxContent />
        </Suspense>
    );
}
