"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Target, ChevronDown, Check, Train } from 'lucide-react';
import toast from 'react-hot-toast';

const TARGET_EXAMS = [
    { id: 'NTPC', name: 'RRB NTPC CBT-1', desc: 'Station Master, Goods Guard, Clerk' },
    { id: 'Group D', name: 'RRB Group D', desc: 'Track Maintainer, Pointsman, Assistant' },
    { id: 'ALP', name: 'RRB ALP', desc: 'Assistant Loco Pilot (CBT 1 & 2)' },
    { id: 'JE', name: 'RRB JE', desc: 'Junior Engineer (Civil, Mech, Elec)' },
];

export default function ExamGoalSelector() {
    const { user, updateProfile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [updating, setUpdating] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentExamId = user?.targetExam || 'NTPC';
    const currentExam = TARGET_EXAMS.find(e => e.id === currentExamId) || TARGET_EXAMS[0];

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectExam = async (examId: string) => {
        if (examId === currentExamId) {
            setIsOpen(false);
            return;
        }
        setUpdating(true);
        try {
            await updateProfile({ targetExam: examId });
            toast.success(`Target Exam switched to RRB ${examId}`);
            setIsOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={updating}
                aria-label="Switch Target Exam"
                className="flex items-center gap-2 px-3 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm hover:border-indigo-500 transition-all text-xs font-bold text-slate-800 dark:text-slate-200"
            >
                <div className="w-5 h-5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Train className="w-3 h-3" />
                </div>
                <span className="text-slate-500 font-medium hidden sm:inline">Target:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold uppercase">{currentExam.id}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Target Railway Exam</p>
                    </div>

                    <div className="space-y-1 mt-1">
                        {TARGET_EXAMS.map((exam) => {
                            const isSelected = exam.id === currentExamId;
                            return (
                                <button
                                    key={exam.id}
                                    onClick={() => handleSelectExam(exam.id)}
                                    className={`w-full p-2.5 rounded-xl text-left flex items-start justify-between transition-colors ${
                                        isSelected 
                                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50' 
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                                    }`}
                                >
                                    <div>
                                        <p className={`text-xs font-bold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                            {exam.name}
                                        </p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                                            {exam.desc}
                                        </p>
                                    </div>
                                    {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
