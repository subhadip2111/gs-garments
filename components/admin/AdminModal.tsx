import React from 'react';
import { X } from 'lucide-react';

interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-500"
                onClick={onClose}
            />
            <div className="relative bg-white/95 backdrop-blur-3xl w-full max-w-2xl rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] border border-white/20 animate-in zoom-in-95 slide-in-from-bottom-12 duration-700 ease-out overflow-hidden flex flex-col max-h-[90vh]">
                <header className="px-12 py-10 flex items-center justify-between">
                    <h3 className="text-3xl font-black text-black tracking-tighter italic font-serif">{title}</h3>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-black hover:text-white rounded-2xl transition-all duration-300 text-gray-400 active:scale-90"
                    >
                        <X size={20} strokeWidth={3} />
                    </button>
                </header>
                <div className="px-10 pb-10 overflow-y-auto no-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};


export default AdminModal;
