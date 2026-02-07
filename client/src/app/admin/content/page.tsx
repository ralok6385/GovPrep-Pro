"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, PlayCircle, FileText, Image as ImageIcon, Trash2, ExternalLink, Download } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ContentLibrary() {
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'video', 'pdf', 'image'
    const [content, setContent] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Delete State
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchContent();
    }, [activeTab]);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'all' ? '/content' : `/content?type=${activeTab}`;
            const { data } = await api.get(endpoint);
            setContent(data);
        } catch (error) {
            console.error('Failed to fetch content', error);
            toast.error('Failed to load content library');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setItemToDelete(id);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            await api.delete(`/content/${itemToDelete}`);
            toast.success('Content deleted successfully');
            setContent(content.filter(item => item._id !== itemToDelete));
            setItemToDelete(null);
        } catch (error) {
            console.error('Failed to delete content', error);
            toast.error('Failed to delete content');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <PlayCircle className="w-10 h-10 text-red-500" />;
            case 'pdf': return <FileText className="w-10 h-10 text-blue-500" />;
            case 'image': return <ImageIcon className="w-10 h-10 text-emerald-500" />;
            default: return <FileText className="w-10 h-10 text-slate-400" />;
        }
    };

    const getThumbnail = (item: any) => {
        if (item.type === 'video') {
            const getYouTubeId = (url: string) => {
                if (!url) return null;
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                const match = url.match(regExp);
                return (match && match[2].length === 11) ? match[2] : null;
            };
            const ytId = getYouTubeId(item.url);
            return ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
        }
        if (item.type === 'image') {
            return item.url.startsWith('http') ? item.url : `${process.env.NEXT_PUBLIC_API_URL}${item.url}`;
        }
        return null; // PDF or no thumbnail
    };

    const filteredContent = content.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subjectId?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Content Library</h1>
                    <p className="text-slate-500 mt-1">Manage videos, notes, and study materials.</p>
                </div>
                <Link href="/admin/content/add" className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all">
                    <Plus className="w-5 h-5" /> Upload Content
                </Link>
            </div>

            {/* Controls */}
            <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 justify-between">
                {/* Tabs */}
                <div className="flex p-1 bg-slate-100 rounded-xl">
                    {['all', 'video', 'pdf', 'image'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${activeTab === tab
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab === 'pdf' ? 'PDFs' : tab + 's'}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search title, subject..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500">Loading library...</div>
            ) : filteredContent.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">No content found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredContent.map((item) => {
                        const thumbnail = getThumbnail(item);
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
                        const fullUrl = item.url.startsWith('http') ? item.url : `${apiUrl}${item.url}`;

                        return (
                            <div key={item._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col">
                                {/* Preview Area */}
                                <div className="h-40 bg-slate-50 relative flex items-center justify-center overflow-hidden border-b border-slate-50">
                                    {thumbnail ? (
                                        <img src={thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="group-hover:scale-110 transition-transform duration-300">
                                            {getIcon(item.type)}
                                        </div>
                                    )}

                                    {/* Type Badge */}
                                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white/90 backdrop-blur-sm shadow-sm
                                        ${item.type === 'video' ? 'text-red-500' : item.type === 'pdf' ? 'text-blue-500' : 'text-emerald-500'}
                                    `}>
                                        {item.type}
                                    </span>

                                    {/* Actions Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                        <a
                                            href={fullUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-white text-slate-800 rounded-full hover:scale-110 transition-transform"
                                            title="View / Download"
                                        >
                                            {item.type === 'video' ? <PlayCircle className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                                        </a>
                                        <button
                                            onClick={(e) => handleDelete(e, item._id)}
                                            className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform hover:bg-red-600"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-800 mb-1 line-clamp-2 leading-snug" title={item.title}>
                                            {item.title}
                                        </h3>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                                            {item.subjectId?.name || 'Uncategorized'}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="px-2 py-1 bg-slate-50 rounded-md text-[10px] font-bold text-slate-500">
                                            {item.topicName || 'General'}
                                        </div>
                                        {item.isPremium && (
                                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                                                ★ Premium
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {itemToDelete && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in search-confirm">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl scale-100 transform transition-all">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Delete Content?</h3>
                        <p className="text-slate-500 text-center text-sm mb-6">
                            Are you sure you want to remove this item? If it's a file, it will be deleted from the server.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setItemToDelete(null)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
