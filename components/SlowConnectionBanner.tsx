import React, { useState } from 'react';
import { useConnectionQuality } from '../hooks/useConnectionQuality';

const DOG_IMAGE_URL = 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif'; // Loading dog gif

const SlowConnectionBanner: React.FC = () => {
    const quality = useConnectionQuality();
    const [dismissed, setDismissed] = useState(false);

    if (quality === 'fast' || dismissed) return null;

    const isOffline = quality === 'offline';

    return (
        <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100vw-2rem)] max-w-md animate-in slide-in-from-bottom-4 duration-500"
            role="alert"
        >
            <div className="relative bg-white rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden flex items-center gap-5 p-6">
                {/* Colored accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-3xl ${isOffline ? 'bg-red-500' : 'bg-amber-400'}`} />

                {/* Dog image */}
                <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-zinc-100 shadow-inner bg-zinc-50">
                        <img
                            src={DOG_IMAGE_URL}
                            alt="Slow connection dog"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Animated indicator dot */}
                    <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow ${isOffline ? 'bg-red-500' : 'bg-amber-400 animate-pulse'}`} />
                </div>

                {/* Text */}
                <div className="flex-grow min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-1.5">
                        {isOffline ? 'Connection Error' : 'Slow Connection'}
                    </p>
                    <p className="text-base font-black text-zinc-900 leading-tight">
                        {isOffline
                            ? 'opps not internter'
                            : 'Your internet is crawling slower than this dog. Hang tight!'}
                    </p>
                    {!isOffline && (
                        <p className="text-[10px] text-zinc-400 font-medium mt-1.5 leading-relaxed">
                            Pages may load slower than usual.
                        </p>
                    )}
                </div>

                {/* Dismiss */}
                <button
                    onClick={() => setDismissed(true)}
                    aria-label="Dismiss"
                    className="flex-shrink-0 w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 transition-all active:scale-90 self-start mt-1"
                >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default SlowConnectionBanner;
