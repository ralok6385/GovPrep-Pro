"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, FileQuestion, BookOpen, LogOut, ShieldAlert, Settings, Users, PlaySquare, FileText, BarChart2, Briefcase, UploadCloud } from 'lucide-react';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'admin') {
                router.push('/login');
            }
        }
    }, [user, loading, router]);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    if (loading || !user || user.role !== 'admin') return <div className="min-h-screen bg-white flex items-center justify-center text-indigo-600 font-medium">Verifying Admin Access...</div>;

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 warm:bg-[var(--background)] text-slate-800 dark:text-slate-100 warm:text-[var(--foreground)] font-sans transition-colors duration-300 overflow-hidden">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 warm:bg-[#fdf0d5] border-b border-slate-200 dark:border-slate-800 z-30 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <LayoutDashboard className="w-6 h-6 text-indigo-600" />
                    </button>
                    <span className="font-black text-lg text-slate-800 dark:text-white">Admin Portal</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                    <span className="text-indigo-700 font-bold text-xs">{user.name?.[0]}</span>
                </div>
            </header>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm animate-in fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 warm:bg-[#fdf0d5] border-r border-slate-200 dark:border-slate-800 warm:border-stone-200 flex flex-col shadow-2xl transition-transform duration-300
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Decorative Background Glows */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>

                <div className="p-8 pb-10 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20">
                            <ShieldAlert className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="font-black text-xl tracking-tight block leading-none text-slate-800 dark:text-white warm:text-[var(--foreground)]">Admin Portal</span>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 warm:text-stone-500 font-black tracking-widest uppercase">GovPrep Pro</span>
                            </div>
                        </div>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-2 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                        <LogOut className="w-5 h-5 rotate-180" />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-2 relative z-10 custom-scrollbar">
                    <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 warm:text-stone-400 uppercase tracking-widest mb-3 mt-4 opacity-70">Insights & Command</p>
                    <NavItem href="/admin/dashboard" icon={LayoutDashboard} label="Command Center" pathname={pathname} />
                    <NavItem href="/admin/jobs" icon={Briefcase} label="Railway Career" pathname={pathname} />

                    <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 warm:text-stone-400 uppercase tracking-widest mb-3 mt-8 opacity-70">Content Pipeline</p>
                    <NavItem href="/admin/content/add" icon={UploadCloud} label="Content Upload" pathname={pathname} />
                    <NavItem href="/admin/exams" icon={BookOpen} label="Exam Database" pathname={pathname} />
                    <NavItem href="/admin/subjects" icon={LayoutDashboard} label="Subject Map" pathname={pathname} />
                    <NavItem href="/admin/content" icon={PlaySquare} label="Content Library" pathname={pathname} />
                    <NavItem href="/admin/questions" icon={FileQuestion} label="Question Engine" pathname={pathname} />
                    <NavItem href="/admin/tests" icon={FileText} label="Manage Tests" pathname={pathname} />

                    <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 warm:text-stone-400 uppercase tracking-widest mb-3 mt-8 opacity-70">Intelligence</p>
                    <NavItem href="/admin/users" icon={Users} label="Student Roster" pathname={pathname} />
                    <NavItem href="/admin/results" icon={BarChart2} label="Analytics & Results" pathname={pathname} />

                    <p className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 warm:text-stone-400 uppercase tracking-widest mb-3 mt-8 opacity-70">System</p>
                    <NavItem href="/admin/settings" icon={Settings} label="Portal Settings" pathname={pathname} />
                </nav>

                <div className="p-6 bg-slate-50 dark:bg-slate-950/50 warm:bg-[#f8eadd] border-t border-slate-100 dark:border-slate-800 warm:border-stone-200 mt-auto relative z-10">
                    <div className="bg-white dark:bg-slate-800 warm:bg-[#fff9f0] rounded-[1.5rem] p-4 mb-4 flex items-center gap-3 border border-slate-100 dark:border-slate-700 warm:border-stone-200 shadow-sm">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 overflow-hidden flex items-center justify-center font-black border border-white/10 shadow-lg">
                            {user.avatar ? (
                                <img
                                    src={user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}${user.avatar}`}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white text-sm">{user.name?.[0]}</span>
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-black truncate text-slate-800 dark:text-white warm:text-stone-800 tracking-tight">{user.name}</p>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">System Admin</p>
                        </div>
                    </div>
                    <button onClick={logout} className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-slate-200 dark:border-slate-800 warm:border-stone-200 hover:bg-rose-50 dark:hover:bg-rose-900/20 warm:hover:bg-rose-100 hover:border-rose-200 hover:text-rose-600 transition-all text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 warm:text-stone-400 active:scale-95 shadow-sm group">
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 warm:bg-[var(--background)] relative selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300 pt-16 lg:pt-0">
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ href, icon: Icon, label, pathname }: { href: string; icon: any; label: string; pathname: string }) {
    const isActive = pathname === href;
    return (
        <Link
            href={href}
            className={clsx(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden mx-1",
                isActive
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 font-bold"
                    : "text-slate-600 dark:text-slate-300 warm:text-stone-500 hover:bg-slate-100 dark:hover:bg-slate-800 warm:hover:bg-[#f3e6d5] hover:text-slate-900 dark:hover:text-white warm:hover:text-stone-900"
            )}
        >
            <Icon className={clsx("w-5 h-5 transition-all duration-300", isActive ? "text-white scale-110" : "text-slate-400 dark:text-slate-400 warm:text-stone-400 group-hover:text-indigo-500 group-hover:scale-110")} />
            <span className={clsx("relative z-10 text-sm tracking-tight", isActive ? "font-black" : "font-bold")}>{label}</span>
            {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white/30 rounded-l-full"></div>
            )}
        </Link>
    );
}
