"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Play, Zap, Trophy, FileText, Bell, Sparkles, TrendingUp, Medal, Bookmark } from 'lucide-react';
import MobileBottomNav from '@/components/Layout/MobileBottomNav';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const pathname = usePathname();

    const SidebarItem = ({ icon: Icon, label, href, active = false }: any) => {
        // Simple active check
        const isActive = active || (pathname === href) || (pathname.startsWith(href) && href !== '/dashboard');

        return (
            <Link href={href} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-[1.02] font-bold' : 'text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-md font-medium dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400 warm:text-stone-600 warm:hover:bg-[#fdf0d5] warm:hover:text-indigo-600'}`}>
                <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-indigo-50 dark:bg-slate-800 warm:bg-[#fdf0d5] warm:group-hover:bg-indigo-100'}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <span className="block leading-none">{label}</span>
                    {isActive && (
                        <span className="text-[9px] font-medium opacity-80 block mt-1 capitalize tracking-wide text-indigo-100">
                            {label === 'Dashboard' ? 'Your Daily Hub' :
                                label === 'Study Material' ? 'Notes & PDFs' :
                                    label === 'Full Mock Exams' ? 'Test Series' :
                                        label === 'Daily Quizzes' ? 'Quick Practice' :
                                            label === 'Lectures' ? 'Video Classes' : ''}
                        </span>
                    )}
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"></div>}
            </Link>
        );
    }

    const router = useRouter();

    useEffect(() => {
        if (!loading && user && user.role === 'admin') {
            router.replace('/admin/dashboard');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user || user.role === 'admin') return null; // Redirecting via useEffect

    const isLiveTest = pathname.includes('/live');

    if (isLiveTest) {
        return (
            <div className="min-h-screen bg-white transition-colors duration-300">
                {children}
            </div>
        );
    }

    // --- Notification Bell Component ---
    const NotificationBell = () => {
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
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 warm:bg-[var(--background)] transition-colors duration-300">
            {/* Desktop Navigation (Left Sidebar) - Visible on lg screens */}
            <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-900 warm:bg-[#fffbf0] border-r border-slate-200 dark:border-slate-800 warm:border-stone-200 flex-col z-50 transition-colors duration-300">
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 pb-2">
                    <div className="flex items-center gap-2 mb-8 group cursor-pointer">
                        <img src="/images/lalan_logo.png" alt="Lalan RailPath" className="h-12 w-auto object-contain transition-transform duration-500 group-hover:scale-105" />
                    </div>

                    <nav className="space-y-1.5 ">
                        <SidebarItem icon={BookOpen} label="Dashboard" href="/dashboard" active={pathname === '/dashboard'} />
                        <SidebarItem icon={FileText} label="Study Material" href="/dashboard/study-material" />
                        <SidebarItem icon={Trophy} label="Full Mock Exams" href="/dashboard/tests?type=exam" />
                        <SidebarItem icon={Zap} label="Daily Quizzes" href="/dashboard/tests?type=quiz" />
                        <SidebarItem icon={Play} label="Lectures" href="/dashboard/lectures" />

                        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-2 ml-3">Progress</p>
                        </div>
                        <SidebarItem icon={TrendingUp} label="My Analytics" href="/dashboard/analytics" />
                        <SidebarItem icon={Medal} label="Leaderboard" href="/dashboard/leaderboard" />
                        <SidebarItem icon={Sparkles} label="Test History" href="/dashboard/history" />
                        <SidebarItem icon={Bookmark} label="My Bookmarks" href="/dashboard/bookmarks" />
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-slate-100 dark:border-slate-800">
                    <Link href="/dashboard/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-slate-800 overflow-hidden relative border border-indigo-200 dark:border-slate-700">
                            {user.avatar ? (
                                <img
                                    src={user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}${user.avatar}`}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate max-w-[120px]">{user.name}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{user.email}</p>
                        </div>
                    </Link>
                </div>
            </aside>

            {/* Mobile Header - Hidden on lg screens */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 warm:bg-[#fffbf0]/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 warm:border-stone-200/50 supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-md mx-auto px-5 h-16 flex justify-between items-center">
                    <Link href="/dashboard/profile" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 overflow-hidden relative border border-indigo-200">
                                {user.avatar ? (
                                    <img
                                        src={user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}${user.avatar}`}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium group-hover:text-indigo-600 transition-colors">Welcome back,</p>
                            <h1 className="text-sm font-bold text-slate-800 leading-none group-hover:text-indigo-700 transition-colors">{user.name.split(' ')[0]}</h1>
                        </div>
                    </Link>

                    <NotificationBell />
                </div>
            </header>

            {/* Desktop Header - Add Notification Bell to top right for Desktop too */}
            <div className="hidden lg:flex fixed top-4 right-8 z-50">
                <NotificationBell />
            </div>

            {/* Main Content Wrapper */}
            <div className="lg:pl-64 min-h-screen transition-all pb-24 pb-safe lg:pb-0">
                {children}
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    );
};
