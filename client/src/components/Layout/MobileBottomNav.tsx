
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Zap, FileText, User } from 'lucide-react';

export default function MobileBottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/dashboard' && pathname === '/dashboard') return true;
        if (path !== '/dashboard' && pathname.startsWith(path)) return true;
        return false;
    };

    const NavItem = ({ icon: Icon, label, href }: { icon: any, label: string, href: string }) => {
        const active = isActive(href);
        return (
            <Link
                href={href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active ? 'text-indigo-600' : 'text-slate-400'}`}
            >
                <div className={`relative p-1.5 rounded-xl transition-all ${active ? 'bg-indigo-50 -translate-y-2 shadow-lg shadow-indigo-500/20' : ''}`}>
                    <Icon className={`w-6 h-6 ${active ? 'fill-current' : ''}`} strokeWidth={active ? 2.5 : 2} />
                    {active && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></span>
                    )}
                </div>
                <span className={`text-[10px] font-bold ${active ? 'text-indigo-600 opacity-100' : 'opacity-0 scale-0'} transition-all duration-300 absolute bottom-1`}>
                    {label}
                </span>
            </Link>
        );
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 lg:hidden pb-safe">
            <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
                <NavItem icon={Home} label="Home" href="/dashboard" />
                <NavItem icon={FileText} label="Study" href="/dashboard/study-material" />
                <NavItem icon={Zap} label="Tests" href="/dashboard/tests" />
                <NavItem icon={BookOpen} label="Lectures" href="/dashboard/lectures" />
                <NavItem icon={User} label="Profile" href="/profile" />
            </div>
        </div>
    );
}
