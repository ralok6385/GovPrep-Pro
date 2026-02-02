"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, PlayCircle, Lock, Download, Image as ImageIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SubjectContentPage() {
    const params = useParams(); // { id: subjectId }
    const router = useRouter();
    const [content, setContent] = useState<any[]>([]);
    const [subjectName, setSubjectName] = useState('');
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'video', 'pdf'

    useEffect(() => {
        if (params.id) {
            fetchContent();
        }
    }, [params.id, filter]);

    const fetchContent = async () => {
        try {
            setLoading(true);
            // Get content for subject
            const { data } = await api.get(`/content?subjectId=${params.id}&type=${filter}`);
            setContent(data);

            // Get subject details (Hack: usually done via separate call or passed state, but this works)
            if (data.length > 0 && data[0].subjectId) {
                setSubjectName(data[0].subjectId.name);
            }
        } catch (error) {
            console.error('Failed to load content', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        if (type === 'video') return PlayCircle;
        if (type === 'image') return ImageIcon;
        return FileText;
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <header className="bg-white sticky top-0 z-40 border-b border-slate-100 shadow-sm">
                <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
                    <Link href="/dashboard/study" className="p-1 hover:bg-slate-100 rounded-full">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="font-bold text-lg text-slate-800">{subjectName || 'Subject Content'}</h1>
                        <p className="text-xs text-slate-500">{content.length} Resources Available</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="px-4 pb-2 max-w-md mx-auto flex gap-2 overflow-x-auto no-scrollbar">
                    {['all', 'video', 'pdf', 'image'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-colors
                                ${filter === t
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            {t === 'all' ? 'All Content' : t + 's'}
                        </button>
                    ))}
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6 space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-slate-400">Loading resources...</div>
                ) : content.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-400">No content found for this filter.</p>
                    </div>
                ) : (
                    content.map((item) => {
                        const Icon = getIcon(item.type);
                        return (
                            <div key={item._id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase
                                        ${item.type === 'video' ? 'bg-red-50 text-red-600' :
                                            item.type === 'pdf' ? 'bg-blue-50 text-blue-600' :
                                                'bg-emerald-50 text-emerald-600'}`}>
                                        {item.type}
                                    </span>
                                    {item.isPremium && <Lock className="w-3 h-3 text-amber-500" />}
                                </div>

                                <div className="flex gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0
                                        ${item.type === 'video' ? 'bg-red-50 text-red-500' :
                                            item.type === 'pdf' ? 'bg-blue-50 text-blue-500' :
                                                'bg-emerald-50 text-emerald-500'}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug mb-1">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-slate-400 mb-3">{item.topicName}</p>

                                        <div className="flex gap-2">
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors
                                                ${item.type === 'video' ? 'bg-red-600 text-white hover:bg-red-700' :
                                                        'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                            >
                                                {item.type === 'video' ? 'Watch Now' : item.type === 'pdf' ? 'Read Note' : 'View Image'}
                                                {item.type !== 'video' && <ArrowRight className="w-3 h-3" />}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </main>
        </div>
    );
}
