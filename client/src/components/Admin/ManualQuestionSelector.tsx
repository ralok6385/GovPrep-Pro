
"use client";

import { useState, useEffect } from 'react';
import { X, Search, CheckSquare, Square, Filter, Loader2, Clock } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface ManualQuestionSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onQuestionsSelected: (questions: any[]) => void;
    alreadySelectedIds: string[];
}

export default function ManualQuestionSelector({ isOpen, onClose, onQuestionsSelected, alreadySelectedIds }: ManualQuestionSelectorProps) {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchQuestions();
            setSelectedIds([]); // Reset local selection on open, or maybe keep? Let's reset for now to avoid confusion.
        }
    }, [isOpen]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/questions?limit=200');
            setQuestions(Array.isArray(data) ? data : data.questions || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    const isNew = (date: string) => {
        const added = new Date(date).getTime();
        const now = new Date().getTime();
        return (now - added) < (24 * 60 * 60 * 1000); // 24 hours
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleConfirm = () => {
        const selectedDocs = questions.filter(q => selectedIds.includes(q._id));
        onQuestionsSelected(selectedDocs);
        onClose();
    };

    const filteredQuestions = questions.filter(q =>
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.subjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <CheckSquare className="w-5 h-5 text-emerald-400" />
                                Browse Question Bank
                            </h2>
                            {questions.filter(q => isNew(q.createdAt)).length > 0 && (
                                <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
                                    {questions.filter(q => isNew(q.createdAt)).length} NEW TODAY
                                </span>
                            )}
                        </div>
                        <p className="text-slate-400 text-sm">Select questions from your global library.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b border-slate-800 flex gap-4 bg-slate-900/30">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by question text or subject..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-950/20">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            Loading Library...
                        </div>
                    ) : filteredQuestions.length === 0 ? (
                        <div className="text-center py-20 text-slate-500 font-medium">
                            No matching questions found.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredQuestions.map(q => {
                                const isSelected = selectedIds.includes(q._id) || alreadySelectedIds.includes(q._id);
                                const isAlreadyAdded = alreadySelectedIds.includes(q._id);
                                const freshlyAdded = isNew(q.createdAt);

                                return (
                                    <div
                                        key={q._id}
                                        className={`p-4 rounded-2xl border flex gap-4 transition-all cursor-pointer group relative overflow-hidden
                                            ${isSelected
                                                ? 'bg-emerald-500/10 border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                                                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'}`}
                                        onClick={() => !isAlreadyAdded && toggleSelection(q._id)}
                                    >
                                        <div className={`mt-1 shrink-0 ${isAlreadyAdded ? 'opacity-50' : ''}`}>
                                            {isSelected ? (
                                                <div className="w-5 h-5 rounded-lg bg-emerald-500 flex items-center justify-center">
                                                    <CheckSquare className={`w-4 h-4 text-white`} />
                                                </div>
                                            ) : (
                                                <div className="w-5 h-5 rounded-lg border-2 border-slate-700 group-hover:border-slate-500 transition-colors" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start gap-2 mb-1.5">
                                                {freshlyAdded && (
                                                    <span className="shrink-0 bg-indigo-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md mt-0.5 animate-pulse">NEW</span>
                                                )}
                                                <p className="text-slate-200 font-bold text-sm leading-snug">{q.text}</p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                                                        {q.subjectId?.name || 'Uncategorized'}
                                                    </span>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border
                                                        ${q.difficulty === 'hard' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                            q.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                                        {q.difficulty}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                                                </div>

                                                {isAlreadyAdded && (
                                                    <span className="text-[10px] font-black text-amber-500/70 uppercase tracking-widest bg-amber-500/5 px-2 py-0.5 rounded-full border border-amber-500/10 ml-auto">Already added</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-900 rounded-b-2xl">
                    <span className="text-sm text-slate-400">
                        {selectedIds.length} questions selected
                    </span>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-300 font-bold hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={selectedIds.length === 0}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <CheckSquare className="w-4 h-4" />
                            Add Selected
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
