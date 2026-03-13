import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPromocodeByCodeName } from '../api/auth/promoCode.Api';
import { useToast } from '../components/Toast';
import { Coupon } from '../types';
import { formatDate } from '../api/auth/utils/dateFormatter';
import { Tag, Calendar, BadgePercent, ArrowLeft, Copy, CheckCircle } from 'lucide-react';

const PromoCodeDetail: React.FC = () => {
    const { promoCodeId } = useParams<{ promoCodeId: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [promo, setPromo] = useState<Coupon | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchPromo = async () => {
            if (!promoCodeId) return;
            setLoading(true);
            try {
                const data = await getPromocodeByCodeName(promoCodeId);
                setPromo(data?.data || data);
            } catch (err) {
                console.error("Failed to fetch promo details:", err);
                showToast("Failed to load promo code details.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchPromo();
    }, [promoCodeId]);

    const handleCopy = () => {
        if (!promo) return;
        navigator.clipboard.writeText(promo.code);
        setCopied(true);
        showToast("Promo code copied!", "success");
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
            </div>
        );
    }

    if (!promo) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-4">
                <Tag size={48} className="text-zinc-300 mb-4" />
                <h2 className="text-2xl font-serif font-bold text-zinc-900 mb-2">Promo Code Not Found</h2>
                <p className="text-zinc-500 mb-6">This offer may have expired or is no longer available.</p>
                <button 
                    onClick={() => navigate('/shop')}
                    className="px-6 py-2 bg-zinc-900 text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all"
                >
                    Back to Shop
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 pt-32 pb-20 px-4">
            <div className="max-w-2xl mx-auto">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-zinc-500 hover:text-black mb-8 transition-colors text-sm font-bold uppercase tracking-widest"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden">
                    <div className="bg-zinc-900 p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <div className="grid grid-cols-6 gap-4 p-4 transform -rotate-12">
                                {[...Array(24)].map((_, i) => (
                                    <Tag key={i} size={40} className="text-white" />
                                ))}
                            </div>
                        </div>

                        <div className="relative z-10 space-y-4">
                            <span className="inline-block px-4 py-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-lg">
                                Exclusive Offer
                            </span>
                            <h1 className="text-5xl font-serif font-bold italic text-white tracking-tight">
                                {promo.discountType === 'percentage' ? `${promo.discountValue}% Off` : `₹${promo.discountValue} Off`}
                            </h1>
                            <p className="text-zinc-400 text-sm font-medium max-w-md mx-auto leading-relaxed">
                                {promo.description || `Enjoy additional savings on your next purchase with this special promotional code.`}
                            </p>
                        </div>
                    </div>

                    <div className="p-12 space-y-10">
                        <div className="flex flex-col items-center gap-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Your Personal Code</p>
                            <div 
                                onClick={handleCopy}
                                className="group relative cursor-pointer"
                            >
                                <div className="px-10 py-5 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-2xl flex items-center gap-4 group-hover:border-zinc-900 transition-all">
                                    <span className="text-3xl font-mono font-black tracking-[0.2em] text-zinc-900 uppercase">
                                        {promo.code}
                                    </span>
                                    {copied ? <CheckCircle className="text-emerald-500" /> : <Copy className="text-zinc-300 group-hover:text-zinc-900" size={24} />}
                                </div>
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Click to copy</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-zinc-50">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <BadgePercent className="text-zinc-400" size={20} />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none mb-1">Constraints</p>
                                        <p className="text-sm font-bold text-zinc-900">Min. Purchase: ₹{promo.minOrderAmount.toLocaleString('en-IN')}</p>
                                        {promo.maxDiscountAmount && <p className="text-[10px] font-bold text-zinc-500">Max Discount: ₹{promo.maxDiscountAmount.toLocaleString('en-IN')}</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="text-zinc-400" size={20} />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none mb-1">Validity</p>
                                        <p className="text-sm font-bold text-zinc-900">Until {promo.endDate ? formatDate(promo.endDate) : 'Further Notice'}</p>
                                        <p className="text-[10px] font-bold text-zinc-500">Valid from {promo.startDate ? formatDate(promo.startDate) : 'Today'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 text-center">
                            <button 
                                onClick={() => navigate('/shop')}
                                className="w-full py-4 bg-zinc-900 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-zinc-800 transition-all shadow-xl hover:shadow-2xl active:scale-95"
                            >
                                Shop with this code
                            </button>
                            <p className="mt-6 text-[10px] text-zinc-400 font-medium leading-relaxed uppercase tracking-tighter">
                                *Terms and conditions apply. One use per customer. <br /> Valid across all existing archives and new arrivals.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromoCodeDetail;
