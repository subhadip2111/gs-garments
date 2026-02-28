import { useState, useEffect } from 'react';

type ConnectionQuality = 'fast' | 'slow' | 'offline';

export const useConnectionQuality = (): ConnectionQuality => {
    const [quality, setQuality] = useState<ConnectionQuality>('fast');

    useEffect(() => {
        const checkConnection = () => {
            if (!navigator.onLine) {
                setQuality('offline');
                return;
            }

            // Use Network Information API if available
            const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
            if (conn) {
                const effectiveType: string = conn.effectiveType || '4g';
                const downlink: number = conn.downlink ?? 10;
                if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 0.5) {
                    setQuality('slow');
                    return;
                }
                if (effectiveType === '3g' || downlink < 1.5) {
                    setQuality('slow');
                    return;
                }
                setQuality('fast');
                return;
            }

            // Fallback: measure a tiny fetch timing
            const start = performance.now();
            fetch(`https://www.google.com/favicon.ico?_=${Date.now()}`, {
                mode: 'no-cors',
                cache: 'no-store',
            })
                .then(() => {
                    const elapsed = performance.now() - start;
                    setQuality(elapsed > 2000 ? 'slow' : 'fast');
                })
                .catch(() => setQuality('offline'));
        };

        checkConnection();

        window.addEventListener('online', checkConnection);
        window.addEventListener('offline', () => setQuality('offline'));

        const interval = setInterval(checkConnection, 30_000); // re-check every 30s
        return () => {
            window.removeEventListener('online', checkConnection);
            window.removeEventListener('offline', () => setQuality('offline'));
            clearInterval(interval);
        };
    }, []);

    return quality;
};
