import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';
import AdminModal from './AdminModal';

interface Brand {
    id: string;
    name: string;
    logo_url: string;
    featured: boolean;
}

const BrandManager: React.FC = () => {
    const [brands, setBrands] = useState<Brand[]>([
        { id: '1', name: 'Gucci', logo_url: 'https://logo.clearbit.com/gucci.com', featured: true },
        { id: '2', name: 'Zara', logo_url: 'https://logo.clearbit.com/zara.com', featured: true },
        { id: '3', name: 'Vogue', logo_url: 'https://logo.clearbit.com/vogue.com', featured: false },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter premium-gradient-text">Brand Ecosystem</h1>
                    <p className="text-black text-sm font-medium">Curate your partnership network and designer houses</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-premium btn-black">
                    <Plus size={18} strokeWidth={3} />
                    <span>Authorize Network</span>
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {brands.map((brand) => (
                    <div key={brand.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center group relative hover:shadow-md transition-all">
                        <div className="w-14 h-14 flex items-center justify-center mb-3">
                            <img src={brand.logo_url} alt={brand.name} className="max-w-full max-h-full grayscale group-hover:grayscale-0 transition-all" />
                        </div>
                        <h3 className="font-black text-gray-900 tracking-widest uppercase text-[9px]">{brand.name}</h3>
                        {brand.featured && <span className="absolute top-2 left-2 text-black"><Star size={10} fill="currentColor" strokeWidth={3} /></span>}

                        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="w-7 h-7 flex items-center justify-center text-black hover:bg-black hover:text-white rounded-md transition-all"><Edit2 size={11} /></button>
                            <button className="w-7 h-7 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-md transition-all"><Trash2 size={11} /></button>
                        </div>
                    </div>
                ))}
            </div>

            <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Manage Brand">
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                        <input type="text" placeholder="e.g. Prada" className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                        <input type="url" placeholder="https://logo.clearbit.com/prada.com" className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <input type="checkbox" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                        <label className="text-sm text-gray-600">Mark as Featured Brand</label>
                    </div>
                    <div className="flex gap-3 pt-6">
                        <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold">Save Brand</button>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
};

export default BrandManager;
