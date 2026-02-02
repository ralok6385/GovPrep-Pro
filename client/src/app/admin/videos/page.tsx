"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, PlayCircle, Clock, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function VideoLibrary() {
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<any>(null);
    const [videoToDelete, setVideoToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const { data } = await api.get('/content?type=video');

            // Transform API data to UI format
            const formattedVideos = data.map((item: any) => {
                const getYouTubeId = (url: string) => {
                    if (!url) return null;
                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                    const match = url.match(regExp);
                    return (match && match[2].length === 11) ? match[2] : null;
                };

                const ytId = getYouTubeId(item.url);

                return {
                    id: item._id,
                    title: item.title,
                    subject: item.subjectId?.name || 'General',
                    exam: 'All Exams',
                    duration: '20m',
                    views: Math.floor(Math.random() * 500) + 50,
                    date: new Date(item.createdAt).toLocaleDateString(),
                    // Use YouTube thumbnail if available, else random
                    thumbnail: ytId
                        ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                        : `https://images.unsplash.com/photo-${['1635070041078-e363dbe005cb', '1589829085413-56de8ae18c73', '1509228468518-180dd4864904', '1504711434969-e33886168f5c'][item._id.charCodeAt(item._id.length - 1) % 4]}?w=800&q=80`,
                    videoUrl: item.url
                };
            });

            setVideos(formattedVideos);
        } catch (error) {
            console.error('Failed to fetch videos', error);
            toast.error('Failed to load videos library');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setVideoToDelete(id);
    };

    const confirmDelete = async () => {
        if (!videoToDelete) return;

        try {
            await api.delete(`/content/${videoToDelete}`);
            toast.success('Video deleted successfully');
            setVideos(videos.filter(v => v.id !== videoToDelete));
            setVideoToDelete(null);
        } catch (error) {
            console.error('Failed to delete video', error);
            toast.error('Failed to delete video');
        }
    };

    if (loading) {
        return <div className="p-12 text-center text-slate-500">Loading library...</div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Video Library</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage all your video lectures here.</p>
                </div>
                <Link href="/admin/videos/add" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all">
                    <Plus className="w-5 h-5" /> Upload New Video
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search videos..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium">
                        <Filter className="w-4 h-4" /> Filter by Exam
                    </button>
                    <select className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 outline-none text-sm font-medium bg-white">
                        <option>All Subjects</option>
                        <option>Quant</option>
                        <option>Reasoning</option>
                        <option>English</option>
                        <option>GA/GK</option>
                    </select>
                </div>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                    <div
                        key={video.id}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer"
                        onClick={() => setSelectedVideo(video)}
                    >
                        {/* Thumbnail Area */}
                        <div className="h-40 bg-slate-100 relative group-hover:bg-slate-200 transition-colors flex items-center justify-center overflow-hidden">
                            {video.thumbnail ? (
                                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <PlayCircle className="w-12 h-12 text-indigo-500 opacity-80 group-hover:scale-110 transition-transform" />
                            )}

                            {/* Play Overlay */}
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                            </div>

                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                                {video.duration}
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    {video.subject}
                                </span>
                                <button
                                    onClick={(e) => handleDelete(e, video.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2 leading-snug">
                                {video.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                                <span>{video.exam}</span>
                                <span>•</span>
                                <span>{video.views} views</span>
                            </div>
                            <div className="pt-3 border-t border-slate-50 flex items-center gap-1 text-xs text-slate-400">
                                <Clock className="w-3 h-3" /> Uploaded {video.date}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Video Player Modal */}
            {
                selectedVideo && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedVideo(null)}>
                        <div className="bg-black border border-slate-700 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="aspect-video bg-black relative flex items-center justify-center group">
                                {/* Smart Player: Check if YouTube or Direct */}
                                {(selectedVideo.videoUrl.includes('youtube.com') || selectedVideo.videoUrl.includes('youtu.be')) ? (
                                    <iframe
                                        src={(() => {
                                            let videoId = '';
                                            if (selectedVideo.videoUrl.includes('youtube.com/watch')) {
                                                videoId = new URL(selectedVideo.videoUrl).searchParams.get('v') || '';
                                            } else if (selectedVideo.videoUrl.includes('youtu.be/')) {
                                                videoId = selectedVideo.videoUrl.split('youtu.be/')[1].split('?')[0];
                                            }
                                            return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                                        })()}
                                        title={selectedVideo.title}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <video
                                        src={selectedVideo.videoUrl}
                                        controls
                                        autoPlay
                                        className="w-full h-full object-contain"
                                        poster={selectedVideo.thumbnail}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>
                            <div className="p-6 bg-slate-900 text-white">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold mb-1">{selectedVideo.title}</h2>
                                        <p className="text-slate-400 text-sm">{selectedVideo.exam} • {selectedVideo.subject}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedVideo(null)}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors"
                                    >
                                        Close Player
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            {videoToDelete && (
                <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 transform scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center __text-center">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete Video?</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-6">
                                Are you sure you want to delete this video? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setVideoToDelete(null)}
                                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
