import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserCheck, Crown, Search, Eye, ShoppingBag, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import AdminModal from './AdminModal';
import { getCategoriesUser, getUserAnalytics, getUserOrders } from '@/api/auth/usersApi';
import Pagination from './Pagination';

interface DummyOrder {
    id: string;
    date: string;
    total: number;
    status: 'Delivered' | 'Processing' | 'Cancelled';
    itemsCount: number;
}

interface User {
    _id: string;
    fullName: string;
    email: string;
    mobile: string;
    dateJoined: string;
    totalOrders: number;
    totalSpent: number;
    isNewUser: boolean;
    isPrime: boolean;
    location: string;
    recentOrders: DummyOrder[];
}


const UserManagement: React.FC = () => {
    // const [users] = useState<User[]>(DUMMY_USERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterParams, setFilterParams] = useState('all'); // all, new, old, prime
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userAnalitics, setUserAnalitics] = useState({})
    const [users, setUsers] = useState([])
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(5)
      const [UserOrderPage, setUserOrderPage] = useState(1)
    const [UserOrderLimit, setUserOrderLimit] = useState(5)
    const [totalPages, setTotalPages] = useState(0)
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [userOrdersData,setUserOrdersData]=useState([])
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500); // debounce time

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Use debouncedSearch for API call or filtering
    useEffect(() => {
        if (debouncedSearch) {
        }
    }, [debouncedSearch]);
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterParams(e.target.value);
    };
    const fetchUSerAnalitics = async () => {
        const data = await getUserAnalytics()
        setUserAnalitics(data)
    }
    useEffect(() => {
        fetchUSerAnalitics()
    }, [])
    const fecthCategoriesUser = async () => {
        const userList = await getCategoriesUser(filterParams, debouncedSearch, page, limit)
        console.log(userList)

        setUsers(userList?.results)
        setTotalPages(userList?.totalPages || 0)
    }

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, filterParams]);

    useEffect(() => {
        fecthCategoriesUser()
    }, [debouncedSearch, filterParams, page])
