import React from "react";
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
    User
} from "lucide-react";
import { useAppDispatch } from "../store";
import { logout } from "../store/authSlice";
import { auth, signOut } from "../services/firebase";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useState } from "react";

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

/* ── Dashboard home page (index route) ─────────────────────────────────── */
export const AdminHome: React.FC = () => (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 ease-out">
        <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-extrabold premium-gradient-text tracking-tight">Executive Overview</h1>
            <p className="text-black text-sm">Welcome back, administrator. Here's what's happening today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Sales" value="₹12,45,200" icon={<DollarSign size={18} className="text-black" />} trend="+12.5%" trendType="up" />
            <StatCard title="Net Orders" value="156" icon={<ShoppingCart size={18} className="text-black" />} trend="+8.2%" trendType="up" />
            <StatCard title="Inventory" value="1,204" icon={<Package size={18} className="text-black" />} trend="+4.1%" trendType="up" />
            <StatCard title="Revenue" value="₹8,92,000" icon={<TrendingUp size={18} className="text-black" />} trend="+15.3%" trendType="up" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm border border-gray-100 p-6 rounded-3xl shadow-sm h-72 flex flex-col">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-2">
                    <TrendingUp size={14} /> Sales Performance
                </h3>
                <div className="flex-grow flex items-center justify-center border-2 border-dashed border-gray-50 rounded-2xl text-black italic text-sm">
                    Chart placeholder
                </div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-2">
                    <ShoppingBag size={14} /> Top Categories
                </h3>
                <div className="space-y-3">
                    {["Sarees", "Blouses", "Ethnic Wear"].map((cat, i) => (
                        <div key={cat} className="flex justify-between items-center p-4 bg-gray-50/50 rounded-xl border border-gray-50/50 group hover:bg-black hover:text-white transition-all duration-300">
                            <span className="text-sm font-black tracking-tight">{cat}</span>
                            <span className="text-[10px] font-black bg-white group-hover:bg-zinc-800 group-hover:text-white px-3 py-1.5 rounded-lg border border-gray-100 transition-colors uppercase tracking-widest">
                                {85 - i * 15}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

/* ── StatCard ───────────────────────────────────────────────────────────── */
interface StatCardProps { title: string; value: string; icon: React.ReactNode; trend: string; trendType?: "up" | "down"; }

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendType = "up" }) => (
    <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50/50 rounded-bl-full -mr-12 -mt-12" />
        <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="p-3 bg-gray-50 rounded-xl shadow-sm border border-gray-100/50">{icon}</div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${trendType === "up" ? "text-black bg-white border-gray-100" : "text-rose-600 bg-rose-50 border-rose-100"}`}>
                <TrendingUp size={10} strokeWidth={3} className={trendType === "down" ? "rotate-180" : ""} />
                {trend}
            </div>
        </div>
        <div className="space-y-1 relative z-10">
            <h3 className="text-[10px] font-black text-black uppercase tracking-[0.3em]">{title}</h3>
            <p className="text-3xl font-black text-gray-900 tracking-tighter">{value}</p>
        </div>
        <div className="mt-5 pt-5 border-t border-gray-50/50 flex items-center justify-between relative z-10">
            <span className="text-[8px] font-black text-black uppercase tracking-widest">Last 30 days</span>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-1 h-2.5 rounded-full ${i <= 3 ? "bg-black" : "bg-gray-100"}`} />
                ))}
            </div>
        </div>
    </div>
);

export default AdminDashboard;
