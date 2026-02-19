
import React from 'react';
import { Product } from '../types';
import { useApp } from '../App';

interface ComparisonModalProps {
  products: Product[];
  onClose: () => void;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ products, onClose }) => {
  const { addToCart, toggleComparison } = useApp();

  if (products.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative bg-white w-full max-w-7xl max-h-[90vh] overflow-auto shadow-2xl animate-in zoom-in-95 duration-500 flex flex-col rounded-sm">
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-serif font-bold tracking-tight">Compare Selection</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Evaluating {products.length} {products.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-black transition-all bg-gray-50 rounded-full hover:bg-gray-100"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </header>

        <div className="flex-grow p-6 md:p-10">
          <div className="min-w-[800px]">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-48 text-left py-6 px-4"></th>
                  {products.map(product => (
                    <th key={product.id} className="text-left py-6 px-4 border-l border-gray-100 last:border-r">
                      <div className="space-y-4">
                        <div className="aspect-[3/4] overflow-hidden bg-gray-50 rounded-sm">
                          <img src={product.images[0]} className="w-full h-full object-cover" alt={product.name} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold line-clamp-2 min-h-[40px] leading-snug">{product.name}</h3>
                          <button 
                            onClick={() => toggleComparison(product.id)}
                            className="text-[9px] text-vogue-500 hover:text-red-500 font-bold uppercase tracking-widest underline mt-2 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-t border-gray-100">
                  <td className="py-6 px-4 font-bold uppercase text-[10px] tracking-widest text-vogue-500 align-top">Price</td>
                  {products.map(product => (
                    <td key={product.id} className="py-6 px-4 border-l border-gray-100 align-top">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold">₹{product.price.toLocaleString('en-IN')}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-300 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                <tr className="border-t border-gray-100">
                  <td className="py-6 px-4 font-bold uppercase text-[10px] tracking-widest text-vogue-500 align-top">Heritage Brand</td>
                  {products.map(product => (
                    <td key={product.id} className="py-6 px-4 border-l border-gray-100 align-top italic font-serif text-lg">
                      {product.name.split(' ')[0]}
                    </td>
                  ))}
                </tr>

                <tr className="border-t border-gray-100">
                  <td className="py-6 px-4 font-bold uppercase text-[10px] tracking-widest text-vogue-500 align-top">Collective Rating</td>
                  {products.map(product => (
                    <td key={product.id} className="py-6 px-4 border-l border-gray-100 align-top">
                      <div className="flex items-center gap-2">
                        <div className="flex text-black text-[9px]">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={`fa-solid fa-star ${i < Math.floor(product.rating) ? 'text-black' : 'text-gray-200'}`}></i>
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">({product.rating})</span>
                      </div>
                    </td>
                  ))}
                </tr>

                <tr className="border-t border-gray-100">
                  <td className="py-6 px-4 font-bold uppercase text-[10px] tracking-widest text-vogue-500 align-top">Subcategory</td>
                  {products.map(product => (
                    <td key={product.id} className="py-6 px-4 border-l border-gray-100 align-top">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-vogue-50 px-2 py-1 rounded-sm text-vogue-500">
                        {product.subcategory}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="border-t border-gray-100">
                  <td className="py-6 px-4 font-bold uppercase text-[10px] tracking-widest text-vogue-500 align-top">Available Sizes</td>
                  {products.map(product => (
                    <td key={product.id} className="py-6 px-4 border-l border-gray-100 align-top">
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.map(size => (
                          <span key={size} className="text-[9px] font-bold w-7 h-7 flex items-center justify-center border border-gray-100 rounded-sm">
                            {size}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                <tr className="border-t border-gray-100">
                  <td className="py-6 px-4 font-bold uppercase text-[10px] tracking-widest text-vogue-500 align-top">Color Palette</td>
                  {products.map(product => (
                    <td key={product.id} className="py-6 px-4 border-l border-gray-100 align-top">
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map(color => (
                          <div 
                            key={color} 
                            className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" 
                            style={{ backgroundColor: color.toLowerCase().replace(' ', '') }}
                            title={color}
                          ></div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                <tr className="border-t border-gray-100">
                  <td className="py-10 px-4"></td>
                  {products.map(product => (
                    <td key={product.id} className="py-10 px-4 border-l border-gray-100 align-top">
                      <button 
                        onClick={() => addToCart(product.id, product.sizes[0], product.colors[0], 1)}
                        className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-plus text-[8px]"></i>
                        Add to Bag
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;
