"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { BookOpen, ChevronRight, Calculator, FlaskConical, Globe, Lightbulb } from 'lucide-react';
import Link from 'next/link';

export default function StudyPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const { data } = await api.get('/subjects');
            setSubjects(data);
        } catch (error) {
            console.error('Failed to load subjects', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('math')) return Calculator;
        if (lower.includes('science')) return FlaskConical;
        if (lower.includes('gk') || lower.includes('general')) return Globe;
        if (lower.includes('reasoning')) return Lightbulb;
        return BookOpen;
    };

    const getColor = (index: number) => {
        const colors = [
            'bg-blue-100 text-blue-600',
            'bg-emerald-100 text-emerald-600',
            'bg-purple-100 text-purple-600',
            'bg-amber-100 text-amber-600',
            'bg-rose-100 text-rose-600',
        ];
        return colors[index % colors.length];
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading Subjects...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <header className="bg-white sticky top-0 z-40 border-b border-slate-100 shadow-sm">
                <div className="max-w-md mx-auto px-4 py-4">
                    <h1 className="font-bold text-xl text-slate-800">Study Material (Padhai)</h1>
                    <p className="text-xs text-slate-500">Select a subject to start learning.</p>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6 space-y-4">
                {subjects.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                        <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>No subjects found.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {subjects.map((subject, index) => {
                            const Icon = getIcon(subject.name);
                            const colorClass = getColor(index);

                            return (
                                <Link key={subject._id} href={`/dashboard/study/${subject._id}`} className="block group">
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform active:scale-[0.98]">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClass}`}>
                                            <Icon className="w-7 h-7" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-slate-800 mb-1">{subject.name}</h3>
                                            <p className="text-xs text-slate-500 font-medium">Click to view topics</p>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded-full text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
