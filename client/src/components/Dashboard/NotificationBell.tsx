"use client";

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const { data } = await import('@/lib/api').then(m => m.default.get('/notifications'));
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            } catch (e) { console.error(e); }
        };
        fetchNotes();
        const interval = setInterval(fetchNotes, 60000);
        return () => clearInterval(interval);
    }, []);

    const markRead = async (id: string) => {
        try {
            await import('@/lib/api').then(m => m.default.put(`/notifications/${id}/read`));
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) { console.error(e); }
    };

    const markAllRead = async () => {
        try {
            await import('@/lib/api').then(m => m.default.put('/notifications/read-all'));
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (e) { console.error(e); }
    };

    const getTimeAgo = (dateStr: string) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now.getTime() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24) return `${diffHr}h ago`;
        const diffDay = Math.floor(diffHr / 24);
        if (diffDay < 7) return `${diffDay}d ago`;
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success': return '✅';
            case 'warning': return '⚠️';
            case 'alert': return '🔴';
            default: return '🔔';
        }
    };

    const getTypeBg = (type: string, isRead: boolean) => {
        if (isRead) return 'bg-slate-50 dark:bg-slate-800/50';
        switch (type) {
            case 'success': return 'bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-l-emerald-500';
            case 'warning': return 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-l-amber-500';
            case 'alert': return 'bg-rose-50 dark:bg-rose-900/20 border-l-4 border-l-rose-500';
            default: return 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-500';
        }
    };

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all relative shadow-sm hover:shadow-md"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-black text-white px-0.5 shadow-lg shadow-rose-500/30">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/10 dark:bg-black/30 backdrop-blur-[1px]" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 top-14 w-[360px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 dark:from-slate-800/50 to-transparent">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                                    <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">Notifications</h3>
                                    <p className="text-[10px] text-slate-400 font-medium">
                                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                                    </p>
                                </div>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-[380px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-6">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                        <Bell className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500">No notifications yet</p>
                                    <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">We'll notify you about important updates</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {notifications.map(n => (
                                        <div
                                            key={n._id}
                                            onClick={() => !n.isRead && markRead(n._id)}
                                            className={`px-5 py-3.5 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${getTypeBg(n.type, n.isRead)} ${n.isRead ? 'opacity-60' : ''}`}
                                        >
                                            <div className="flex gap-3 items-start">
                                                <span className="text-base mt-0.5 shrink-0">{getTypeIcon(n.type)}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className={`font-bold text-sm truncate ${n.isRead ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                                                            {n.title}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            {!n.isRead && (
                                                                <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.6)]"></span>
                                                            )}
                                                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                                                                {getTimeAgo(n.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className={`text-xs mt-0.5 leading-relaxed ${n.isRead ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                                        {n.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
