import React, { useState } from 'react';
import { Star, MessageCircle, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface Review {
    id: string;
    product_name: string;
    customer_name: string;
    rating: number;
    comment: string;
    status: 'published' | 'pending' | 'flagged';
}

const ReviewManager: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([
        { id: '1', product_name: 'Premium Silk Saree', customer_name: 'Anjali Sharma', rating: 5, comment: 'Absolutely gorgeous! The fabric is high quality.', status: 'published' },
        { id: '2', product_name: 'Cotton Kurti', customer_name: 'Vikram Singh', rating: 4, comment: 'Good fit, but color is slightly different from photo.', status: 'pending' },
    ]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out font-sans">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter premium-gradient-text">Public Sentiment</h1>
                    <p className="text-black text-sm font-medium">Monitor customer reflections and maintain your heritage reputation</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                        <div className="flex-grow space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900">{review.customer_name}</span>
                                    <span className="text-zinc-600">•</span>
                                    <span className="text-xs text-blue-600 font-black uppercase tracking-widest">{review.product_name}</span>
                                </div>
                                <div className="flex gap-1 text-black">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth={3} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 italic font-serif leading-relaxed px-4 py-2.5 bg-gray-50/50 rounded-xl border border-gray-100">"{review.comment}"</p>
                            <div className="flex items-center gap-3 pt-2">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border ${review.status === 'published' ? 'bg-black text-white border-black' :
                                    review.status === 'pending' ? 'bg-white text-black border-black' : 'bg-rose-500 text-white border-rose-500'
                                    }`}>
                                    {review.status}
                                </span>
                            </div>
                        </div>
                        <div className="flex md:flex-col justify-center gap-3 border-l border-gray-50 md:pl-8">
                            <button className="w-10 h-10 flex items-center justify-center text-black hover:bg-black hover:text-white rounded-xl transition-all shadow-sm border border-gray-50" title="Approve"><CheckCircle size={16} strokeWidth={3} /></button>
                            <button className="w-10 h-10 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-gray-50" title="Flag"><XCircle size={16} strokeWidth={3} /></button>
                            <button className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all shadow-sm border border-gray-50" title="Delete"><Trash2 size={16} strokeWidth={3} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewManager;
