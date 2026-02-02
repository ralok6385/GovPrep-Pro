
"use client";

import { BookOpen, Trophy, LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    primaryCTA?: {
        label: string;
        href: string;
    };
    secondaryCTA?: {
        label: string;
        href: string;
    };
}

export default function EmptyState({
    title,
    description,
    icon: Icon = BookOpen,
    primaryCTA = { label: "Go to Study Material", href: "/content" },
    secondaryCTA = { label: "Start Full Mock", href: "/dashboard/tests?type=exam" }
}: EmptyStateProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-100 dark:hover:border-indigo-900/40">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-indigo-500">
                <Icon className="w-10 h-10" />
            </div>

            <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2 flex items-center justify-center gap-2">
                😕 {title}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[320px] mx-auto mb-8 font-medium leading-relaxed">
                {description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                    href={primaryCTA.href}
                    className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                >
                    {primaryCTA.label}
                </Link>
                <Link
                    href={secondaryCTA.href}
                    className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <Trophy className="w-4 h-4 text-amber-500" />
                    {secondaryCTA.label}
                </Link>
            </div>
        </div>
    );
}
