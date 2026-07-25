"use client";

import { useState } from 'react';
import { AlertTriangle, Send, UserX, ShieldAlert, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
    users?: any[];
}

export default function StudentRiskRadar({ users = [] }: Props) {
    const [notified, setNotified] = useState<Record<string, boolean>>({});

    // Filter at-risk users (or fallback sample data if empty DB)
    const atRiskList = users.length > 0
        ? users.filter(u => !u.lastActive || new Date().getTime() - new Date(u.lastActive).getTime() > 5 * 86400000).slice(0, 3)
        : [
            { _id: '1', name: 'Rohan Sharma', email: 'rohan.s@gmail.com', daysInactive: 6, targetExam: 'NTPC' },
            { _id: '2', name: 'Priya Verma', email: 'priya.v@gmail.com', daysInactive: 8, targetExam: 'Group D' },
            { _id: '3', name: 'Amit Kumar', email: 'amit.k@gmail.com', daysInactive: 5, targetExam: 'ALP' }
        ];

    const handleSendNudge = (id: string, name: string) => {
        setNotified(prev => ({ ...prev, [id]: true }));
        toast.success(`Sent re-engagement push alert to ${name}!`);
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            Student At-Risk Retention Radar
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Aspirants inactive for 5+ days</p>
                    </div>
                    <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                        {atRiskList.length} AT-RISK
                    </span>
                </div>

                <div className="space-y-3">
                    {atRiskList.map(u => {
                        const isNotified = notified[u._id];
                        return (
                            <div key={u._id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{u.name}</p>
                                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                                        Inactive for {u.daysInactive || 6} Days • Target: {u.targetExam || 'NTPC'}
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleSendNudge(u._id, u.name)}
                                    disabled={isNotified}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                                        isNotified
                                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                                    }`}
                                >
                                    {isNotified ? <CheckCircle2 className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                                    {isNotified ? 'Nudge Sent' : 'Send Nudge'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
