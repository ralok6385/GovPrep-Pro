"use client";

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
    useEffect(() => {
        if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('/sw.js')
                    .then((registration) => {
                        console.log('[PWA] Service Worker registered:', registration.scope);

                        // Listen for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            if (newWorker) {
                                newWorker.addEventListener('statechange', () => {
                                    if (newWorker.state === 'activated') {
                                        // New version available — user will see it on next reload
                                        console.log('[PWA] New version available');
                                    }
                                });
                            }
                        });
                    })
                    .catch((err) => {
                        console.warn('[PWA] Service Worker registration failed:', err);
                    });
            });
        }
    }, []);

    return null; // This component renders nothing
}