const fetchUserOrders=async()=>{
    const data=await getUserOrders(selectedUser?.id,UserOrderPage,UserOrderLimit)
    setUserOrdersData(data)
    console.log(data)
}
useEffect(()=>{
    fetchUserOrders()
},[selectedUser])
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter premium-gradient-text">Customer Directory</h1>
                    <p className="text-black text-sm font-medium">Manage and understand your customer base</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Customers"
                    value={userAnalitics?.totalUserCount}
                    icon={<Users size={24} className="text-black mb-3 z-10" />}
                    bgColors="bg-gray-50 bg-white"
                    textColor="text-black"
                />
                <StatCard
                    title="New Customers"
                    value={userAnalitics?.newUserCount}
                    icon={<UserPlus size={24} className="text-blue-500 mb-3 z-10" />}
                    bgColors="bg-blue-50 bg-white"
                    textColor="text-blue-600"
                    subtitle="0 Orders Placed"
                />
                <StatCard
                    title="Returning Customers"
                    value={userAnalitics?.oldUserCount}
                    icon={<UserCheck size={24} className="text-emerald-500 mb-3 z-10" />}
                    bgColors="bg-emerald-50 bg-white"
                    textColor="text-emerald-600"
                    subtitle="1+ Orders Placed"
                />
                <StatCard
                    title="Prime Members"
                    value={userAnalitics?.primeUserCount}
                    icon={<Crown size={24} className="text-amber-500 mb-3 z-10" />}
                    bgColors="bg-amber-50 bg-white"
                    textColor="text-amber-600"
                    subtitle="Spent ₹10,000+ (6 Mo)"
                />
            </div>

            {/* Main Area */}
{/* 

bg-white/20 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden h-[600px] flex flex-col*/}

            <div className="bg-white/20 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden h-[600px] flex flex-col">
                <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center bg-gray-50/30 gap-4">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-[11px] font-black uppercase tracking-widest text-gray-900 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all shadow-sm"
                        />
                    </div>
                    <select
                        value={filterParams}
                        onChange={handleFilterChange}
                        className="w-full sm:w-auto px-5 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] text-gray-900 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black outline-none shadow-sm appearance-none cursor-pointer pr-10"
                    >
                        <option value="all">All Customers</option>
                        <option value="new">New Customers</option>
                        <option value="old">Returning Customers</option>
                        <option value="premium">Premium Customers</option>
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <div className="overflow-x-auto min-w-full">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-black text-[10px] uppercase font-black tracking-widest border-b border-gray-50">
                            <tr>
                                <th className="px-8 py-5">Customer</th>
                                <th className="px-6 py-5">Contact</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5">Orders</th>
                                <th className="px-6 py-5">Total Spent</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users?.map(user => (
                                <tr key={user.id} className="hover:bg-zinc-50/80 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-white shadow-sm flex items-center justify-center text-gray-600 font-black tracking-tighter">
                                                {user?.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-gray-900 tracking-tight">{user.fullName}</div>
                                                <div className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">Joined: {user.dateJoined}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 space-y-1">
                                        <div className="text-[10px] font-bold text-gray-600 flex items-center gap-1.5">
                                            <Mail size={10} className="text-gray-400" /> {user.email}
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-600 flex items-center gap-1.5">
                                            <Phone size={10} className="text-gray-400" /> +91 {user.mobile}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 space-y-1">
                                        {/* {user.isPrime && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-md text-[8px] font-black uppercase tracking-widest mr-1">
                                                <Crown size={8} /> Prime
                                            </span>
                                        )} */}
                                        {user.newUser ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-[8px] font-black uppercase tracking-widest">
                                                New
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-md text-[8px] font-black uppercase tracking-widest">
                                                Old
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <ShoppingBag size={14} className="text-zinc-400" />
                                            <span className="text-sm font-bold text-gray-600">{user.totalOrders}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="font-serif italic font-black text-lg text-gray-900">
                                            ₹{user?.totalSpent?.toLocaleString('en-IN')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button
                                            onClick={() => setSelectedUser(user)}
                                            className="px-4 py-2 bg-white border border-gray-100 text-black hover:bg-black hover:text-white rounded-xl shadow-sm transition-all active:scale-95 group/btn flex items-center gap-2 ml-auto"
                                        >
                                            <Eye size={14} className="group-hover/btn:scale-110 transition-transform" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">View</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-16 text-center text-zinc-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <Users size={32} className="opacity-20" />
                                            <p className="text-[10px] uppercase font-black tracking-widest">No customers found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>
                <Pagination 
                    currentPage={page} 
                    totalPages={totalPages} 
                    onPageChange={(newPage) => setPage(newPage)} 
                />
            </div>

            {/* Character Details Modal */}
            <AdminModal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="Customer Profile">
                {selectedUser && (
                    <div className="space-y-8">
                        {/* Header Details */}
                        <div className="flex items-start gap-6 bg-gray-50/50 p-6 rounded-3xl border border-gray-100 shadow-inner">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white shadow-md flex justify-center items-center text-3xl text-gray-400 font-black flex-shrink-0">
                                {selectedUser.fullName.charAt(0)}
                            </div>
                            <div className="flex-grow space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{selectedUser.fullName}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            {selectedUser.isPrime && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                    <Crown size={10} /> Prime Member
                                                </span>
                                            )}
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${selectedUser.isNewUser ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                                {selectedUser.isNewUser ? 'New Customer' : 'Returning Customer'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Lifetime Value</p>
                                        <p className="text-3xl font-black text-gray-900 tracking-tighter italic font-serif">
                                            ₹{selectedUser.totalSpent.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100/50">
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold text-gray-500 flex items-center gap-2"><Mail size={12} /> {selectedUser.email}</p>
                                        <p className="text-[10px] font-bold text-gray-500 flex items-center gap-2"><Phone size={12} /> +91 {selectedUser.mobile}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold text-gray-500 flex items-center gap-2"><MapPin size={12} /> {selectedUser.location}</p>
                                        <p className="text-[10px] font-bold text-gray-500 flex items-center gap-2"><Calendar size={12} /> Joined: {selectedUser.dateJoined}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order History */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                                <ShoppingBag size={12} /> Recent Orders ({userOrdersData?.length})
                            </p>

                            {userOrdersData?.length > 0 ? (
                                <div className="bg-white/50 border border-gray-100 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-50">
                                    {userOrdersData?.map(order => (
                                        <div key={order.id} className="p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                                            <div>
                                                <div className="font-black text-gray-900 text-sm tracking-widest font-mono uppercase mb-0.5">{order.id}</div>
                                                <div className="text-[10px] text-zinc-400 font-bold flex items-center gap-2">
                                                    <span>{order.createdAt}</span>
                                                    <span>•</span>
                                                    <span>{order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}</span>
                                                </div>

                                                <div className="text-[10px] text-zinc-400 font-bold flex items-center gap-2">
                                                    <span>{order.paymentMethod}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${order.status === 'Delivered' ? 'bg-zinc-100 text-zinc-600 border-zinc-200' :
                                                    order.status === 'Processing' ? 'bg-black text-white border-black' :
                                                        'bg-red-50 text-red-500 border-red-200'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                                <span className="font-serif italic font-black text-lg text-gray-900 w-24 text-right">
                                                    ₹{order?.totalAmount.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-50/50 border border-gray-100 border-dashed rounded-2xl p-8 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No recent orders yet</p>
                                    <p className="text-xs text-gray-500 mt-2 font-medium">This customer hasn't purchased anything.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </AdminModal>
        </div>
    );
};

// Helper for Stat Cards
const StatCard = ({ title, value, icon, bgColors, textColor, subtitle }: any) => (
    <div className={`backdrop-blur rounded-3xl border border-white shadow-sm p-6 flex flex-col items-center justify-center relative overflow-hidden group ${bgColors.split(' ')[1]}`}>
        <div className={`absolute -right-4 -top-4 w-24 h-24 ${bgColors.split(' ')[0]} rounded-full group-hover:scale-150 transition-transform duration-500 z-0`}></div>
        {icon}
        <span className={`text-4xl font-black ${textColor} z-10`}>{value}</span>
        <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mt-1 z-10">{title}</span>
        {subtitle && <span className="text-[9px] font-bold text-zinc-400 mt-2 z-10 border-t border-gray-100 pt-2 w-full text-center">{subtitle}</span>}
    </div>
);

export default UserManagement;