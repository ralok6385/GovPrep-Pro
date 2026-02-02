"use client";

import { UserPlus, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';

export default function ActivityFeed() {
    const activities = [
        { id: 1, user: 'Rahul Kumar', action: 'registered for', target: 'SSC CGL', time: '2 mins ago', icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-100' },
        { id: 2, user: 'System', action: 'generated daily report', target: 'Analytics', time: '1 hour ago', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-100' },
        { id: 3, user: 'Priya Singh', action: 'completed test', target: 'Mock Test 4', time: '3 hours ago', icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-100' },
        { id: 4, user: 'Alert', action: 'server load high', target: 'CPU > 80%', time: '5 hours ago', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100' },
    ];

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Activity</h3>
            <div className="space-y-6">
                {activities.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                        <div key={activity.id} className="flex gap-4">
                            <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full ${activity.bg} flex items-center justify-center`}>
                                <Icon className={`w-4 h-4 ${activity.color}`} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-700">
                                    <span className="font-semibold text-slate-900">{activity.user}</span> {activity.action} <span className="font-medium text-slate-600">{activity.target}</span>
                                </p>
                                <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <button className="w-full mt-6 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors">
                View All History
            </button>
        </div>
    );
}
