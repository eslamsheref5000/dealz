import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { X, Building2, CreditCard, Wallet } from "lucide-react";

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableBalance: number;
    currency: string;
    onSuccess: () => void;
}

export default function WithdrawalModal({ isOpen, onClose, availableBalance, currency, onSuccess }: WithdrawalModalProps) {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("bank_transfer");
    const [details, setDetails] = useState({
        accountName: "",
        accountNumber: "",
        bankName: "",
        iban: "",
        phone: "",
        email: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const numAmount = Number(amount);
        if (numAmount <= 0) {
            return showToast("Amount must be greater than 0", "error");
        }
        if (numAmount > availableBalance) {
            return showToast("Insufficient funds", "error");
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("jwt");
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shando5000-dealz.hf.space';

            const payload = {
                amount: numAmount,
                method,
                details: formatDetails()
            };

            const res = await fetch(`${API_URL}/api/wallet/withdraw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                showToast("Withdrawal request submitted!", "success");
                onSuccess();
                onClose();
            } else {
                showToast(data.error?.message || "Failed to submit request", "error");
            }

        } catch (err) {
            console.error(err);
            showToast("Network error occurred", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDetails = () => {
        if (method === 'bank_transfer') {
            return {
                type: 'Bank Transfer',
                bankName: details.bankName,
                accountName: details.accountName,
                iban: details.iban,
                accountNumber: details.accountNumber
            };
        } else if (method === 'instapay') {
            return {
                type: 'Instapay',
                phone: details.phone
            };
        } else if (method === 'paypal') {
            return {
                type: 'PayPal',
                email: details.email
            };
        }
        return {};
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDetails({ ...details, [e.target.name]: e.target.value });
    };

    const getMethodIcon = (m: string) => {
        switch (m) {
            case 'bank_transfer': return <Building2 size={20} />;
            case 'instapay': return <CreditCard size={20} />;
            case 'paypal': return <Wallet size={20} />;
            default: return <Wallet size={20} />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 m-4">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Wallet size={24} />
                        {t('wallet.withdraw') || "Withdraw Funds"}
                    </h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Amount Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('wallet.amount') || "Amount"} ({currency})
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                max={availableBalance}
                                required
                                className="block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none transition"
                                placeholder={`Max: ${availableBalance}`}
                            />
                            <button
                                type="button"
                                onClick={() => setAmount(availableBalance.toString())}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded hover:bg-blue-200"
                            >
                                MAX
                            </button>
                        </div>
                    </div>

                    {/* Method Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('wallet.method') || "Withdrawal Method"}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {['bank_transfer', 'instapay', 'paypal'].map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setMethod(m)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${method === m ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500'}`}
                                >
                                    {getMethodIcon(m)}
                                    <span className="text-[10px] uppercase font-bold mt-1">{m.replace('_', ' ')}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dynamic Fields */}
                    <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
                        {method === 'bank_transfer' && (
                            <>
                                <input name="bankName" placeholder="Bank Name" required className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:text-white" onChange={handleChange} />
                                <input name="accountName" placeholder="Account Holder Name" required className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:text-white" onChange={handleChange} />
                                <input name="iban" placeholder="IBAN / Account Number" required className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:text-white" onChange={handleChange} />
                            </>
                        )}
                        {method === 'instapay' && (
                            <input name="phone" placeholder="Instapay Phone Number / IPA" required className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:text-white" onChange={handleChange} />
                        )}
                        {method === 'paypal' && (
                            <input name="email" type="email" placeholder="PayPal Email" required className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:text-white" onChange={handleChange} />
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Processing..." : "Confirm Withdrawal"}
                    </button>

                </form>
            </div>
        </div>
    );
}
