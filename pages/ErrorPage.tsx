import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home, RefreshCcw } from 'lucide-react';

const ErrorPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="w-12 h-12 text-zinc-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-2">
                        System Anomaly
                    </span>
                    <h1 className="text-4xl font-serif font-bold italic text-zinc-900 tracking-tight leading-none mb-4">
                        Something went wrong.
                    </h1>
                    <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-xs mx-auto italic font-serif">
                        We encountered an unexpected disruption in our archival stream. The page you seek might have been moved or shifted.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-8">
                    <button
                        onClick={() => window.location.reload()}
                        className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-zinc-50 text-zinc-900 text-[11px] font-black uppercase tracking-[0.25em] border border-zinc-200 rounded-full hover:bg-zinc-100 transition-all active:scale-95"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Retry
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-zinc-950 text-white text-[11px] font-black uppercase tracking-[0.25em] rounded-full hover:bg-zinc-800 transition-all shadow-xl active:scale-95 shadow-zinc-950/20"
                    >
                        <Home className="w-4 h-4" />
                        Home
                    </button>
                </div>

                <div className="pt-12">
                    <p className="text-[10px] text-zinc-300 font-black uppercase tracking-[0.4em]">
                        Error Code: 404 // Ateliers Interrupt
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;
