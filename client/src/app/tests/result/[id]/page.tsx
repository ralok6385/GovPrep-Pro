"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, MinusCircle, Trophy, Home } from 'lucide-react';
import Link from 'next/link';

interface ResultData {
    score: number;
    accuracy: number;
    responses: {
        questionId: string;
        isCorrect: boolean;
        selectedOption: string | null;
        timeTakenSeconds: number;
    }[];
    // Ideally, I would populate exam/test title too, but let's stick to core data
}

export default function ResultPage({ params }: { params: { id: string } }) {
    const { user } = useAuth();
    const [result, setResult] = useState<ResultData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                // I need to create an endpoint to get specific result: GET /api/tests/results/:id
                // Wait, I only implemented SUBMIT which returns result.
                // I did NOT implement `GET /api/tests/results/:id` in backend yet.
                // I should have. 
                // For now, I'll rely on the `submit` response if I was redirecting... but I am redirecting to a new page.
                // So I MUST fetch the data here.
                // I need to implement `getTestResult` in `testController.js` and route.
                // Or I can pass data via state, but separate page is better for persistance.
                // I'll assume I'll fix the backend in a moment.
                const { data } = await api.get(`/tests/results/${params.id}`);
                setResult(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [params.id]);

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Calculating Result...</div>;
    if (!result) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Result not found.</div>;

    const correct = result.responses.filter(r => r.isCorrect).length;
    const wrong = result.responses.filter(r => !r.isCorrect && r.selectedOption).length;
    const skipped = result.responses.filter(r => !r.selectedOption).length;

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10 mt-8">
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
                    <h1 className="text-4xl font-bold mb-2">Test Submitted!</h1>
                    <p className="text-gray-400">Here is how you performed</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Score Card */}
                    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center">
                        <h3 className="text-gray-400 font-medium mb-2">Total Score</h3>
                        <div className="text-5xl font-bold text-indigo-400">{result.score}</div>
                    </div>
                    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center">
                        <h3 className="text-gray-400 font-medium mb-2">Accuracy</h3>
                        <div className="text-5xl font-bold text-emerald-400">{Math.round(result.accuracy)}%</div>
                    </div>
                    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center flex flex-col justify-center">
                        <div className="flex justify-between px-4 mb-2">
                            <div className="flex items-center gap-2 text-emerald-400"><CheckCircle className="w-4 h-4" /> {correct}</div>
                            <div className="flex items-center gap-2 text-red-400"><XCircle className="w-4 h-4" /> {wrong}</div>
                            <div className="flex items-center gap-2 text-gray-400"><MinusCircle className="w-4 h-4" /> {skipped}</div>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden flex">
                            <div style={{ width: `${(correct / result.responses.length) * 100}%` }} className="bg-emerald-500 h-full" />
                            <div style={{ width: `${(wrong / result.responses.length) * 100}%` }} className="bg-red-500 h-full" />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Correct vs Wrong vs Skipped</p>
                    </div>
                </div>

                <div className="text-center">
                    <Link href={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold inline-flex items-center gap-2">
                        <Home className="w-5 h-5" /> Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
