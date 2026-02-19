import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-8 right-8 z-[500] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border animate-in slide-in-from-right-10 duration-300 ${toast.type === 'success' ? 'bg-zinc-900 border-zinc-800 text-white' :
                                toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' :
                                    'bg-white border-zinc-100 text-zinc-900'
                            }`}
                    >
                        <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check text-emerald-400' :
                                toast.type === 'error' ? 'fa-circle-exclamation text-red-500' :
                                    'fa-circle-info text-blue-500'
                            }`}></i>
                        <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
                        <button
                            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                            className="ml-4 opacity-40 hover:opacity-100 transition-opacity"
                        >
                            <i className="fa-solid fa-xmark text-xs"></i>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
