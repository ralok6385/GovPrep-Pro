"use client";

import { useEffect, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import api from '@/lib/api';
import { Loader2, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';

interface WeaknessData {
    radarData: {
        subject: string;
        accuracy: number;
        fullMark: number;
    }[];
    difficultyAnalysis: {
        difficulty: string;
        accuracy: number;
    }[];
    weakAreas: string[];
    strongAreas: string[];
}

export default function WeaknessHeatmap() {
    const [data, setData] = useState<WeaknessData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [generating, setGenerating] = useState(false);
    const router = require('next/navigation').useRouter();

    useEffect(() => {
        fetchAnalysis();
    }, []);

    const fetchAnalysis = async () => {
        try {
            const { data } = await api.get('/analytics/weakness-analysis');
            setData(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load weakness analysis.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateTest = async () => {
        try {
            setGenerating(true);
            const { data } = await api.post('/tests/generate');
            router.push(`/dashboard/tests/${data._id}`);
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to generate test");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 h-[400px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
    );

    if (error) return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 h-[400px] flex items-center justify-center text-rose-500 font-bold">
            <AlertCircle className="w-6 h-6 mr-2" /> {error}
        </div>
    );

    if (!data || data.radarData.length === 0) return (
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl min-h-[400px] flex flex-col items-center justify-center text-center">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4"></div>

            <div className="relative z-10 max-w-md mx-auto">
                <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/10 shadow-inner rotate-3">
                    <TrendingUp className="w-10 h-10 text-indigo-300" />
                </div>

                <h3 className="text-3xl font-black mb-3">Unlock Your Insights</h3>
                <p className="text-indigo-100 mb-8 leading-relaxed opacity-90">
                    Take your first mock test to generate a personalized performance heatmap. We analyze your weak areas to help you improve faster.
                </p>

                <button
                    onClick={handleGenerateTest}
                    disabled={generating}
                    className="bg-white text-indigo-900 font-bold py-4 px-8 rounded-2xl shadow-xl shadow-indigo-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto"
                >
                    {generating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <TrendingUp className="w-5 h-5" />
                    )}
                    {generating ? 'Creating Test...' : 'Start Diagnostic Test'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <span className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 p-2 rounded-xl">
                            <TrendingUp className="w-6 h-6" />
                        </span>
                        Performance Heatmap
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 ml-1">Subject-wise Mastery</p>
                </div>

                <button
                    onClick={handleGenerateTest}
                    disabled={generating}
                    className="flex items-center gap-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                >
                    {generating ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
                            Smart Practice
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Radar Chart */}
                <div className="h-[320px] w-full relative -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data.radarData}>
                            <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                            />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Accuracy"
                                dataKey="accuracy"
                                stroke="#6366f1"
                                strokeWidth={3}
                                fill="#818cf8"
                                fillOpacity={0.4}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                }}
                                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                formatter={(value: number | undefined) => [value != null ? `${value}%` : '--', 'Accuracy']}
                            />
                        </RadarChart>
                    </ResponsiveContainer>

                    <div className="absolute top-0 right-4 flex flex-col items-end gap-1">
                        <div className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md uppercase tracking-wider">
                            Target: 100%
                        </div>
                    </div>
                </div>

                {/* Insights Panel */}
                <div className="flex flex-col gap-8">
                    {/* Weak Areas */}
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-rose-500" />
                            Focus Areas
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {data.weakAreas.length > 0 ? (
                                data.weakAreas.map((area, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-lg border border-rose-100 dark:border-rose-900/30 flex items-center gap-1.5">
                                        <div className="w-1 h-1 bg-rose-500 rounded-full"></div>
                                        {area}
                                    </span>
                                ))
                            ) : (
                                <span className="text-slate-400 text-sm italic">No critical weak areas found! 🎉</span>
                            )}
                        </div>
                    </div>

                    {/* Strong Areas */}
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            Strongholds
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {data.strongAreas.length > 0 ? (
                                data.strongAreas.map((area, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1.5">
                                        <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                                        {area}
                                    </span>
                                ))
                            ) : (
                                <span className="text-slate-400 text-sm italic">Keep practicing to build strengths.</span>
                            )}
                        </div>
                    </div>

                    {/* Difficulty Breakdown (Mini Bar) */}
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Difficulty Breakdown</h4>
                        <div className="space-y-4">
                            {data.difficultyAnalysis.map((item) => (
                                <div key={item.difficulty} className="flex items-center gap-4">
                                    <span className="w-16 text-xs font-bold text-slate-600 dark:text-slate-400 capitalize">{item.difficulty}</span>
                                    <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${item.accuracy >= 70 ? 'bg-emerald-500' :
                                                item.accuracy >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                                                }`}
                                            style={{ width: `${item.accuracy}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-8 text-right">{item.accuracy}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
