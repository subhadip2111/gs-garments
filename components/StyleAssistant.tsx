
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { getFashionAdvice } from '../services/gemini';
import { Message } from '../types';

const StyleAssistant: React.FC = () => {
  const { 
    isStyleAssistantOpen, 
    setIsStyleAssistantOpen, 
    sharedProduct, 
    setSharedProduct,
    userStyleProfile,
    setUserStyleProfile,
    userLocation
  } = useApp();
  
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Bonjour. I am your GS Digital Concierge. To provide truly personalized guidance, shall we review your current aesthetic preferences?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() && !sharedProduct || loading) return;

    const userMessage: Message = { 
      role: 'user', 
      text: text || "Consulting about this curated piece...",
      attachedProduct: sharedProduct || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSharedProduct(null);
    setLoading(true);

    // Prepare Context
    const context = {
      userStylePreference: userStyleProfile.aesthetic,
      weather: userLocation ? "Fetching local forecast..." : "Climate Controlled",
      currentProduct: sharedProduct ? `${sharedProduct.name} in ${sharedProduct.category}` : undefined
    };

    const advice = await getFashionAdvice(text || "How should I style this?", context);
    
    setMessages(prev => [...prev, { role: 'ai', text: advice || "An error occurred in my styling algorithms." }]);
    setLoading(false);
  };

  const handleWeatherStyling = () => {
    const query = userLocation 
      ? "What should I wear for the weather at my current coordinates?" 
      : "Give me a versatile outfit for changing seasons.";
    handleSend(query);
  };

  if (!isStyleAssistantOpen) {
    return (
      <button 
        onClick={() => setIsStyleAssistantOpen(true)}
        className="fixed bottom-8 right-8 z-[45] w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group"
      >
        <i className="fa-solid fa-wand-magic-sparkles text-lg"></i>
        <div className="absolute right-full mr-4 px-4 py-2 bg-white text-black text-[9px] font-bold uppercase tracking-widest shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100">
          Consult Style Concierge
        </div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => setIsStyleAssistantOpen(false)}
      ></div>

      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        <header className="p-8 border-b border-gray-100 flex justify-between items-center bg-zinc-950 text-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-vogue-500/20 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-wand-magic-sparkles text-vogue-500"></i>
            </div>
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.4em]">GS Intelligence</h2>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[8px] text-white/40 uppercase tracking-widest">Active Stylist Session</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowPreferences(!showPreferences)}
              className={`text-xs transition-colors ${showPreferences ? 'text-vogue-500' : 'text-white/40 hover:text-white'}`}
              title="Style Preferences"
            >
              <i className="fa-solid fa-sliders"></i>
            </button>
            <button onClick={() => setIsStyleAssistantOpen(false)} className="text-white/40 hover:text-white transition-colors">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
        </header>

        {/* Preferences Panel */}
        {showPreferences && (
          <div className="p-8 bg-zinc-900 text-white animate-in slide-in-from-top duration-300 border-b border-white/5">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-vogue-500 mb-6">Your Aesthetic Profile</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[8px] uppercase tracking-widest text-white/40 mb-3">Core Aesthetic</label>
                <div className="flex flex-wrap gap-2">
                  {['Minimalist', 'Avant-Garde', 'Streetwear', 'Old Money'].map(style => (
                    <button 
                      key={style}
                      onClick={() => setUserStyleProfile({...userStyleProfile, aesthetic: style})}
                      className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest border transition-all ${userStyleProfile.aesthetic === style ? 'bg-white text-black border-white' : 'border-white/10 hover:border-white/40'}`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[8px] uppercase tracking-widest text-white/40">Contextual Styling</span>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-[9px] uppercase font-bold tracking-widest">
                    <i className={`fa-solid fa-location-dot ${userLocation ? 'text-green-500' : 'text-red-500'}`}></i>
                    {userLocation ? 'Location Active' : 'Location Required'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div 
          ref={scrollRef}
          className="flex-grow p-8 overflow-y-auto space-y-10 no-scrollbar bg-vogue-50/50"
        >
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-up duration-500`}>
              <div className="max-w-[85%] space-y-3">
                {msg.attachedProduct && (
                   <div className="bg-white border border-gray-100 p-3 shadow-md rounded-sm flex gap-4 mb-2 animate-in zoom-in-95">
                      <img src={msg.attachedProduct.images[0]} className="w-14 h-20 object-cover" />
                      <div className="flex flex-col justify-center">
                         <span className="text-[10px] font-bold uppercase tracking-tighter line-clamp-1">{msg.attachedProduct.name}</span>
                         <span className="text-[9px] text-vogue-500 uppercase tracking-widest">{msg.attachedProduct.subcategory}</span>
                         <span className="text-[10px] font-bold mt-1">₹{msg.attachedProduct.price.toLocaleString()}</span>
                      </div>
                   </div>
                )}
                <div className={`p-6 rounded-sm text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-black text-white font-medium tracking-tight' 
                    : 'bg-white text-gray-800 italic font-serif border border-gray-100'
                }`}>
                  {msg.text}
                </div>
                {msg.role === 'ai' && (
                  <div className="flex gap-3 px-2">
                    <button className="text-[8px] font-bold uppercase tracking-widest text-vogue-500 hover:text-black transition-colors">Find Similar</button>
                    <button className="text-[8px] font-bold uppercase tracking-widest text-vogue-500 hover:text-black transition-colors">See In Shop</button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-6 rounded-sm shadow-sm flex gap-1 items-center border border-gray-100">
                <div className="w-1 h-1 bg-vogue-500 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-vogue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1 h-1 bg-vogue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-vogue-500 ml-2">Curating Advice...</span>
              </div>
            </div>
          )}
        </div>

        {/* Floating Context Preview */}
        {sharedProduct && (
          <div className="px-8 py-4 bg-zinc-900 text-white flex justify-between items-center animate-slide-up border-t border-white/5">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-white/10 p-1">
                   <img src={sharedProduct.images[0]} className="w-full h-full object-cover grayscale" />
                </div>
                <div>
                   <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-vogue-500 block">Consulting Context</span>
                   <span className="text-[10px] font-bold tracking-tight uppercase line-clamp-1">{sharedProduct.name}</span>
                </div>
             </div>
             <button onClick={() => setSharedProduct(null)} className="text-white/40 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
          </div>
        )}

        {/* Quick Suggestions */}
        <div className="px-8 py-5 flex gap-3 overflow-x-auto no-scrollbar border-t border-gray-100 bg-white">
          <button 
            onClick={handleWeatherStyling}
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-vogue-50 text-[9px] font-bold uppercase tracking-widest border border-vogue-100 hover:border-black transition-all"
          >
            <i className="fa-solid fa-cloud-sun text-vogue-500"></i>
            Weather Edit
          </button>
          {[
            'Night Out', 
            'Heritage Mix', 
            'Trend Report'
          ].map(tag => (
            <button 
              key={tag}
              onClick={() => handleSend(`How should I dress for a ${tag.toLowerCase()}?`)}
              className="flex-shrink-0 px-5 py-2.5 bg-gray-50 text-[9px] font-bold uppercase tracking-widest border border-gray-100 hover:border-black transition-all"
            >
              {tag}
            </button>
          ))}
        </div>

        <footer className="p-8 bg-white border-t border-gray-100">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-4"
          >
            <div className="flex-grow relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your digital stylist..." 
                className="w-full bg-vogue-50 border-none pl-6 pr-12 py-5 text-sm focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-300 font-light rounded-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-vogue-500/20 text-xs">
                 <i className="fa-solid fa-sparkles"></i>
              </div>
            </div>
            <button 
              type="submit"
              disabled={loading || (!input.trim() && !sharedProduct)}
              className="bg-black text-white w-14 h-14 flex items-center justify-center shadow-2xl hover:bg-zinc-800 disabled:opacity-30 transition-all active:scale-95"
            >
              <i className="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default StyleAssistant;
