"use client";

import { useState } from 'react';
import api from '@/lib/api';
import { Send, Users, UserX, Bell, MessageSquare, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function NotificationPage() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [audience, setAudience] = useState('all');
    const [loading, setLoading] = useState(false);
    const [sentHistory, setSentHistory] = useState<any[]>([]);
    const [type, setType] = useState('info');

    const handleSend = async () => {
        if (!title || !message) return toast.error("Please enter notification title and message");

        setLoading(true);
        try {
            const { data } = await api.post('/notifications/send', {
                title,
                message,
                audience,
                type
            });
            toast.success(`Broadcasted alert to ${data.count || 'all active'} aspirants!`);
            setSentHistory([{ title, message, audience, type, time: new Date(), count: data.count || 0 }, ...sentHistory]);
            setTitle('');
            setMessage('');
        } catch (error) {
            console.error(error);
            toast.error("Failed to broadcast notification");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Broadcast Notification Center
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Send instant push notifications and dashboard announcements to students.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Compose Box */}
                <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <MessageSquare className="w-4 h-4 text-emerald-500" /> Compose Broadcast Alert
                    </h2>

                    {/* Target Audience */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Target Aspirant Audience</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setAudience('all')}
                                className={`p-3 rounded-xl border transition-all text-left flex items-center gap-3 ${
                                    audience === 'all'
                                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                                }`}
                            >
                                <Users className="w-4 h-4 shrink-0" />
                                <div>
                                    <p className="font-bold text-xs">All Registered Students</p>
                                    <p className="text-[10px] opacity-75">Entire aspirant base</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setAudience('inactive')}
                                className={`p-3 rounded-xl border transition-all text-left flex items-center gap-3 ${
                                    audience === 'inactive'
                                        ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                                }`}
                            >
                                <UserX className="w-4 h-4 shrink-0" />
                                <div>
                                    <p className="font-bold text-xs">Inactive Students</p>
                                    <p className="text-[10px] opacity-75">Inactive &gt; 7 Days</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Notification Style */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Alert Importance</label>
                        <div className="flex gap-2">
                            {[
                                { id: 'info', label: 'Standard Announcement' },
                                { id: 'warning', label: 'Urgent Exam Alert' },
                                { id: 'success', label: 'Result Release' }
                            ].map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setType(t.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                        type === t.id
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input Fields */}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                            <input
                                type="text"
                                placeholder="e.g. RRB NTPC CBT-1 All-India Mock 12 is Live!"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Message Content</label>
                            <textarea
                                rows={4}
                                placeholder="Write your broadcast notification details..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                        {loading ? 'Broadcasting Alert...' : 'Send Broadcast Notification'}
                    </button>
                </div>

                {/* History Log */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                            Broadcast History
                        </h3>

                        {sentHistory.length === 0 ? (
                            <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-8">No notifications broadcasted in this session.</p>
                        ) : (
                            <div className="space-y-3">
                                {sentHistory.map((h, i) => (
                                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{h.title}</span>
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                        </div>
                                        <p className="text-[10px] text-slate-500 line-clamp-2">{h.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
