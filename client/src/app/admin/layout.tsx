"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, FileQuestion, BookOpen, LogOut, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'admin') {
                router.push('/login');
            }
        }
    }, [user, loading, router]);

    if (loading || !user || user.role !== 'admin') return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Verifying Admin Access...</div>;

    return (
        <div className="flex h-screen bg-slate-900 text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
                <div className="p-6 border-b border-slate-700 flex items-center gap-2 text-indigo-400">
                    <ShieldAlert className="w-6 h-6" />
                    <span className="font-bold text-xl tracking-wide">Admin Panel</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin/dashboard" className={clsx("flex items-center gap-3 px-4 py-3 rounded-xl transition-colors", pathname === '/admin/dashboard' ? "bg-indigo-600 text-white" : "text-gray-400 hover:bg-slate-700 hover:text-white")}>
                        <LayoutDashboard className="w-5 h-5" /> Dashboard
                    </Link>
                    <Link href="/admin/questions" className={clsx("flex items-center gap-3 px-4 py-3 rounded-xl transition-colors", pathname === '/admin/questions' ? "bg-indigo-600 text-white" : "text-gray-400 hover:bg-slate-700 hover:text-white")}>
                        <FileQuestion className="w-5 h-5" /> Question Bank
                    </Link>
                    <Link href="/admin/tests" className={clsx("flex items-center gap-3 px-4 py-3 rounded-xl transition-colors", pathname === '/admin/tests' ? "bg-indigo-600 text-white" : "text-gray-400 hover:bg-slate-700 hover:text-white")}>
                        <BookOpen className="w-5 h-5" /> Manage Tests
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                        <LogOut className="w-5 h-5" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
