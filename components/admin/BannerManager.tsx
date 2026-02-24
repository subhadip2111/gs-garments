import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Image } from 'lucide-react';
import AdminModal from './AdminModal';

interface Banner {
    id: string;
    title: string;
    image_url: string;
    link?: string;
    status: 'active' | 'inactive';
}

const BannerManager: React.FC = () => {
    const [banners, setBanners] = useState<Banner[]>([
        { id: '1', title: 'Summer Sale 2024', image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8', status: 'active' },
        { id: '2', title: 'New Arrival: Silk Collection', image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b', status: 'active' },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter premium-gradient-text">Visual Campaigns</h1>
                    <p className="text-gray-500 text-sm font-medium">Control the digital narrative of your heritage collection</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-premium btn-black">
                    <Plus size={18} strokeWidth={3} />
                    <span>Initialize Propaganda</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {banners.map((banner) => (
                    <div key={banner.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group">
                        <div className="h-40 relative overflow-hidden">
                            <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-3 right-3 flex gap-2">
                                <span className={`px-2 py-1 ${banner.status === 'active' ? 'bg-black' : 'bg-gray-500'} text-white text-[9px] font-black uppercase tracking-widest rounded shadow-lg`}>
                                    {banner.status}
                                </span>
                            </div>
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-black text-gray-900 tracking-tight uppercase text-[11px]">{banner.title}</h3>
                                <p className="text-[9px] text-gray-400 font-bold tracking-widest truncate max-w-[150px] mt-0.5">{banner.image_url}</p>
                            </div>
                            <div className="flex gap-1.5">
                                <button className="w-9 h-9 flex items-center justify-center text-black hover:bg-black hover:text-white rounded-lg transition-all border border-gray-50 shadow-sm"><Edit2 size={12} /></button>
                                <button className="w-9 h-9 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-lg transition-all border border-gray-50 shadow-sm"><Trash2 size={12} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Manage Banner">
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Title</label>
                        <input type="text" placeholder="e.g. Summer Collection 2024" className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                        <input type="url" placeholder="https://unsplash.com/..." className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-100">Save Banner</button>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
};

export default BannerManager;
