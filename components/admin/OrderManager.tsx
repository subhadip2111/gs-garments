import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Package, Truck, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import AdminModal from './AdminModal';
import * as orderApi from '../../api/auth/orderApi';

type OrderStatus = 'Processing' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

interface ApiOrder {
    _id: string;
    id?: string;
    createdAt: string;
    total?: number;
    totalAmount?: number;
    status: OrderStatus;
    items: {
        product: { name: string; images?: string[]; price?: number } | string;
        quantity: number;
        selectedSize?: string;
        selectedColor?: string;
    }[];
    shippingAddress?: {
        fullName: string;
        city?: string;
        pincode?: string;
    };
    user?: {
        fullName?: string;
        email?: string;
    };
}

interface OrderStats {
    total?: number;
    processing?: number;
    shipped?: number;
    delivered?: number;
    cancelled?: number;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    Processing: {
        label: 'Processing',
        icon: <Clock size={10} strokeWidth={3} />,
        className: 'bg-white text-black border border-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm'
    },
    Packed: {
        label: 'Packed',
        icon: <Package size={10} strokeWidth={3} />,
        className: 'bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm'
    },
    Shipped: {
        label: 'In Transit',
        icon: <Truck size={10} strokeWidth={3} />,
        className: 'bg-black text-white border border-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm'
    },
    'Out for Delivery': {
        label: 'Out for Delivery',
        icon: <Truck size={10} strokeWidth={3} />,
        className: 'bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm'
    },
    Delivered: {
        label: 'Fulfilled',
        icon: <CheckCircle size={10} strokeWidth={3} />,
        className: 'bg-zinc-100 text-zinc-500 border border-zinc-200 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm'
    },
    Cancelled: {
        label: 'Cancelled',
        icon: <XCircle size={10} strokeWidth={3} />,
        className: 'bg-red-50 text-red-500 border border-red-200 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm'
    },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG['Processing'];
    return (
        <span className={`flex items-center gap-1.5 px-3 py-1 ${config.className}`}>
            {config.icon} {config.label}
        </span>
    );
};

