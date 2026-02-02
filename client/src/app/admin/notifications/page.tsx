"use client";

import { useState } from 'react';
import api from '@/lib/api';
import { Send, Users, UserX, UserCheck, Bell, MessageSquare, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function NotificationPage() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [audience, setAudience] = useState('all'); // all, inactive
    const [loading, setLoading] = useState(false);
    const [sentHistory, setSentHistory] = useState<any[]>([]);

    const [type, setType] = useState('info'); // info, warning, success

    const handleSend = async () => {
        if (!title || !message) return toast.error("Please enter title and message");

        setLoading(true);
        try {
            const { data } = await api.post('/notifications/send', {
                title,
                message,
                audience,
                type
            });
            toast.success(`Broadcasting to ${data.count} users!`);
            setSentHistory([{ title, message, audience, type, time: new Date(), count: data.count }, ...sentHistory]);
            setTitle('');
            setMessage('');
        } catch (error) {
            console.error(error);
            toast.error("Failed to send");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header... */}
                <div>
                    <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                        <Bell className="w-8 h-8 text-indigo-500" /> Notification Center
                    </h1>
                    <p className="text-slate-400">Broadcast messages to your student base instantly.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Compose Box */}
                    <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-emerald-400" /> Compose Message
                        </h2>

                        <div className="space-y-6">
                            {/* Audience Selector */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Audience</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setAudience('all')}
                                        className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${audience === 'all' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}
                                    >
                                        <div className={`p-2 rounded-lg ${audience === 'all' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold">All Students</p>
                                            <p className="text-xs text-slate-500">Everyone registered</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setAudience('inactive')}
                                        className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${audience === 'inactive' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}
                                    >
                                        <div className={`p-2 rounded-lg ${audience === 'inactive' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                            <UserX className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold">Inactive Users</p>
                                            <p className="text-xs text-slate-500">Inactive &gt; 7 Days</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Type Selector */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Notification Style</label>
                                <div className="flex gap-3">
                                    {[
                                        { id: 'info', label: 'Info', color: 'bg-indigo-500' },
                                        { id: 'warning', label: 'Urgent', color: 'bg-amber-500' },
                                        { id: 'success', label: 'Success', color: 'bg-emerald-500' }
                                    ].map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setType(t.id)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-2 ${type === t.id ? `border-${t.color.split('-')[1]}-500 ${t.color} text-white` : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'}`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${type === t.id ? 'bg-white' : t.color}`}></div>
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Inputs */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Message Details</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Subject / Title"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4 text-white focus:outline-none focus:border-indigo-500 font-bold"
                                />
                                <textarea
                                    rows={5}
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Write your message here..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <button
                                onClick={handleSend}
                                disabled={loading}
                                className={`w-full text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${type === 'warning' ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20' : type === 'success' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'}`}
                            >
                                {loading ? 'Sending...' : <><Send className="w-5 h-5" /> Send Broadcast</>}
                            </button>
                        </div>
                    </div>

                    {/* History Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-6">
                            <h3 className="font-bold text-slate-400 mb-4 text-sm uppercase tracking-wider">Recent Broadcasts</h3>
                            <div className="space-y-4">
                                {sentHistory.length === 0 && <p className="text-slate-600 text-sm italic">No recent broadcasts.</p>}
                                {sentHistory.map((h, i) => (
                                    <div key={i} className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-white text-sm">{h.title}</span>
                                            <span className="text-xs text-slate-500">{h.time.toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 truncate mb-3">{h.message}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Sent to {h.count}
                                            </span>
                                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase">
                                                {h.audience}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
