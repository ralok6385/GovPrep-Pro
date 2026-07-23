"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Play, Zap, Trophy, FileText, Sparkles, TrendingUp, Medal, Bookmark, Target, History } from 'lucide-react';
import MobileBottomNav from '@/components/Layout/MobileBottomNav';
import NotificationBell from '@/components/Dashboard/NotificationBell';
import UserAvatar from '@/components/UserAvatar';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const SidebarItem = ({ icon: Icon, label, href, active = false }: any) => {
        const isActive = active || (pathname === href) || (pathname.startsWith(href) && href !== '/dashboard');

        return (
            <Link href={href} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${isActive ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/25 scale-[1.02] font-bold' : 'text-slate-700 hover:bg-indigo-50/80 hover:text-indigo-700 hover:shadow-md font-semibold dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-indigo-300'}`}>
                {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />}
                <div className={`p-2 rounded-xl transition-all duration-300 relative z-10 ${isActive ? 'bg-white/20 shadow-inner' : 'bg-indigo-100/80 text-indigo-600 group-hover:bg-indigo-200/80 group-hover:text-indigo-700 dark:bg-slate-700/50 dark:text-slate-300 dark:group-hover:text-indigo-300'}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 relative z-10">
                    <span className="block leading-none text-[13.5px] font-semibold">{label}</span>
                    {isActive && (
                        <span className="text-[9px] font-semibold opacity-80 block mt-1 capitalize tracking-wide text-indigo-100">
                            {label === 'Dashboard' ? 'Your Daily Hub' :
                                label === 'Study Material' ? 'Notes & PDFs' :
                                    label === 'Full Mock Exams' ? 'Test Series' :
                                        label === 'Daily Quizzes' ? 'Quick Practice' :
                                            label === 'Lectures' ? 'Video Classes' :
                                                label === 'PYQ Practice' ? 'Past Year Papers' : ''}
                        </span>
                    )}
                </div>
                {isActive && <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] pulse-glow relative z-10" />}
            </Link>
        );
    };

    useEffect(() => {
        if (!loading && user && user.role === 'admin') {
            router.replace('/admin/dashboard');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user || user.role === 'admin') return null;

    const isLiveTest = pathname.includes('/live');
    const isProfile = pathname === '/dashboard/profile';

    if (isLiveTest) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
                {children}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {/* Desktop Navigation (Left Sidebar) */}
            <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[272px] bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex-col z-50 transition-all duration-300">
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 pb-2">
                    <div className="flex items-center gap-2 mb-8 group cursor-pointer">
                        <img src="/images/lalan_logo.png" alt="Lalan RailPath" className="h-12 w-auto object-contain transition-transform duration-500 group-hover:scale-105" />
                    </div>

                    <nav className="space-y-1.5">
                        <SidebarItem icon={BookOpen} label="Dashboard" href="/dashboard" active={pathname === '/dashboard'} />
                        <SidebarItem icon={FileText} label="Study Material" href="/dashboard/study-material" />
                        <SidebarItem icon={Trophy} label="Full Mock Exams" href="/dashboard/tests?type=exam" />
                        <SidebarItem icon={Zap} label="Daily Quizzes" href="/dashboard/tests?type=quiz" />
                        <SidebarItem icon={Target} label="Topic Practice" href="/dashboard/practice" />
                        <SidebarItem icon={Play} label="Lectures" href="/dashboard/lectures" />
                        <SidebarItem icon={History} label="PYQ Practice" href="/dashboard/pyq" />

                        <div className="pt-4 mt-4">
                            <p className="text-[10px] font-extrabold text-slate-400 dark:text-indigo-400/50 uppercase tracking-[0.25em] mb-2 ml-3">Progress</p>
                        </div>
                        <SidebarItem icon={TrendingUp} label="My Analytics" href="/dashboard/analytics" />
                        <SidebarItem icon={Medal} label="Leaderboard" href="/dashboard/leaderboard" />
                        <SidebarItem icon={Sparkles} label="Test History" href="/dashboard/history" />
                        <SidebarItem icon={Bookmark} label="My Bookmarks" href="/dashboard/bookmarks" />
                    </nav>
                </div>

                <div className="mt-auto p-4 border-t border-slate-100 dark:border-slate-800">
                    <Link href="/dashboard/profile" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200">
                        <UserAvatar src={user.avatar} name={user.name} size="md" />
                        <div className="flex-1 min-w-0 pr-2">
                            <h4 className="font-bold text-slate-800 dark:text-white text-xs truncate max-w-[130px]">{user.name}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]">{user.email}</p>
                        </div>
                    </Link>
                </div>
            </aside>

            {/* Mobile Header */}
            {!isProfile && (
                <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800">
                    <div className="max-w-md mx-auto px-5 h-16 flex justify-between items-center">
                        <Link href="/dashboard/profile" className="flex items-center gap-3 group">
                            <div className="relative">
                                <UserAvatar src={user.avatar} name={user.name} size="md" />
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-medium">Welcome back,</p>
                                <h1 className="text-xs font-bold text-slate-900 dark:text-white leading-none">{user.name.split(' ')[0]}</h1>
                            </div>
                        </Link>

                        <NotificationBell />
                    </div>
                </header>
            )}

            {/* Desktop Header Notification Bell */}
            <div className="hidden lg:flex fixed top-4 right-8 z-50">
                <NotificationBell />
            </div>

            {/* Main Content Wrapper */}
            <div className="lg:pl-[272px] min-h-screen transition-all pb-24 pb-safe lg:pb-0 relative z-10">
                {children}
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    );
}
