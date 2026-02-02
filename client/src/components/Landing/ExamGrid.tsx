"use client";

import { Trophy, Target, BookOpen, Briefcase, Landmark, Train, GraduationCap, Building2, Shield } from 'lucide-react';
import Link from 'next/link';

interface ExamGridProps {
    category: string;
}

// Mock Data for a "Full App" feel
const EXAM_DATA: Record<string, any[]> = {
    banking: [
        { id: 'sbi-po', name: 'SBI PO', icon: Trophy, color: 'text-blue-500', bg: 'bg-blue-100' },
        { id: 'ibps-po', name: 'IBPS PO', icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-100' },
        { id: 'rbi-grade-b', name: 'RBI Grade B', icon: Landmark, color: 'text-red-500', bg: 'bg-red-100' },
        { id: 'sbi-clerk', name: 'SBI Clerk', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-100' },
        { id: 'ibps-clerk', name: 'IBPS Clerk', icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-100' },
        { id: 'rbi-assistant', name: 'RBI Assistant', icon: Landmark, color: 'text-purple-500', bg: 'bg-purple-100' },
        { id: 'lic-aao', name: 'LIC AAO', icon: Shield, color: 'text-yellow-600', bg: 'bg-yellow-100' },
        { id: 'niacl-ao', name: 'NIACL AO', icon: Shield, color: 'text-teal-600', bg: 'bg-teal-100' },
    ],
    ssc: [
        { id: 'ssc-cgl', name: 'SSC CGL', icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { id: 'ssc-chsl', name: 'SSC CHSL', icon: Target, color: 'text-blue-600', bg: 'bg-blue-100' },
        { id: 'ssc-mts', name: 'SSC MTS', icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-100' },
        { id: 'ssc-cpo', name: 'SSC CPO', icon: Shield, color: 'text-red-600', bg: 'bg-red-100' },
        { id: 'rrb-ntpc', name: 'RRB NTPC', icon: Train, color: 'text-purple-600', bg: 'bg-purple-100' },
        { id: 'rrb-group-d', name: 'RRB Group D', icon: Train, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { id: 'rrb-alp', name: 'RRB ALP', icon: Train, color: 'text-cyan-600', bg: 'bg-cyan-100' },
        { id: 'ssc-gd', name: 'SSC GD', icon: Shield, color: 'text-gray-600', bg: 'bg-gray-100' },
    ],
    teaching: [
        { id: 'ctet', name: 'CTET', icon: GraduationCap, color: 'text-orange-600', bg: 'bg-orange-100' },
        { id: 'kvs', name: 'KVS', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
        { id: 'nvs', name: 'NVS', icon: Building2, color: 'text-red-600', bg: 'bg-red-100' },
        { id: 'dsssb', name: 'DSSSB', icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-100' },
        { id: 'uptet', name: 'UPTET', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { id: 'super-tet', name: 'Super TET', icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    ],
    state: [
        { id: 'up-police', name: 'UP Police', icon: Shield, color: 'text-blue-800', bg: 'bg-blue-200' },
        { id: 'delhi-police', name: 'Delhi Police', icon: Shield, color: 'text-red-800', bg: 'bg-red-200' },
        { id: 'bihar-police', name: 'Bihar Police', icon: Shield, color: 'text-green-800', bg: 'bg-green-200' },
        { id: 'rajasthan-police', name: 'Rajasthan Police', icon: Shield, color: 'text-orange-800', bg: 'bg-orange-200' },
    ],
    defence: [
        { id: 'nds', name: 'NDA', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { id: 'cds', name: 'CDS', icon: Target, color: 'text-blue-600', bg: 'bg-blue-100' },
        { id: 'afcat', name: 'AFCAT', icon: PlaneIcon, color: 'text-sky-600', bg: 'bg-sky-100' },
        { id: 'agniveer', name: 'Agniveer', icon: Shield, color: 'text-orange-600', bg: 'bg-orange-100' },
    ],
    engineering: [
        { id: 'ssc-je', name: 'SSC JE', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100' },
        { id: 'rrb-je', name: 'RRB JE', icon: Train, color: 'text-red-600', bg: 'bg-red-100' },
        { id: 'gate', name: 'GATE', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-100' },
        { id: 'ese', name: 'ESE', icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    ],
    entrance: [
        { id: 'cuet', name: 'CUET', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { id: 'clat', name: 'CLAT', icon: Landmark, color: 'text-gray-800', bg: 'bg-gray-200' },
        { id: 'mat', name: 'MAT', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100' },
        { id: 'cat', name: 'CAT', icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    ]
};

// Placeholder icon for missing ones
function PlaneIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2 22h20" />
            <path d="M20.498 15.657 14.636 9.794l-3.535 3.535 3.536 3.536" />
            <path d="M2 2 22 22" stroke="none" /> {/* Just a placeholder path */}
            <path d="M12 2 2 7l10 5 10-5-10-5Z" />
            <path d="m2 17 10 5 10-5" />
            <path d="m2 12 10 5 10-5" />
        </svg>
    )
}


export default function ExamGrid({ category }: ExamGridProps) {
    const exams = EXAM_DATA[category] || EXAM_DATA['banking']; // Default fallback

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 animate-fade-in">
            {exams.map((exam) => {
                const Icon = exam.icon;
                return (
                    <Link
                        key={exam.id}
                        href="/login" // Redirect to login for all mock exams
                        className="flex flex-col items-center group cursor-pointer"
                    >
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 shadow-lg ${exam.bg}`}>
                            <Icon className={`w-8 h-8 ${exam.color}`} />
                        </div>
                        <h3 className="text-gray-800 font-semibold text-center text-sm group-hover:text-indigo-600 transition-colors">
                            {exam.name}
                        </h3>
                    </Link>
                );
            })}
        </div>
    );
}
