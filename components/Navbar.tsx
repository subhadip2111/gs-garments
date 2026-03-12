
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';
import { LAUNCH_PROMOS } from '../constants';
import { useCategoryData } from '../hooks/useCategoryData';

const Navbar: React.FC = () => {
  const cart = useAppSelector((state) => state.cart.cart);
  const wishlist = useAppSelector((state) => state.wishlist.items);
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Order Received', message: 'Order #1234 has been placed successfully.', time: '5m ago', read: false },
    { id: 2, title: 'Flash Sale Alert', message: '50% off on all winter wear! Grab yours now.', time: '1h ago', read: false },
    { id: 3, title: 'Item Restocked', message: 'The item "Vintage Leather Jacket" in your wishlist is now back in stock.', time: '2h ago', read: true },
    { id: 4, title: 'Welcome to GS Archive', message: 'Thank you for signing up! Enjoy a 10% discount on your first order.', time: '1d ago', read: true },
    { id: 5, title: 'Shipping Update', message: 'Your order #1230 is out for delivery.', time: '2d ago', read: true },
    { id: 6, title: 'New Collection Live', message: 'Check out our exclusive Fall/Winter collection, now available.', time: '3d ago', read: true },
    { id: 7, title: 'Review Reminder', message: 'How do you like your recent purchase? Leave a review and earn points!', time: '1w ago', read: true },
  ]);

    const ITEMS_PER_PAGE = 3;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);
    const paginatedNotifications = notifications.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );

  const handleMarkAsRead = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };


  const { categories, getSubcategoriesForCategory } = useCategoryData();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleProtectedNavigation = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth', { state: { from: { pathname: path } } });
    } else {
      navigate(path);
    }
  };

  const getCatId = (cat: any) => cat._id || cat.id;
  const notificationCount = notifications.filter(n => !n.read).length;
  return (
    <header className="fixed top-0 w-full z-50 shadow-sm font-sans bg-white">
      {/* Promo Bar */}
      <div className="w-full bg-zinc-950 text-white py-2 overflow-hidden whitespace-nowrap relative border-b border-white/5">
        <div className="animate-infinite-scroll inline-block">
          {LAUNCH_PROMOS?.map((promo, idx) => (
            <span key={idx} className="mx-12 text-[9px] font-black uppercase tracking-[0.4em]">
              {promo.discount}: Use Code <span className="text-emerald-400">{promo.code}</span> — {promo.description}
            </span>
          ))}
          {LAUNCH_PROMOS?.map((promo, idx) => (
            <span key={`dup-${idx}`} className="mx-12 text-[9px] font-black uppercase tracking-[0.4em]">
              {promo.discount}: Use Code <span className="text-emerald-400">{promo.code}</span> — {promo.description}
            </span>
          ))}
        </div>
      </div>

      <nav className="relative w-full border-b border-zinc-100 px-4 md:px-8 lg:px-12 h-20 flex items-center justify-between">
        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden w-10 h-10 flex items-center justify-center text-zinc-900"
        >
          <i className="fa-solid fa-bars-staggered text-xl"></i>
        </button>

        {/* Logo */}
        <Link to="/" className="text-3xl md:text-4xl font-serif font-bold tracking-tighter text-black">GS</Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center h-full ml-8">
          {categories.map((cat) => {
            const catId = getCatId(cat);
            const subs = getSubcategoriesForCategory(catId);
            return (
              <div
                key={catId}
                className="h-full group flex items-center"
                onMouseEnter={() => setHoveredCategory(cat.name)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link
                  to={`/shop?category=${catId}`}
                  className="px-6 h-full flex items-center text-[12px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-black transition-colors"
                >
                  {cat?.name || 'Category'}
                </Link>

                {/* Megamenu — show subcategories */}
                {subs.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white shadow-2xl transition-all duration-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible border-t border-zinc-100 z-[60] py-12">
                    <div className="max-w-[1400px] mx-auto px-12 flex flex-wrap gap-12">
                      {subs.map((sub) => {
                        const subId = sub._id || sub.id;
                        return (
                          <div key={subId} className="space-y-3">
                            <Link
                              to={`/shop?category=${catId}&subcategory=${subId}`}
                              className="text-sm font-semibold text-zinc-800 hover:text-black transition-colors"
                            >
                              {sub?.name || 'Subcategory'}
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-4 md:gap-8">
          <button onClick={() => setSearchOpen(true)} className="w-10 h-10 flex items-center justify-center text-zinc-900 hover:scale-110 transition-transform">
            <i className="fa-solid fa-magnifying-glass text-lg"></i>
          </button>

          <Link to="/wishlist" onClick={(e) => handleProtectedNavigation(e, '/wishlist')} className="w-10 h-10 flex items-center justify-center text-zinc-900 hover:scale-110 transition-transform relative">
            <i className={`${wishlistCount > 0 ? 'fa-solid text-zinc-950' : 'fa-regular text-zinc-900'} fa-heart text-xl`}></i>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-zinc-900 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link to="/cart" className="w-10 h-10 flex items-center justify-center text-zinc-900 hover:scale-110 transition-transform relative">
            <i className="fa-solid fa-bag-shopping text-xl"></i>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-zinc-900 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                {cartCount}
              </span>
            )}
          </Link>

          <Link to="/profile" onClick={(e) => handleProtectedNavigation(e, '/profile')} className="hidden sm:flex w-10 h-10 items-center justify-center text-zinc-900 hover:scale-110 transition-transform">
            <i className="fa-regular fa-user text-xl"></i>
          </Link>

          <button
            onClick={(e) => {
              e.preventDefault();
              if (!user) {
                navigate('/auth', { state: { from: { pathname: '/notification' } } });
                return;
              }
              setIsNotificationsOpen(!isNotificationsOpen);
            }}
            className="w-10 h-10 flex items-center justify-center text-zinc-900 hover:scale-110 transition-transform relative"
          >
            <i
              className={`${notificationCount > 0
                  ? "fa-solid text-zinc-950"
                  : "fa-regular text-zinc-900"
                } fa-bell text-xl`}
            ></i>

            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-sm">
                {notificationCount}
              </span>
            )}
          </button>

            {isNotificationsOpen && (
              <>
                <div className="fixed inset-0 z-[100]" onClick={() => setIsNotificationsOpen(false)}></div>
                <div className="absolute top-20 right-4 md:right-12 w-80 bg-white rounded-2xl shadow-2xl border border-zinc-100 z-[110] animate-in slide-in-from-top-2 duration-200 text-left cursor-default">
                  <div className="p-4 border-b border-zinc-100 flex justify-between items-center">
                    <h3 className="font-serif font-bold text-lg text-zinc-900 m-0">Notifications</h3>
                    <span className="text-xs font-semibold bg-zinc-100 px-2 py-1 rounded-full text-zinc-600">
                      {notificationCount} New
                    </span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {paginatedNotifications.length > 0 ? (
                      <div className="flex flex-col">
                        {paginatedNotifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-4 border-b border-zinc-50 hover:bg-zinc-50 transition-colors ${!notification.read ? 'bg-zinc-50/50' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm tracking-wide m-0 ${!notification.read ? 'font-bold text-zinc-900' : 'font-semibold text-zinc-700'} flex items-center`}>
                                {!notification.read && <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>}
                                {notification.title}
                              </h4>
                              <span className="text-[10px] whitespace-nowrap text-zinc-400 font-medium ml-2">{notification.time}</span>
                            </div>
                            <p className={`text-xs leading-relaxed m-0 ${!notification.read ? 'text-zinc-600' : 'text-zinc-500 ml-4'}`}>
                              {notification.message}
                            </p>
                            {!notification.read && (
                              <button
                                onClick={(e) => handleMarkAsRead(e, notification.id)}
                                className="mt-2 text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider ml-4"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-zinc-500 text-sm">
                        No notifications yet.
                      </div>
                    )}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center p-3 border-t border-zinc-50 bg-zinc-50/30">
                      <button
                        onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(prev - 1, 1)); }}
                        disabled={currentPage === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <i className="fa-solid fa-chevron-left text-[10px]"></i>
                      </button>
                      <span className="text-xs font-bold text-zinc-500">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(prev + 1, totalPages)); }}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <i className="fa-solid fa-chevron-right text-[10px]"></i>
                      </button>
                    </div>
                  )}

                  <div className="p-4 border-t border-zinc-100">
                    <button 
                      onClick={handleMarkAllAsRead}
                      disabled={notificationCount === 0}
                      className="w-full block text-center text-xs font-bold uppercase tracking-widest text-zinc-900 hover:text-zinc-500 disabled:opacity-40 disabled:hover:text-zinc-900 transition-colors"
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>
              </>
            )}
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="absolute top-0 left-0 w-[80%] max-w-sm h-full bg-white shadow-2xl animate-in slide-in-from-left duration-500 overflow-y-auto">
            <div className="p-8 space-y-12">
              <div className="flex justify-between items-center">
                <span className="text-3xl font-serif font-bold tracking-tighter">GS Archive</span>
                <button onClick={() => setIsMobileMenuOpen(false)}><i className="fa-solid fa-xmark text-xl"></i></button>
              </div>

              <div className="space-y-8">
                {categories.map((cat) => {
                  const catId = getCatId(cat);
                  const subs = getSubcategoriesForCategory(catId);
                  return (
                    <div key={catId} className="space-y-4">
                      <Link to={`/shop?category=${catId}`} className="text-xl font-serif font-bold italic text-zinc-900 block">{cat.name}</Link>
                      {subs.length > 0 && (
                        <div className="grid grid-cols-1 gap-2 pl-4">
                          {subs.map(sub => {
                            const subId = sub._id || sub.id;
                            return (
                              <Link key={subId} to={`/shop?category=${catId}&subcategory=${subId}`} className="text-sm text-zinc-500 font-medium py-1">
                                {sub.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-12 border-t border-zinc-100 space-y-6">
                <Link to="/wishlist" onClick={(e) => handleProtectedNavigation(e, '/wishlist')} className="flex items-center justify-between text-sm font-bold uppercase tracking-widest text-zinc-900">
                  <span className="flex items-center gap-4">
                    <i className="fa-regular fa-heart text-lg"></i>
                    My Wishlist
                  </span>
                  {wishlist.length > 0 && (
                    <span className="bg-zinc-900 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="flex items-center justify-between text-sm font-bold uppercase tracking-widest text-zinc-900">
                  <span className="flex items-center gap-4">
                    <i className="fa-solid fa-bag-shopping text-lg"></i>
                    My Shopping Bag
                  </span>
                  {cartCount > 0 && (
                    <span className="bg-zinc-900 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-zinc-900">
                  <i className="fa-regular fa-user text-lg"></i>
                  My Account
                </Link>
                <Link to="/track-order" className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-zinc-900">
                  <i className="fa-solid fa-map-location-dot text-lg"></i>
                  Track Order
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Search Modal remains similar but styled */}
      {searchOpen && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center pt-24 px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4 border-b border-zinc-100 pb-6 mb-8">
              <i className="fa-solid fa-magnifying-glass text-zinc-300"></i>
              <input
                type="text"
                placeholder="Search the archives..."
                className="flex-1 bg-transparent outline-none text-xl font-serif italic"
                autoFocus
              />
              <button onClick={() => setSearchOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="space-y-8">
              <div>
                <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-300 mb-4">Quick Links</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 4).map(cat => (
                    <Link key={getCatId(cat)} to={`/shop?category=${getCatId(cat)}`} className="px-4 py-2 rounded-full bg-zinc-50 text-xs font-bold hover:bg-zinc-900 hover:text-white transition-all">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
