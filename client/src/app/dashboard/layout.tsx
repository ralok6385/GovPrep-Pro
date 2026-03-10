"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Play, Zap, Trophy, FileText, Sparkles, TrendingUp, Medal, Bookmark, Target } from 'lucide-react';
import MobileBottomNav from '@/components/Layout/MobileBottomNav';
import NotificationBell from '@/components/Dashboard/NotificationBell';
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

    // NotificationBell is now imported from @/components/Dashboard/NotificationBell

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
                        <SidebarItem icon={Target} label="Topic Practice" href="/dashboard/practice" />
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
