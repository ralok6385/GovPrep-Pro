"use client";

import { Users, FileCheck, CheckCircle2, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">System Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-500/20 p-2 rounded-lg"><Users className="text-blue-400 w-6 h-6" /></div>
                    </div>
                    <div className="text-3xl font-bold mb-1">1,234</div>
                    <p className="text-gray-400 text-sm">Total Students</p>
                </div>

                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-emerald-500/20 p-2 rounded-lg"><FileCheck className="text-emerald-400 w-6 h-6" /></div>
                    </div>
                    <div className="text-3xl font-bold mb-1">56</div>
                    <p className="text-gray-400 text-sm">Mock Tests Active</p>
                </div>

                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-purple-500/20 p-2 rounded-lg"><CheckCircle2 className="text-purple-400 w-6 h-6" /></div>
                    </div>
                    <div className="text-3xl font-bold mb-1">15k</div>
                    <p className="text-gray-400 text-sm">Questions in Bank</p>
                </div>

                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-orange-500/20 p-2 rounded-lg"><TrendingUp className="text-orange-400 w-6 h-6" /></div>
                    </div>
                    <div className="text-3xl font-bold mb-1">89%</div>
                    <p className="text-gray-400 text-sm">Platform Uptime</p>
                </div>
            </div>

            {/* Placeholder for charts */}
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 h-96 flex items-center justify-center text-gray-500">
                Analytics Chart Placeholder (Requires Chart.js integration)
            </div>
        </div>
    );
}
