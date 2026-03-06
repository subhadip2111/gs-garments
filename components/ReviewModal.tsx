import React, { useState, useRef } from 'react';
import { useToast } from './Toast';
import { submitProductReview } from '../api/auth/ProductApi';
import { Loader2, Star, X, Upload, Trash2 } from 'lucide-react';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
    onSuccess?: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, productId, productName, onSuccess }) => {
    const { showToast } = useToast();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleRatingHover = (val: number) => {
        // Optional: Hover effect for stars
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = Array.from(files);
            if (images.length + newFiles.length > 5) {
                showToast('You can only upload up to 5 images', 'error');
                return;
            }

            setImages(prev => [...prev, ...newFiles]);

            newFiles.forEach((file: any) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) {
            showToast('Please enter a comment', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('rating', rating.toString());
            formData.append('comment', comment);
            images.forEach(image => {
                formData.append('images', image);
            });

            await submitProductReview(productId, formData);
            showToast('Review submitted successfully!', 'success');
            if (onSuccess) onSuccess();
            onClose();
            // Reset state
            setRating(5);
            setComment('');
            setImages([]);
            setPreviews([]);
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to submit review', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
            <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-zinc-100">

                {/* Header */}
                <div className="p-8 border-b border-zinc-50 flex justify-between items-center bg-zinc-50/50">
                    <div>
                        <h3 className="text-2xl font-serif font-black tracking-tight text-zinc-900">Write a Review</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mt-1">{productName}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:shadow-md transition-all text-zinc-400 hover:text-black">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Rating */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 block">Select Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => setRating(val)}
                                    onMouseEnter={() => handleRatingHover(val)}
                                    className="transition-transform active:scale-90 group"
                                >
                                    <Star
                                        size={32}
                                        className={`transition-colors duration-300 ${val <= rating ? 'fill-black text-black' : 'text-zinc-200 group-hover:text-zinc-300'
                                            }`}
                                    />
                                </button>
                            ))}
                            <span className="ml-4 text-sm font-black italic font-serif self-center">
                                {rating === 5 ? 'Masterpiece' : rating === 4 ? 'Excellent' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                            </span>
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 block">Your Experience</label>
                        <textarea
                            required
                            rows={4}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your thoughts on the craftsmanship, fit, and elegance..."
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-5 text-sm outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all resize-none placeholder:text-zinc-300"
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 block">Add Photographs</label>
                            <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">{previews.length}/5 Images</span>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            {previews.map((src, idx) => (
                                <div key={idx} className="relative w-20 h-24 rounded-xl overflow-hidden group shadow-sm">
                                    <img src={src} className="w-full h-full object-cover" alt="Preview" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} className="text-white" />
                                    </button>
                                </div>
                            ))}

                            {previews.length < 5 && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-20 h-24 rounded-xl border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center gap-2 text-zinc-300 hover:border-black hover:text-black hover:bg-zinc-50 transition-all group"
                                >
                                    <Upload size={18} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Add</span>
                                </button>
                            )}
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            multiple
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    {/* Action */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-5 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-xl active:scale-95 disabled:bg-zinc-200 disabled:cursor-not-allowed group"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Publishing Review...</span>
                            </>
                        ) : (
                            <>
                                <span>Publish Review</span>
                                <Upload size={14} className="group-hover:-translate-y-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
