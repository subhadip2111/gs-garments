import React, { useState } from 'react';
import { ShoppingCart, Eye, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import AdminModal from './AdminModal';

interface Order {
    id: string;
    customer_name: string;
    total: number;
    status: 'pending' | 'shipped' | 'delivered';
    date: string;
    items_count: number;
}

const OrderManager: React.FC = () => {
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const mockOrders: Order[] = [
        { id: 'ORD-7721', customer_name: 'Subhadip Das', total: 12500, status: 'pending', date: '2024-02-24', items_count: 3 },
        { id: 'ORD-8812', customer_name: 'Rahul Sen', total: 8900, status: 'shipped', date: '2024-02-23', items_count: 2 },
        { id: 'ORD-9901', customer_name: 'Priya Verma', total: 4500, status: 'delivered', date: '2024-02-21', items_count: 1 },
    ];

    const getStatusBadge = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return <span className="flex items-center gap-1.5 px-3 py-1 bg-white text-black border border-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm"><Clock size={10} strokeWidth={3} /> Pending Audit</span>;
            case 'shipped':
                return <span className="flex items-center gap-1.5 px-3 py-1 bg-black text-white border border-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm"><Truck size={10} strokeWidth={3} /> In Transit</span>;
            case 'delivered':
                return <span className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 text-zinc-500 border border-zinc-200 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm"><CheckCircle size={10} strokeWidth={3} /> Fulfilled</span>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter premium-gradient-text">Fulfillment Center</h1>
                    <p className="text-black text-sm font-medium">Monitor and manage your heritage collection logistics</p>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                    <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/60">Total Logistics Volume</span>
                        <span className="text-sm font-black text-black">{mockOrders.length}</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans">
                        <thead className="bg-gray-50/50 text-black text-[10px] uppercase font-black tracking-widest border-b border-gray-50">
                            <tr>
                                <th className="px-10 py-6">Transaction ID</th>
                                <th className="px-6 py-6">Consignee</th>
                                <th className="px-6 py-6 font-center text-center">Valuation</th>
                                <th className="px-6 py-6">Logistics Status</th>
                                <th className="px-10 py-6 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {mockOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-zinc-50 transition-all duration-300 group">
                                    <td className="px-10 py-6">
                                        <div className="font-black text-gray-900 text-sm tracking-widest font-mono group-hover:text-black transition-colors uppercase decoration-black/20 underline-offset-4 decoration-2">{order.id}</div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-black text-gray-800 tracking-tight">{order.customer_name}</div>
                                            <div className="text-[10px] text-black/60 font-bold uppercase tracking-widest">{order.date}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <div className="font-black text-gray-900 text-lg tracking-tighter italic font-serif">₹{order.total.toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-6 italic">{getStatusBadge(order.status)}</td>
                                    <td className="px-10 py-6 text-right">
                                        <button
                                            onClick={() => { setActiveOrder(order); setIsDetailOpen(true); }}
                                            className="w-32 flex items-center justify-center gap-2.5 px-5 py-2.5 bg-white border border-gray-100 text-black hover:bg-black hover:text-white rounded-xl shadow-sm transition-all active:scale-95 group/btn"
                                        >
                                            <Eye size={16} className="group-hover/btn:scale-110 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">view details</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AdminModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`Consignment Audit: ${activeOrder?.id}`}>
                {activeOrder && (
                    <div className="space-y-10">
                        <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-8 rounded-3xl border border-gray-100 shadow-inner">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-black/60 uppercase tracking-[0.3em] mb-2">Consignee Identity</p>
                                <p className="text-xl font-black text-gray-900 tracking-tighter italic font-serif">{activeOrder.customer_name}</p>
                                <p className="mt-2 text-[10px] text-white font-black uppercase tracking-[0.2em] bg-black border border-black inline-block px-3 py-1 rounded-full shadow-lg shadow-black/5">Verified Heritage Member</p>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Transaction Timestamp</p>
                                <p className="text-lg font-black text-gray-800 tracking-wider">{activeOrder.date}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between pb-2 border-b border-gray-50">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.35em] text-black/60 flex items-center gap-2">
                                    <Package size={14} /> Manifest Summary
                                </h4>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{activeOrder.items_count} Units</span>
                            </div>
                            <div className="bg-white/50 border border-gray-50 rounded-[1.5rem] overflow-hidden shadow-sm">
                                <div className="p-5 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-gray-900 tracking-tight">Handwoven Premium Silk Saree</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mt-1">Heritage Collection • Royal Red</span>
                                    </div>
                                    <span className="font-serif italic font-black text-lg">₹8,500</span>
                                </div>
                                <div className="p-5 flex items-center justify-between border-t border-gray-50 group hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-gray-900 tracking-tight">Artisan Cotton Kurti Exclusive</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mt-1">Daily Elegance • Emerald Gold</span>
                                    </div>
                                    <span className="font-serif italic font-black text-lg">₹4,000</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-100 flex justify-between items-end">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Workflow Logistics Authorization</p>
                                    <select className="bg-white border border-gray-100 rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-gray-900 focus:ring-4 focus:ring-black/5 focus:border-black outline-none shadow-inner transition-all appearance-none cursor-pointer pr-12 min-w-[200px]">
                                        <option value="pending">PENDING AUDIT</option>
                                        <option value="shipped">IN TRANSIT</option>
                                        <option value="delivered">FULFILLED</option>
                                    </select>
                                </div>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Invoice Valuation</p>
                                <p className="text-4xl font-black text-gray-900 tracking-tighter italic font-serif drop-shadow-sm">₹{activeOrder.total.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                )}
            </AdminModal>
        </div>
    );
};


export default OrderManager;
