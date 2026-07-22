
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';

interface NotificationContextType {
    socket: Socket | null;
    notifications: any[];
}

const NotificationContext = createContext<NotificationContextType>({
    socket: null,
    notifications: []
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

            // SECURITY: Pass JWT in handshake auth so the server can verify identity
            // before allowing the socket to join a private notification room.
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const newSocket = io(socketUrl, {
                auth: { token },
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                // SECURITY: Send { userId, token } so the server verifies ownership
                // before joining user_${userId} room (MED-8 fix)
                newSocket.emit('join_dashboard', { userId: user._id, token });
            });

            // Handle auth errors from the server (invalid token, unauthorized room)
            newSocket.on('auth_error', (err: { message: string }) => {
                console.warn('[Socket] Auth error:', err.message);
            });
            newSocket.on('new_test_alert', (data) => {
                setNotifications(prev => [data, ...prev]);
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-slate-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-indigo-100 dark:border-indigo-900/50 p-4`}>
                        <div className="flex-1 w-0">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center text-indigo-600">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                                        New Test Uploaded!
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        {data.title} is now available. Start practicing now!
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex">
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="bg-transparent rounded-md inline-flex text-slate-400 hover:text-slate-500 focus:outline-none"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ), { duration: 6000 });
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [user]);

    return (
        <NotificationContext.Provider value={{ socket, notifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
