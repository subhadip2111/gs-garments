import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, ArrowUpRight } from 'lucide-react';

const EarningsManager: React.FC = () => {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter premium-gradient-text">Financial Intelligence</h1>
                    <p className="text-black text-sm font-medium">Real-time fiscal monitoring of your heritage empire</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-black flex items-center gap-2.5 hover:bg-black hover:text-white transition-all shadow-sm active:scale-95">
                        <Calendar size={14} strokeWidth={3} /> Last 30 Cycles
                    </button>
                    <button className="btn-premium btn-black">
                        Generate Ledger
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-white shadow-xl shadow-slate-200/50 relative overflow-hidden group hover:scale-[1.01] transition-all duration-500">
                    <p className="text-[10px] font-black text-black/60 uppercase tracking-[0.3em] mb-3">Gross Liquidity</p>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic font-serif">₹8,45,200</h2>
                    <div className="mt-6 flex items-center gap-2 text-black text-[10px] font-black uppercase tracking-widest bg-gray-50 self-start px-3 py-1 rounded-full border border-gray-100 inline-flex shadow-sm">
                        <TrendingUp size={12} strokeWidth={3} /> +18.4% Alpha
                    </div>
                </div>
                <div className="bg-black p-8 rounded-3xl border border-black shadow-xl shadow-black/20 relative overflow-hidden group hover:scale-[1.01] transition-all duration-500">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-3">Net Sovereignty</p>
                    <h2 className="text-3xl font-black text-white tracking-tighter italic font-serif">₹6,12,000</h2>
                    <div className="mt-6 flex items-center gap-2 text-black text-[10px] font-black uppercase tracking-widest bg-white self-start px-3 py-1 rounded-full border border-white inline-flex shadow-lg">
                        <TrendingUp size={12} strokeWidth={3} /> +12.1% Momentum
                    </div>
                </div>
                <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-white shadow-xl shadow-slate-200/50 relative overflow-hidden group hover:scale-[1.01] transition-all duration-500">
                    <p className="text-[10px] font-black text-black/60 uppercase tracking-[0.3em] mb-3">Avg. Piece Valuation</p>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic font-serif">₹2,450</h2>
                    <div className="mt-6 flex items-center gap-2 text-rose-600 text-[10px] font-black uppercase tracking-widest bg-rose-50 self-start px-3 py-1 rounded-full border border-rose-100 inline-flex shadow-sm">
                        <TrendingDown size={12} strokeWidth={3} /> -2.4% Variance
                    </div>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden">
                <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black">Transaction Chronology</h3>
                    <button className="text-black text-[10px] font-black uppercase tracking-[0.3em] hover:underline decoration-2 underline-offset-8">Full Archive</button>
                </div>
                <div className="divide-y divide-gray-50">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-8 flex items-center justify-between hover:bg-zinc-50 transition-all duration-300 group">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-black shadow-sm group-hover:bg-black group-hover:text-white transition-all duration-500">
                                    <ArrowUpRight size={20} strokeWidth={3} />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-black text-gray-900 tracking-tight text-lg italic font-serif">Transaction #GS-TXN-00{i}</p>
                                    <p className="text-[10px] text-black/60 font-black uppercase tracking-[0.2em]">Feb 24, 2024 • 12:45 PM • <span className="text-black font-black underline decoration-black/20 underline-offset-4">Digital Payment</span></p>
                                </div>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-2xl font-black text-black tracking-tighter font-serif italic">+₹{(Math.random() * 5000 + 1000).toFixed(0)}</p>
                                <p className="text-[10px] text-zinc-400 uppercase font-black tracking-[0.3em] bg-zinc-50 px-3 py-1 rounded-full border border-zinc-100 inline-block">Authenticated</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EarningsManager;
