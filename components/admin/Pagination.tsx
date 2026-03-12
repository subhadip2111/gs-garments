import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="p-6 border-t border-gray-50 flex justify-between items-center bg-gray-50/30">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="px-4 py-2 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white/50 flex items-center gap-1"
                >
                    <ChevronLeft size={12} /> Previous
                </button>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="px-4 py-2 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white/50 flex items-center gap-1"
                >
                    Next <ChevronRight size={12} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
