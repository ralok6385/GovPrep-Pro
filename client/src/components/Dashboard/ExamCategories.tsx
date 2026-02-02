"use client";

import { Train, Briefcase, Zap, Award } from 'lucide-react';
import Link from 'next/link';

export default function ExamCategories() {
    const exams = [
        {
            id: 'ntpc',
            title: 'RRB NTPC',
            desc: 'Station Master, Clerk, etc.',
            icon: Train,
            color: 'bg-indigo-500',
            href: '/dashboard/tests?category=rrb-ntpc'
        },
        {
            id: 'groupd',
            title: 'RRB Group D',
            desc: 'Track Maintainer, Pointsman',
            icon: Briefcase,
            color: 'bg-emerald-500',
            href: '/dashboard/tests?category=rrb-group-d'
        },
        {
            id: 'alp',
            title: 'RRB ALP',
            desc: 'Assistant Loco Pilot',
            icon: Zap,
            color: 'bg-amber-500',
            href: '/dashboard/tests?category=rrb-alp'
        },
        {
            id: 'je',
            title: 'RRB JE',
            desc: 'Junior Engineer',
            icon: Award,
            color: 'bg-rose-500',
            href: '/dashboard/tests?category=rrb-je'
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {exams.map((exam) => (
                <Link
                    key={exam.id}
                    href={exam.href}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                    <div className={`${exam.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                        <exam.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight mb-1">{exam.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{exam.desc}</p>
                </Link>
            ))}
        </div>
    );
}
