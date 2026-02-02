"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Clock, AlertTriangle, ArrowRight, Shield, Info, CheckCircle2, ChevronLeft } from 'lucide-react';

export default function TestInstructionPage() {
    const params = useParams();
    const router = useRouter();
    const [test, setTest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [agreed, setAgreed] = useState(false);

    useEffect(() => {
        if (params.id) fetchTest();
    }, [params.id]);

    const fetchTest = async () => {
        try {
            const { data } = await api.get(`/tests/${params.id}`);
            setTest(data);
        } catch (error) {
            console.error('Failed to load test', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Loading Instructions...</p>
            </div>
        </div>
    );

    if (!test) return <div className="min-h-screen flex items-center justify-center text-red-500">Test not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* Professional Official Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ChevronLeft className="w-6 h-6 text-slate-600" />
                        </button>
                        <div>
                            <h1 className="font-black text-indigo-950 text-xl tracking-tight uppercase">{test.title}</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Examination Portal • Lalan RailPath</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
                        <Shield className="w-4 h-4 text-indigo-600" />
                        <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Secure Exam Environment</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6 space-y-8">
                {/* Exam Metadata Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4 group hover:border-indigo-200 transition-colors">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{test.durationMinutes || 90} Min</p>
                            <p className="text-xs font-bold text-slate-400 uppercase">Total Duration</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4 group hover:border-indigo-200 transition-colors">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{test.questions?.length || 100}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase">Questions</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4 group hover:border-indigo-200 transition-colors">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{test.totalMarks || 100}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase">Max Marks</p>
                        </div>
                    </div>
                </div>

                {/* Instructions Section */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-8 py-5 border-b border-slate-100">
                        <h2 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-3">
                            <Info className="w-5 h-5 text-indigo-600" />
                            General Instructions (सामान्य निर्देश)
                        </h2>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Proctored Warning */}
                        {test?.type !== 'quiz' && (
                            <div className="bg-indigo-900 p-6 rounded-[2rem] text-white flex gap-5 items-start shadow-xl shadow-indigo-900/20">
                                <Shield className="w-10 h-10 text-indigo-400 shrink-0 animate-pulse" />
                                <div className="space-y-2">
                                    <h3 className="font-black uppercase tracking-widest text-xs text-indigo-300">Strict Proctored Protocol Active</h3>
                                    <p className="text-sm font-medium leading-relaxed opacity-90 italic">
                                        This exam is AI-Monitored. Fullscreen Mode is <strong>compulsory</strong>. Exiting fullscreen, switching tabs, or loss of window focus is treated as a <strong>malpractice violation</strong>.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-black text-indigo-950 uppercase tracking-tighter text-sm">Exam Rules</h3>
                                <ul className="space-y-3 text-sm text-slate-600 font-medium">
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                                        Total duration of the exam is {test.durationMinutes || 90} minutes.
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                                        For every correct answer, <strong>{test.positiveMark || 1} mark</strong> will be awarded.
                                    </li>
                                    <li className="flex gap-3 text-rose-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                                        <strong>1/3 Negative Marking</strong>: For every wrong answer, 0.33 marks will be deducted.
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                                        The countdown timer will auto-submit the exam upon completion.
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-black text-indigo-950 uppercase tracking-tighter text-sm">Navigation Guide</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-sm bg-green-500" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Answered</span>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-sm bg-red-500" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Not Answered</span>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-sm bg-purple-600" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Marked (Review)</span>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-sm bg-slate-200" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Not Visited</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Candidate Declaration */}
                        <div className="pt-6 border-t border-slate-100">
                            <label className="flex gap-4 p-5 bg-indigo-50/50 border border-indigo-100 rounded-3xl cursor-pointer group hover:bg-indigo-50 transition-all">
                                <div className="relative flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    />
                                </div>
                                <div className="text-sm">
                                    <p className="font-black text-indigo-950 uppercase tracking-tighter mb-1">Candidate Declaration</p>
                                    <p className="text-slate-500 font-medium italic">
                                        I have read and understood all the instructions. I agree that I will not use any unfair means during the examination. I am aware that switching tabs or exiting fullscreen will be recorded as a security violation.
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </main>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-200 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="hidden md:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Current User</p>
                        <p className="text-sm font-bold text-slate-900">
                            {(typeof params.id === 'string' ? params.id : params.id?.[0])?.slice(-8)?.toUpperCase()} (READY TO TEST)
                        </p>
                    </div>
                    <button
                        onClick={() => router.push(`/dashboard/tests/${params.id}/live`)}
                        disabled={!agreed}
                        className={`px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl ${agreed
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-[1.05] shadow-emerald-600/20'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                        I am ready to begin <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
