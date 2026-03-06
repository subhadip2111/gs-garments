import React, { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Folders,
    Image,
    Tag,
    ShoppingBag,
    Star,
    ShoppingCart,
    RotateCcw,
    BarChart,
    LogOut,
    ChevronRight,
    Menu,
    X,
    DollarSign,
    TrendingUp,
    Package,
    User,
    IndianRupee,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
} from "lucide-react";
import { useAppDispatch } from "../store";
import { logout } from "../store/authSlice";
import { auth, signOut } from "../services/firebase";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import * as dashboardApi from "../api/auth/dashboardApi";

/* ── Types ─────────────────────────────────────────────────────────────── */

interface DashboardStats {
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    totalRevenue: number;
    pendingOrders: number;
    cancelledOrders: number;
    averageOrderValue: number;
    period: string;
}

interface MonthlySalesItem {
    month: string;
    sales: number;
    revenue: number;
    orders: number;
}

interface TopCategory {
    category: { id: string; name: string };
    totalSold: number;
    totalRevenue: number;
    percentage: number;
}

interface DailySalesItem {
    date: string;
    sales: number;
    orders: number;
}

/* ── nav config ─────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
    { path: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, group: "general" },
    { path: "/admin/categories", label: "Categories", icon: <Folders size={20} />, group: "general" },
    { path: "/admin/subcategories", label: "Subcategories", icon: <Tag size={20} />, group: "general" },
    { path: "/admin/products", label: "Products", icon: <ShoppingBag size={20} />, group: "general" },
    { path: "/admin/banners", label: "Banners", icon: <Image size={20} />, group: "operations" },
    { path: "/admin/brands", label: "Brands", icon: <Star size={20} />, group: "operations" },
    { path: "/admin/orders", label: "Orders", icon: <ShoppingCart size={20} />, group: "operations" },
    { path: "/admin/reviews", label: "Reviews", icon: <Star size={20} />, group: "operations" },
    { path: "/admin/returns", label: "Returns", icon: <RotateCcw size={20} />, group: "operations" },
    { path: "/admin/earnings", label: "Earnings", icon: <BarChart size={20} />, group: "operations" },
    { path: "/admin/profile", label: "Profile", icon: <User size={20} />, group: "operations" },
];

/* ── layout shell ───────────────────────────────────────────────────────── */
const AdminDashboard: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await signOut(auth!);
        dispatch(logout());
        navigate("/admin/login");
    };

    const isActive = (path: string) => location.pathname === path;

    const currentLabel = NAV_ITEMS.find(n => isActive(n.path))?.label ?? "Dashboard";

    const NavButton: React.FC<{ item: typeof NAV_ITEMS[0] }> = ({ item }) => (
        <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center ${isSidebarOpen ? "gap-4 px-5" : "justify-center"} py-3 rounded-xl transition-all duration-300 group ${isActive(item.path)
                ? "admin-nav-item-active"
                : "text-black hover:bg-white/5 hover:text-black"
                }`}
        >
            <span className={`shrink-0 transition-all duration-300 group-hover:scale-110 ${isActive(item.path) ? "text-black" : "text-gray-600 group-hover:text-white"}`}>
                {React.cloneElement(item.icon as React.ReactElement, {
                    size: isActive(item.path) ? 20 : 18,
                    strokeWidth: isActive(item.path) ? 3 : 2,
                })}
            </span>
            {isSidebarOpen && (
                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive(item.path) ? "text-black" : "text-gray-400 group-hover:text-white"}`}>
                    {item.label}
                </span>
            )}
            {isSidebarOpen && isActive(item.path) && (
                <ChevronRight size={12} className="ml-auto text-black/20" />
            )}
        </button>
    );

    const general = NAV_ITEMS.filter(n => n.group === "general");
    const operations = NAV_ITEMS.filter(n => n.group === "operations");

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
            {/* ── Sidebar ── */}
            <aside className={`${isSidebarOpen ? "w-72" : "w-24"} glass-sidebar transition-all duration-500 ease-in-out flex flex-col fixed h-full z-50`}>
                {/* Logo */}
                <div className="p-6 pb-8 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-2xl shadow-black/40 ring-1 ring-white/20">
                        <span className="text-black font-black text-lg tracking-tighter">GS</span>
                    </div>
                    {isSidebarOpen && (
                        <div className="flex flex-col">
                            <span className="text-white font-black text-xl tracking-tighter leading-none italic font-serif">Heritage</span>
                            <span className="text-black text-[8px] uppercase font-black tracking-[0.4em] mt-1.5">Management Alpha</span>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-grow px-4 space-y-2 no-scrollbar overflow-y-auto pb-10">
                    <div className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-900 ${!isSidebarOpen && "text-center"}`}>
                        {isSidebarOpen ? "General" : "•••"}
                    </div>
                    {general.map(item => <NavButton key={item.path} item={item} />)}

                    <div className={`mt-8 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-900 ${!isSidebarOpen && "text-center"}`}>
                        {isSidebarOpen ? "Operations" : "•••"}
                    </div>
                    {operations.map(item => <NavButton key={item.path} item={item} />)}
                </nav>

                {/* Logout */}
                <div className="p-4 backdrop-blur-md">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center ${isSidebarOpen ? "gap-4 px-5" : "justify-center"} py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 group`}
                    >
                        <LogOut size={18} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
                        {isSidebarOpen && <span className="font-bold text-sm tracking-wide">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <div className={`flex-grow flex flex-col transition-all duration-500 ease-in-out ${isSidebarOpen ? "ml-72" : "ml-24"} min-h-screen`}>
                {/* Header */}
                <header className="h-16 glass-header px-8 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-300 text-black active:scale-95"
                        >
                            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>

                        {/* Breadcrumb */}
                        <div className="hidden md:flex items-center gap-1 px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-bold text-black">
                            <span className="text-zinc-400">Admin</span>
                            <ChevronRight size={10} className="text-zinc-400" />
                            <span className="capitalize text-slate-800">{currentLabel}</span>
                        </div>

                        {/* Current URL pill */}
                        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-black/5 border border-black/5 rounded-full text-[9px] font-mono font-black text-black/40">
                            {location.pathname}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-black font-black shadow-sm hover:bg-black hover:text-white transition-all cursor-pointer">
                            AD
                        </div>
                    </div>
                </header>

                {/* Page content — rendered by child route */}
                <main className="p-8 max-w-[1600px] mx-auto w-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

/* ── Helper: format currency ──────────────────────────────────────────── */
const formatCurrency = (val: number): string => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toLocaleString('en-IN')}`;
};

/* ── Dashboard home page (index route) ─────────────────────────────────── */
export const AdminHome: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [monthlySales, setMonthlySales] = useState<MonthlySalesItem[]>([]);
    const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
    const [dailySales, setDailySales] = useState<DailySalesItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [hoveredBar, setHoveredBar] = useState<number | null>(null);

    useEffect(() => {
        let active = true;
        const fetchAll = async () => {
            setLoading(true);
            setError('');
            try {
                const [statsRes, monthlyRes, categoriesRes, performanceRes] = await Promise.allSettled([
                    dashboardApi.getAdminStats(),
                    dashboardApi.getMonthlySales(selectedYear),
                    dashboardApi.getTopCategories(),
                    dashboardApi.getSalesPerformance(),
                ]);

                if (!active) return;

                if (statsRes.status === 'fulfilled') {
                    setStats(statsRes.value?.data || statsRes.value);
                }
                if (monthlyRes.status === 'fulfilled') {
                    const data = monthlyRes.value?.data || monthlyRes.value;
                    setMonthlySales(data?.monthlySales || data || []);
                }
                if (categoriesRes.status === 'fulfilled') {
                    const data = categoriesRes.value?.data || categoriesRes.value;
                    setTopCategories(data?.topCategories || data || []);
                }
                if (performanceRes.status === 'fulfilled') {
                    const data = performanceRes.value?.data || performanceRes.value;
                    setDailySales(data?.dailySales || data || []);
                }
            } catch (err: any) {
                if (active) setError('Failed to load dashboard data');
            } finally {
                if (active) setLoading(false);
            }
        };
        fetchAll();
        return () => { active = false; };
    }, [selectedYear]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-40">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={32} className="animate-spin text-black" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Monthly chart calculations
    const maxMonthlySales = Math.max(...monthlySales.map(m => m.sales), 1);
    const maxMonthlyRevenue = Math.max(...monthlySales.map(m => m.revenue), 1);

    // Daily performance chart calculations
    const maxDailySales = Math.max(...dailySales.map(d => d.sales), 1);

    // Category colors
    const categoryColors = ['bg-black', 'bg-zinc-700', 'bg-zinc-500', 'bg-zinc-400', 'bg-zinc-300'];

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 ease-out">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-extrabold premium-gradient-text tracking-tight">Executive Overview</h1>
                <p className="text-black text-sm">Welcome back, administrator. Here's what's happening today.</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-600 font-bold">{error}</div>
            )}

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Sales"
                    value={formatCurrency(stats?.totalSales || 0)}
                    icon={<DollarSign size={18} className="text-black" />}
                    subtitle={`${stats?.totalOrders || 0} orders`}
                />
                <StatCard
                    title="Net Revenue"
                    value={formatCurrency(stats?.totalRevenue || 0)}
                    icon={<IndianRupee size={18} className="text-black" />}
                    subtitle={`After discounts & refunds`}
                />
                <StatCard
                    title="Avg. Order Value"
                    value={formatCurrency(stats?.averageOrderValue || 0)}
                    icon={<ShoppingCart size={18} className="text-black" />}
                    subtitle={`${stats?.pendingOrders || 0} pending`}
                />
                <StatCard
                    title="Cancelled"
                    value={`${stats?.cancelledOrders || 0}`}
                    icon={<Package size={18} className="text-black" />}
                    subtitle={`Out of ${stats?.totalOrders || 0} total`}
                    isNegative
                />
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Monthly Sales Bar Chart */}
                <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                            <TrendingUp size={14} /> Sales Performance
                        </h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSelectedYear(y => y - 1)}
                                className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-zinc-400 hover:bg-black hover:text-white transition-all text-xs"
                            >
                                ‹
                            </button>
                            <span className="text-[11px] font-black text-zinc-600 min-w-[40px] text-center">{selectedYear}</span>
                            <button
                                onClick={() => setSelectedYear(y => y + 1)}
                                className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-zinc-400 hover:bg-black hover:text-white transition-all text-xs"
                            >
                                ›
                            </button>
                        </div>
                    </div>

                    {monthlySales.length > 0 ? (
                        <div className="flex-grow flex items-end gap-1.5 min-h-[200px] relative">
                            {monthlySales.map((m, i) => {
                                const salesHeight = Math.max((m.sales / maxMonthlySales) * 100, 2);
                                const revenueHeight = Math.max((m.revenue / maxMonthlySales) * 100, 1);
                                const isHovered = hoveredBar === i;
                                return (
                                    <div
                                        key={m.month}
                                        className="flex-1 flex flex-col items-center gap-1 group relative cursor-pointer"
                                        onMouseEnter={() => setHoveredBar(i)}
                                        onMouseLeave={() => setHoveredBar(null)}
                                    >
                                        {/* Tooltip */}
                                        {isHovered && m.sales > 0 && (
                                            <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-3 py-2 rounded-xl shadow-xl z-10 whitespace-nowrap">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{m.month}</p>
                                                <p className="text-xs font-black">Sales: {formatCurrency(m.sales)}</p>
                                                <p className="text-[10px] text-emerald-400 font-bold">Revenue: {formatCurrency(m.revenue)}</p>
                                                <p className="text-[10px] text-zinc-400">{m.orders} orders</p>
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45"></div>
                                            </div>
                                        )}
                                        <div className="w-full flex items-end gap-0.5 h-[180px]">
                                            {/* Sales bar */}
                                            <div
                                                className={`flex-1 rounded-t-md transition-all duration-500 ease-out ${isHovered ? 'bg-black' : 'bg-zinc-200'}`}
                                                style={{ height: `${salesHeight}%` }}
                                            />
                                            {/* Revenue bar */}
                                            <div
                                                className={`flex-1 rounded-t-md transition-all duration-500 ease-out ${isHovered ? 'bg-emerald-500' : 'bg-emerald-100'}`}
                                                style={{ height: `${revenueHeight}%` }}
                                            />
                                        </div>
                                        <span className={`text-[8px] font-black uppercase tracking-wider ${isHovered ? 'text-black' : 'text-zinc-400'}`}>{m.month?.slice(0, 3)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex-grow flex items-center justify-center border-2 border-dashed border-gray-50 rounded-2xl text-black italic text-sm">
                            No sales data for {selectedYear}
                        </div>
                    )}

                    {/* Legend */}
                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-zinc-200 rounded" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Sales</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-emerald-100 rounded" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Revenue</span>
                        </div>
                    </div>
                </div>

                {/* Top Categories */}
                <div className="bg-white/90 backdrop-blur-sm border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-2">
                        <ShoppingBag size={14} /> Top Categories
                    </h3>
                    {topCategories.length > 0 ? (
                        <div className="space-y-3 flex-grow">
                            {topCategories.map((cat, i) => (
                                <div key={cat.category?.id || i} className="p-4 bg-gray-50/50 rounded-xl border border-gray-50/50 group hover:bg-black hover:text-white transition-all duration-300">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-black tracking-tight">{cat.category?.name || 'Unknown'}</span>
                                        <span className="text-[10px] font-black bg-white group-hover:bg-zinc-800 group-hover:text-white px-3 py-1.5 rounded-lg border border-gray-100 transition-colors uppercase tracking-widest">
                                            {cat.percentage || 0}%
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-grow h-1.5 bg-gray-100 group-hover:bg-zinc-700 rounded-full overflow-hidden transition-colors">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ease-out ${categoryColors[i] || 'bg-zinc-300'} group-hover:bg-white`}
                                                style={{ width: `${cat.percentage || 0}%` }}
                                            />
                                        </div>
                                        <span className="text-[9px] font-black text-zinc-400 group-hover:text-zinc-300 whitespace-nowrap">
                                            {formatCurrency(cat.totalRevenue || 0)}
                                        </span>
                                    </div>
                                    <p className="text-[9px] text-zinc-400 group-hover:text-zinc-400 mt-1.5 font-bold">
                                        {cat.totalSold || 0} items sold
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-grow flex items-center justify-center border-2 border-dashed border-gray-50 rounded-2xl text-zinc-400 italic text-sm p-8">
                            No category data yet
                        </div>
                    )}
                </div>
            </div>

            {/* ── Daily Sales Performance (30 days) ── */}
            <div className="bg-white/90 backdrop-blur-sm border border-gray-100 p-6 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                        <BarChart size={14} /> Daily Sales — Last 30 Days
                    </h3>
                    {dailySales.length > 0 && (
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            Total: {formatCurrency(dailySales.reduce((a, d) => a + d.sales, 0))}
                        </div>
                    )}
                </div>

                {dailySales.length > 0 ? (
                    <div className="flex items-end gap-[3px] h-[120px]">
                        {dailySales.map((d, i) => {
                            const height = Math.max((d.sales / maxDailySales) * 100, 3);
                            const date = new Date(d.date);
                            const dayLabel = date.getDate();
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                            return (
                                <div
                                    key={d.date}
                                    className="flex-1 flex flex-col items-center gap-1 group relative"
                                    title={`${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — ${formatCurrency(d.sales)} (${d.orders} orders)`}
                                >
                                    <div
                                        className={`w-full rounded-t-sm transition-all duration-300 cursor-pointer ${d.sales === 0 ? 'bg-gray-100' : isWeekend ? 'bg-zinc-300 hover:bg-zinc-800' : 'bg-black/70 hover:bg-black'
                                            }`}
                                        style={{ height: `${height}%` }}
                                    />
                                    {(i === 0 || i === dailySales.length - 1 || i % 7 === 0) && (
                                        <span className="text-[7px] font-bold text-zinc-300">{dayLabel}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-[120px] flex items-center justify-center border-2 border-dashed border-gray-50 rounded-2xl text-zinc-400 italic text-sm">
                        No daily performance data yet
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── StatCard ───────────────────────────────────────────────────────────── */
interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    subtitle?: string;
    isNegative?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, subtitle, isNegative = false }) => (
    <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50/50 rounded-bl-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
        <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="p-3 bg-gray-50 rounded-xl shadow-sm border border-gray-100/50">{icon}</div>
        </div>
        <div className="space-y-1 relative z-10">
            <h3 className="text-[10px] font-black text-black uppercase tracking-[0.3em]">{title}</h3>
            <p className={`text-3xl font-black tracking-tighter ${isNegative ? 'text-red-500' : 'text-gray-900'}`}>{value}</p>
        </div>
        {subtitle && (
            <div className="mt-5 pt-5 border-t border-gray-50/50 relative z-10">
                <span className="text-[8px] font-black text-black uppercase tracking-widest">{subtitle}</span>
            </div>
        )}
    </div>
);

export default AdminDashboard;