const OrderManager: React.FC = () => {
    const [orders, setOrders] = useState<ApiOrder[]>([]);
    const [stats, setStats] = useState<OrderStats>({});
    const [activeOrder, setActiveOrder] = useState<ApiOrder | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [newStatus, setNewStatus] = useState<string>('');
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [ordersRes, statsRes] = await Promise.all([
                orderApi.getAllOrders(statusFilter ? { status: statusFilter } : undefined),
                orderApi.getOrderStats(),
            ]);
            const rawOrders = ordersRes?.orders || ordersRes?.data || ordersRes || [];
            setOrders(Array.isArray(rawOrders) ? rawOrders : []);
            setStats(statsRes?.stats || statsRes?.data || statsRes || {});
        } catch (err: any) {
            setError('Failed to load orders. Please check your connection or permissions.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusUpdate = async () => {
        if (!activeOrder || !newStatus) return;
        const orderId = activeOrder._id || activeOrder.id || '';
        setUpdatingId(orderId);
        try {
            await orderApi.updateOrderStatus(orderId, { status: newStatus });
            setOrders(prev => prev.map(o => (o._id === orderId || o.id === orderId) ? { ...o, status: newStatus as OrderStatus } : o));
            if (activeOrder) setActiveOrder({ ...activeOrder, status: newStatus as OrderStatus });
        } catch (err: any) {
            alert('Failed to update status: ' + (err?.response?.data?.message || err.message));
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter premium-gradient-text">Fulfillment Center</h1>
                    <p className="text-black text-sm font-medium">Monitor and manage your heritage collection logistics</p>
                </div>
                <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm">
                    <RefreshCw size={12} /> Refresh
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Orders', value: stats.total ?? orders.length, color: 'text-black' },
                    { label: 'Processing', value: stats.processing ?? orders.filter(o => o.status === 'Processing').length, color: 'text-blue-700' },
                    { label: 'Shipped', value: stats.shipped ?? orders.filter(o => o.status === 'Shipped').length, color: 'text-black' },
                    { label: 'Delivered', value: stats.delivered ?? orders.filter(o => o.status === 'Delivered').length, color: 'text-emerald-600' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white/70 backdrop-blur rounded-2xl border border-white shadow p-5">
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-1">{stat.label}</p>
                        <p className={`text-2xl font-black ${stat.color}`}>{stat.value ?? '—'}</p>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4">
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-gray-900 outline-none shadow-sm appearance-none cursor-pointer min-w-[160px]"
                >
                    <option value="">All Statuses</option>
                    {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                    <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/60">Total Logistics Volume</span>
                        <span className="text-sm font-black text-black">{orders.length}</span>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 animate-pulse">
                        Loading orders...
                    </div>
                ) : error ? (
                    <div className="py-20 text-center text-red-500 text-sm font-bold">{error}</div>
                ) : orders.length === 0 ? (
                    <div className="py-20 text-center text-zinc-400 text-[10px] font-black uppercase tracking-widest">No orders found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans">
                            <thead className="bg-gray-50/50 text-black text-[10px] uppercase font-black tracking-widest border-b border-gray-50">
                                <tr>
                                    <th className="px-10 py-6">Transaction ID</th>
                                    <th className="px-6 py-6">Consignee</th>
                                    <th className="px-6 py-6 text-center">Valuation</th>
                                    <th className="px-6 py-6">Status</th>
                                    <th className="px-10 py-6 text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orders.map((order) => {
                                    const orderId = order._id || order.id || '';
                                    const customerName = order.shippingAddress?.fullName || order.user?.fullName || order.user?.email || 'Anonymous';
                                    const total = order.total || order.totalAmount || 0;
                                    const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
                                    return (
                                        <tr key={orderId} className="hover:bg-zinc-50 transition-all duration-300 group">
                                            <td className="px-10 py-6">
                                                <div className="font-black text-gray-900 text-sm tracking-widest font-mono group-hover:text-black transition-colors uppercase">
                                                    {orderId.slice(-8).toUpperCase()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="space-y-0.5">
                                                    <div className="text-sm font-black text-gray-800 tracking-tight">{customerName}</div>
                                                    <div className="text-[10px] text-black/60 font-bold uppercase tracking-widest">{date}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <div className="font-black text-gray-900 text-lg tracking-tighter italic font-serif">₹{total.toLocaleString('en-IN')}</div>
                                            </td>
                                            <td className="px-6 py-6 italic"><StatusBadge status={order.status} /></td>
                                            <td className="px-10 py-6 text-right">
                                                <button
                                                    onClick={() => {
                                                        setActiveOrder(order);
                                                        setNewStatus(order.status);
                                                        setIsDetailOpen(true);
                                                    }}
                                                    className="w-32 flex items-center justify-center gap-2.5 px-5 py-2.5 bg-white border border-gray-100 text-black hover:bg-black hover:text-white rounded-xl shadow-sm transition-all active:scale-95 group/btn"
                                                >
                                                    <Eye size={16} className="group-hover/btn:scale-110 transition-transform" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">View</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            <AdminModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`Order: ${(activeOrder?._id || activeOrder?.id || '').slice(-8).toUpperCase()}`}>
                {activeOrder && (
                    <div className="space-y-8">
                        {/* Customer Info */}
                        <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-8 rounded-3xl border border-gray-100 shadow-inner">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-black/60 uppercase tracking-[0.3em] mb-2">Consignee</p>
                                <p className="text-xl font-black text-gray-900 tracking-tighter italic font-serif">
                                    {activeOrder.shippingAddress?.fullName || activeOrder.user?.fullName || 'N/A'}
                                </p>
                                {activeOrder.user?.email && (
                                    <p className="text-[10px] text-zinc-400 font-medium">{activeOrder.user.email}</p>
                                )}
                                {activeOrder.shippingAddress && (
                                    <p className="text-[10px] text-zinc-500 mt-2">
                                        {activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.pincode}
                                    </p>
                                )}
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Date</p>
                                <p className="text-lg font-black text-gray-800 tracking-wider">
                                    {activeOrder.createdAt ? new Date(activeOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                </p>
                                <StatusBadge status={activeOrder.status} />
                            </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                                <Package size={12} /> Order Items ({activeOrder.items.length})
                            </p>
                            <div className="bg-white/50 border border-gray-100 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-50">
                                {activeOrder.items.map((item, i) => {
                                    const product = typeof item.product === 'object' ? item.product : null;
                                    const name = product?.name || 'Product';
                                    const price = product?.price;
                                    return (
                                        <div key={i} className="p-5 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-black text-gray-900 tracking-tight">{name}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                                                    Qty: {item.quantity}{item.selectedSize ? ` • ${item.selectedSize}` : ''}{item.selectedColor ? ` • ${item.selectedColor}` : ''}
                                                </span>
                                            </div>
                                            {price && <span className="font-serif italic font-black text-lg">₹{price.toLocaleString('en-IN')}</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Status Update */}
                        <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                            <div className="space-y-2">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Update Status</p>
                                <div className="flex items-center gap-3">
                                    <select
                                        value={newStatus}
                                        onChange={e => setNewStatus(e.target.value)}
                                        className="bg-white border border-gray-100 rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-gray-900 focus:ring-4 focus:ring-black/5 focus:border-black outline-none shadow-inner transition-all appearance-none cursor-pointer pr-12 min-w-[200px]"
                                    >
                                        {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                    </select>
                                    <button
                                        onClick={handleStatusUpdate}
                                        disabled={!!updatingId}
                                        className="px-5 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-50"
                                    >
                                        {updatingId ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Total</p>
                                <p className="text-4xl font-black text-gray-900 tracking-tighter italic font-serif drop-shadow-sm">
                                    ₹{(activeOrder.total || activeOrder.totalAmount || 0).toLocaleString('en-IN')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </AdminModal>
        </div>
    );
};

export default OrderManager;
