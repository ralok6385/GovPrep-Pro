
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Zap, History, Trophy, User } from 'lucide-react';

const NAV_ITEMS = [
    { icon: Home,    label: 'Home',     href: '/dashboard' },
    { icon: Zap,     label: 'Tests',    href: '/dashboard/tests' },
    { icon: History, label: 'PYQ',      href: '/dashboard/pyq' },
    { icon: Trophy,  label: 'Rank',     href: '/dashboard/leaderboard' },
    { icon: User,    label: 'Profile',  href: '/dashboard/profile' },
];

export default function MobileBottomNav() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            {/* Glass backdrop */}
            <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-700/60" />

            <div className="relative flex items-stretch justify-around h-[60px] px-1 max-w-lg mx-auto">
                {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
                    const active = isActive(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className="flex flex-col items-center justify-center flex-1 gap-0.5 relative group"
                        >
                            {/* Active pill background */}
                            {active && (
                                <span className="absolute inset-x-1 top-1.5 h-8 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 transition-all duration-300" />
                            )}

                            <span className={`relative z-10 transition-all duration-200 ${active ? 'text-indigo-600 dark:text-indigo-400 -translate-y-0.5' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                                <Icon
                                    className="w-[22px] h-[22px]"
                                    strokeWidth={active ? 2.5 : 2}
                                />
                            </span>

                            <span className={`relative z-10 text-[10px] font-bold tracking-tight transition-colors duration-200 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
