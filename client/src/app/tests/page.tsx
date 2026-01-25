"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Test {
    _id: string;
    title: string;
    durationMinutes: number;
    totalMarks: number;
}

export default function TestsPage() {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) return; // Wait for auth

        // We need exam Id. Ideally stored in user context clearly. 
        // user.selectedExam is object (populated) or ID?
        // Based on my backend update: `populate('selectedExam')` -> Object.
        // Based on `selectExam` response -> Object. 
        // AuthContext `checkAuth` -> uses `getUserProfile` -> `populate('selectedExam')`.
        // So `user.selectedExam` is an object with `_id` and `name`.
        // I will cast it safely.
        const examId = (user.selectedExam as any)?._id;

        if (examId) {
            const fetchTests = async () => {
                try {
                    const { data } = await api.get(`/tests/exam/${examId}`);
                    setTests(data);
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            };
            fetchTests();
        } else {
            setLoading(false);
        }

    }, [user]);

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 pb-20">
            <div className="max-w-4xl mx-auto py-8">
                <h1 className="text-3xl font-bold mb-6">Available Mock Tests</h1>

                {loading ? (
                    <div className="text-center py-10">Loading tests...</div>
                ) : tests.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 bg-slate-800 rounded-xl">
                        No tests available specifically for your exam yet. Stay tuned!
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {tests.map(test => (
                            <div key={test._id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-xl font-bold mb-2">{test.title}</h2>
                                    <div className="flex gap-4 text-sm text-gray-400">
                                        <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {test.durationMinutes} Mins</div>
                                        <div className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> {test.totalMarks} Marks</div>
                                    </div>
                                </div>
                                <Link
                                    href={`/tests/${test._id}`}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
                                >
                                    Start Test
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
