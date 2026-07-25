"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
    LayoutDashboard, FileQuestion, BookOpen, LogOut, ShieldCheck, Settings, 
    Users, PlaySquare, FileText, BarChart2, Briefcase, UploadCloud, Bell, Plus,
    ChevronDown, Layers, Sparkles
} from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';

function NavItem({ href, icon: Icon, label, pathname }: { href: string; icon: any; label: string; pathname: string }) {
    const isActive = pathname === href || (pathname.startsWith(href) && href !== '/admin/dashboard');

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
            }`}
        >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
            <span className="truncate">{label}</span>
        </Link>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        setIsSidebarOpen(false);
        setIsQuickMenuOpen(false);
    }, [pathname]);

    if (loading || !user || user.role !== 'admin') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Authenticating Admin Access...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
            
            {/* Mobile Top Header Bar */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 z-30 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                        aria-label="Toggle Admin Sidebar"
                    >
                        <LayoutDashboard className="w-6 h-6 text-indigo-600" />
                    </button>
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">Admin LMS</span>
                </div>
                <UserAvatar src={user.avatar} name={user.name} size="sm" />
            </header>

            {/* Mobile Backdrop Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm animate-in fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Admin Left Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-transform duration-300
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Brand Header */}
                <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-extrabold text-base block leading-none text-slate-900 dark:text-white">Lalan LMS Portal</span>
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold tracking-widest uppercase mt-1 block">RailPath Admin Suite</span>
                        </div>
                    </div>
                </div>

                {/* Sidebar Navigation Links (4 Groups) */}
                <nav className="flex-1 px-4 space-y-6 overflow-y-auto py-4 custom-scrollbar">
                    
                    {/* Group 1: Overview */}
                    <div>
                        <p className="px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Overview</p>
                        <div className="space-y-1">
                            <NavItem href="/admin/dashboard" icon={LayoutDashboard} label="Command Center" pathname={pathname} />
                        </div>
                    </div>

                    {/* Group 2: Academic Content */}
                    <div>
                        <p className="px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Academic Content</p>
                        <div className="space-y-1">
                            <NavItem href="/admin/questions" icon={FileQuestion} label="Question Bank Engine" pathname={pathname} />
                            <NavItem href="/admin/tests" icon={FileText} label="Test Series Builder" pathname={pathname} />
                            <NavItem href="/admin/content" icon={PlaySquare} label="Study Material & PDFs" pathname={pathname} />
                            <NavItem href="/admin/videos" icon={UploadCloud} label="Video Lectures" pathname={pathname} />
                            <NavItem href="/admin/exams" icon={BookOpen} label="Railway Exam Categories" pathname={pathname} />
                            <NavItem href="/admin/subjects" icon={Layers} label="Subject Architecture" pathname={pathname} />
                        </div>
                    </div>

                    {/* Group 3: Student Operations */}
                    <div>
                        <p className="px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Student Operations</p>
                        <div className="space-y-1">
                            <NavItem href="/admin/users" icon={Users} label="Aspirants Roster" pathname={pathname} />
                            <NavItem href="/admin/results" icon={BarChart2} label="Analytics & Exam Results" pathname={pathname} />
                        </div>
                    </div>

                    {/* Group 4: System Operations */}
                    <div>
                        <p className="px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">System Operations</p>
                        <div className="space-y-1">
                            <NavItem href="/admin/notifications" icon={Bell} label="Broadcast Alerts" pathname={pathname} />
                            <NavItem href="/admin/jobs" icon={Briefcase} label="Railway Job Updates" pathname={pathname} />
                            <NavItem href="/admin/settings" icon={Settings} label="Portal Settings" pathname={pathname} />
                        </div>
                    </div>
                </nav>

                {/* Admin Footer User Profile */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                        <div className="flex items-center gap-3 min-w-0">
                            <UserAvatar src={user.avatar} name={user.name} size="md" />
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase">Administrator</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            title="Sign Out"
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area with Desktop Header Bar */}
            <main className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc] dark:bg-[#090d16]">
                {/* Desktop Top Header Bar */}
                <header className="hidden lg:flex h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-8 items-center justify-between z-20 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">LMS Engine: Active & Synchronized</span>
                    </div>

                    <div className="flex items-center gap-3 relative">
                        {/* Quick Actions Dropdown Button */}
                        <div className="relative">
                            <button
                                onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
                                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Quick Actions
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isQuickMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isQuickMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-2 z-50">
                                    <Link href="/admin/questions/add" className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <FileQuestion className="w-4 h-4 text-indigo-600" />
                                        Add New Question
                                    </Link>
                                    <Link href="/admin/tests/builder" className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <FileText className="w-4 h-4 text-emerald-600" />
                                        Build Mock Test Series
                                    </Link>
                                    <Link href="/admin/content/add" className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <UploadCloud className="w-4 h-4 text-amber-600" />
                                        Upload PDF & Material
                                    </Link>
                                    <Link href="/admin/notifications" className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <Sparkles className="w-4 h-4 text-rose-600" />
                                        Broadcast Alert
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content Body */}
                <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
                    {children}
                </div>
            </main>
        </div>
    );
}
