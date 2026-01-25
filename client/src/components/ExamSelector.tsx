"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Check, Loader2, Sparkles, Trophy, BookOpen, Target } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

interface Exam {
    _id: string;
    name: string;
    description: string;
}

export default function ExamSelector() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState<string | null>(null);
    const { checkAuth } = useAuth();

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const { data } = await api.get('/exams');
                setExams(data);
            } catch (error) {
                toast.error('Failed to load exams');
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    const handleSelect = async (examId: string) => {
        setSelecting(examId);
        try {
            await api.put('/auth/select-exam', { examId });
            await checkAuth();
            toast.success('Exam goal set successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save selection. Please try again.');
            setSelecting(null);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-white text-lg font-medium">Loading your future...</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center overflow-auto p-4 sm:p-8">
            <div className="w-full max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full mb-6">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span className="text-indigo-400 text-sm font-medium">Personalized Journey</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">What's your target?</h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Select the exam you are preparing for. We will verify your account and customize your mock tests, study material, and daily goals.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams.map((exam) => (
                        <button
                            key={exam._id}
                            onClick={() => handleSelect(exam._id)}
                            disabled={selecting !== null}
                            className={`group relative flex flex-col p-8 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 rounded-2xl transition-all duration-300 text-left hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 ${selecting === exam._id ? 'ring-2 ring-indigo-500 bg-slate-800 border-indigo-500' : ''}`}
                        >
                            {/* Icon Based on Name (Mock logic for variation) */}
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors ${selecting === exam._id ? 'bg-indigo-600' : 'bg-slate-700 group-hover:bg-indigo-600/20'}`}>
                                {exam.name.includes('SSC') ? <Trophy className={`w-7 h-7 ${selecting === exam._id ? 'text-white' : 'text-indigo-400'}`} /> :
                                    exam.name.includes('Bank') ? <Target className={`w-7 h-7 ${selecting === exam._id ? 'text-white' : 'text-pink-400'}`} /> :
                                        <BookOpen className={`w-7 h-7 ${selecting === exam._id ? 'text-white' : 'text-emerald-400'}`} />}
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-white">{exam.name}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">{exam.description || 'Comprehensive syllabus coverage including Mock Tests, PDF Notes, and Performance Analytics.'}</p>

                            <div className="flex items-center justify-between mt-auto">
                                <span className={`text-sm font-medium transition-colors ${selecting === exam._id ? 'text-indigo-400' : 'text-gray-500 group-hover:text-indigo-400'}`}>
                                    {selecting === exam._id ? 'Setting your goal...' : 'Select Goal'}
                                </span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${selecting === exam._id ? 'bg-indigo-500 rotate-0 opacity-100' : 'bg-slate-700 rotate-[-45deg] opacity-50 group-hover:opacity-100 group-hover:bg-indigo-500/20'}`}>
                                    {selecting === exam._id ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Check className="w-4 h-4 text-white" />}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
