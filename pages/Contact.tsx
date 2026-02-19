
import React, { useState } from 'react';
import { getFashionAdvice } from '../services/gemini';

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const handleAiConcierge = async (topic: string) => {
    setAiLoading(true);
    const response = await getFashionAdvice(`Act as the GS Customer Concierge. Help the user with: ${topic}. Be professional, luxury-oriented, and concise.`);
    setAiResponse(response);
    setAiLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-12 py-24 animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
        {/* Contact Info Column */}
        <div className="space-y-20">
          <header>
            <span className="text-vogue-500 text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">Concierge Services</span>
            <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tighter mb-8 leading-[0.8]">At Your <br /> Service.</h1>
            <p className="text-xl text-gray-400 font-light leading-relaxed max-w-md">
              Whether you require sizing guidance or have inquiries regarding a brand partner, our specialized concierge is available to assist you.
            </p>
          </header>

          {/* AI Concierge Quick Help */}
          <div className="bg-zinc-950 p-10 text-white rounded-sm shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <i className="fa-solid fa-wand-magic-sparkles text-vogue-500"></i>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.3em]">AI Concierge Beta</h3>
              </div>
              <p className="text-xs text-white/50 leading-relaxed font-light">Need instant answers about our styles or policies? Ask our intelligent assistant.</p>
              
              <div className="flex flex-wrap gap-2">
                {['Returns Policy', 'Sizing Help', 'Brand Authenticity'].map(topic => (
                  <button 
                    key={topic}
                    onClick={() => handleAiConcierge(topic)}
                    className="text-[9px] font-bold uppercase tracking-widest border border-white/10 px-4 py-2 hover:bg-white hover:text-black transition-all"
                  >
                    {topic}
                  </button>
                ))}
              </div>

              {aiLoading && <div className="text-xs text-white/50 animate-pulse italic">Connecting with Concierge...</div>}
              {aiResponse && (
                <div className="p-4 bg-white/5 border-l-2 border-vogue-500 text-sm italic font-serif text-white/90 animate-slide-up">
                  "{aiResponse}"
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-vogue-500 mb-4">Direct Concierge</h4>
              <p className="text-lg font-serif italic text-gray-800">1800-STYLE-GS</p>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Mon-Sat, 9am - 7pm IST</p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-vogue-500 mb-4">Global Reach</h4>
              <p className="text-lg font-serif italic text-gray-800">concierge@gs.co</p>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">24/7 Digital Support</p>
            </div>
          </div>
        </div>

        {/* Inquiry Form Column */}
        <div className="relative">
          <div className="absolute inset-0 bg-vogue-50 -z-10 -rotate-2 rounded-sm opacity-50"></div>
          <div className="bg-white p-12 lg:p-16 border border-gray-100 rounded-sm shadow-sm h-full">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="space-y-8">
                  <div className="group relative">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-vogue-500 mb-2 transition-all group-focus-within:text-black">Subject of Inquiry</label>
                    <select className="w-full bg-transparent border-b border-gray-200 focus:border-black outline-none py-4 text-sm transition-all cursor-pointer">
                      <option>Product Sizing & Fit</option>
                      <option>Order Tracking & Logistics</option>
                      <option>Brand Partnership</option>
                      <option>Corporate Gifting</option>
                      <option>Other</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="group relative">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-vogue-500 mb-2 transition-all group-focus-within:text-black">Full Name</label>
                      <input required type="text" className="w-full bg-transparent border-b border-gray-200 focus:border-black outline-none py-4 text-sm transition-all" placeholder="Enter your name" />
                    </div>
                    <div className="group relative">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-vogue-500 mb-2 transition-all group-focus-within:text-black">Email Address</label>
                      <input required type="email" className="w-full bg-transparent border-b border-gray-200 focus:border-black outline-none py-4 text-sm transition-all" placeholder="email@example.com" />
                    </div>
                  </div>

                  <div className="group relative">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-vogue-500 mb-2 transition-all group-focus-within:text-black">Your Message</label>
                    <textarea required rows={6} className="w-full bg-transparent border-b border-gray-200 focus:border-black outline-none py-4 text-sm transition-all resize-none" placeholder="How may we assist you today?"></textarea>
                  </div>
                </div>

                <button type="submit" className="group w-full bg-black text-white py-6 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-zinc-900 transition-all flex items-center justify-center gap-4 active:scale-95">
                  Send Inquiry
                  <i className="fa-solid fa-paper-plane text-[8px] group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform"></i>
                </button>
              </form>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in zoom-in-95">
                <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mb-10 shadow-2xl">
                  <i className="fa-solid fa-check text-3xl"></i>
                </div>
                <h3 className="text-4xl font-serif font-bold italic tracking-tight mb-6">Received with gratitude.</h3>
                <p className="text-gray-400 font-light leading-relaxed max-w-xs mx-auto mb-10">
                  Our concierge team has received your inquiry. We typically respond within 12 business hours.
                </p>
                <button onClick={() => setSubmitted(false)} className="text-[10px] font-bold uppercase tracking-widest border-b border-black pb-2 hover:text-vogue-500 transition-colors">
                  Submit another inquiry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
