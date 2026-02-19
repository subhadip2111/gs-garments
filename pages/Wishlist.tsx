
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { toggleWishlist, addToCart } from '../store/cartSlice';
import { MOCK_PRODUCTS } from '../constants';

const Wishlist: React.FC = () => {
    const dispatch = useAppDispatch();
    const wishlist = useAppSelector((state) => state.cart.wishlist);
    const catalog = useAppSelector((state) => state.products.items);
    const navigate = useNavigate();
    const wishlistProducts = catalog.filter(p => wishlist.includes(p.id));

    const handleMoveToCart = (productId: string) => {
        const product = catalog.find(p => p.id === productId);
        if (product) {
            // Default to first available size and color
            const defaultSize = product.sizes[0] || 'One Size';
            const defaultColor = product.colors[0] || 'Default';
            dispatch(addToCart({ productId: product.id, size: defaultSize, color: defaultColor, quantity: 1 }));
            dispatch(toggleWishlist(product.id));
        }
    };

    if (wishlistProducts.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-40 text-center animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                    <i className="fa-regular fa-heart text-3xl text-gray-200"></i>
                </div>
                <h2 className="text-3xl font-serif font-bold mb-4 tracking-tight">Your wishlist is empty</h2>
                <p className="text-gray-500 mb-10 max-w-sm mx-auto font-light leading-relaxed">Save items you love here to keep track of your favorites. We'll even notify you if they go on sale.</p>
                <Link to="/shop" className="inline-block bg-black text-white px-12 py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all shadow-xl active:scale-95">Go to Shop</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-4">
                <div>
                    <h1 className="text-5xl font-serif font-bold tracking-tight mb-2">My Wishlist</h1>
                    <p className="text-vogue-500 text-[10px] font-black uppercase tracking-[0.4em]">Personal Collection • {wishlistProducts.length} Items</p>
                </div>
                <Link to="/shop" className="text-[10px] font-bold uppercase tracking-widest underline decoration-1 underline-offset-8 hover:text-vogue-600 transition-colors">Continue Browsing</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {wishlistProducts.map(product => (
                    <div key={product.id} className="group flex flex-col h-full bg-white transition-all duration-500">
                        <div className="relative aspect-[3/4] overflow-hidden bg-stone-50 rounded-sm mb-6">
                            <img
                                src={product.images[0]}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                alt={product.name}
                            />
                            <button
                                onClick={() => dispatch(toggleWishlist(product.id))}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/95 rounded-full flex items-center justify-center text-red-500 shadow-lg hover:scale-110 active:scale-90 transition-all z-10"
                                title="Remove from wishlist"
                            >
                                <i className="fa-solid fa-heart"></i>
                            </button>
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </div>

                        <div className="flex-grow space-y-2">
                            <div className="flex justify-between items-start gap-2">
                                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-vogue-500">{product.subcategory}</h3>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{product.sku || 'GS-ITEM'}</span>
                            </div>
                            <Link to={`/product/${product.id}`} className="block text-sm font-bold tracking-tight text-gray-900 group-hover:underline line-clamp-2 leading-snug">{product.name}</Link>
                            <div className="pt-2 flex items-center gap-4">
                                <span className="text-base font-black tracking-tighter text-black">₹{product.price.toLocaleString('en-IN')}</span>
                                {product.originalPrice && (
                                    <span className="text-xs text-gray-300 line-through italic font-light">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => handleMoveToCart(product.id)}
                            className="mt-8 w-full bg-white text-black border border-black py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all duration-300 shadow-sm hover:shadow-xl active:scale-95 flex items-center justify-center gap-3"
                        >
                            <i className="fa-solid fa-bag-shopping text-[11px]"></i>
                            Move to Bag
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wishlist;
