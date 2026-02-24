"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { Menu, X, ChevronLeft, ChevronRight, Info, Languages, Shield, Bookmark, BookmarkCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDuration } from '@/utils/format';
import { Question, Test } from '@/types';

// NTA Color Codes
const PALETTE = {
    NOT_VISITED: 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200 transition-colors', // Light Grey
    NOT_ANSWERED: 'bg-rose-500 text-white border-rose-600 shadow-sm shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95',        // Rose Red
    ANSWERED: 'bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95',         // Emerald Green
    MARKED: 'bg-violet-600 text-white border-violet-700 shadow-sm shadow-violet-500/20 hover:bg-violet-700 transition-all active:scale-95',         // Violet Purple
    MARKED_ANSWERED: 'bg-violet-600 text-white border-violet-700 relative shadow-sm shadow-violet-500/20 hover:bg-violet-700 transition-all active:scale-95' // Violet + Dot
};

export default function LiveTestPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();

    // State
    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);

    // Questions grouped by Section
    const [sections, setSections] = useState<string[]>([]);
    const [questionsBySection, setQuestionsBySection] = useState<{ [key: string]: Question[] }>({});
    const [currentSection, setCurrentSection] = useState<string>('');

    // Global flattened questions for easy index lookup if needed, 
    // but better to track currentQuestionIndex WITHIN currentSection
    const [currentQIndex, setCurrentQIndex] = useState(0);

    // Responses state
    const [answers, setAnswers] = useState<{ [key: string]: number }>({});
    const [markedReview, setMarkedReview] = useState<{ [key: string]: boolean }>({});
    const [visited, setVisited] = useState<{ [key: string]: boolean }>({});
    const [bookmarkedQuestions, setBookmarkedQuestions] = useState<{ [key: string]: boolean }>({});

    const [timeLeft, setTimeLeft] = useState(0);
    const [isdrawerOpen, setDrawerOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [language, setLanguage] = useState<'en' | 'hi'>('hi'); // Default to Hindi as per request
    const [warningCount, setWarningCount] = useState(0);
    const [isFocused, setIsFocused] = useState(true);

    // Anti-Cheating: Detect Tab/Window Switch & Fullscreen Exit
    useEffect(() => {
        // Only apply anti-cheating for Full Mock Exams (not quizzes)
        if (!test || test.type === 'quiz') return;

        const handleViolation = (type: string) => {
            setWarningCount(prev => {
                const newCount = prev + 1;
                // Only toast if not already at limit (limit handled by useEffect)
                if (newCount < 3) {
                    toast.error(`Warning ${newCount}/2: ${type === 'visibility' ? 'Please do not switch tabs.' : (type === 'focus loss' ? 'Please stay on this window.' : 'Please stay in Fullscreen.')} Your activity is being monitored.`, {
                        duration: 6000,
                        icon: '⚠️',
                        style: { border: '2px solid #ef4444', padding: '16px', color: '#b91c1c', fontWeight: 'bold' }
                    });
                }
                return newCount;
            });
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                handleViolation('visibility');
            }
        };

        const handleBlur = () => {
            setIsFocused(false);
            handleViolation('focus loss');
        };

        const handleFocus = () => {
            setIsFocused(true);
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && !submitting) {
                handleViolation('fullscreen');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        // Security: Prevent Right Click, Copy, Paste, etc.
        const preventDefault = (e: any) => e.preventDefault();
        const handleContextMenu = (e: any) => {
            e.preventDefault();
            toast.error("Right-click is disabled during the exam.", { id: 'security-toast' });
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            // Block F12, Ctrl+U, Ctrl+Shift+I, etc.
            if (
                e.key === 'F12' ||
                ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'c' || e.key === 'v' || e.key === 'i' || e.key === 'j' || e.key === 's'))
            ) {
                e.preventDefault();
                toast.error("Keyboard shortcuts are restricted.", { id: 'keyboard-toast' });
            }
        };

        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('copy', preventDefault);
        window.addEventListener('paste', preventDefault);
        window.addEventListener('cut', preventDefault);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('copy', preventDefault);
            window.removeEventListener('paste', preventDefault);
            window.removeEventListener('cut', preventDefault);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [test, submitting]);

    const enterFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
                toast.error("Fullscreen failed! Please enable it to continue.");
            });
        }
    };

    // Handle Auto-Submission on 3 violations
    useEffect(() => {
        if (warningCount >= 3 && !submitting) {
            toast.error('Multiple violations detected. Auto-submitting the test.', {
                duration: 5000,
                icon: '🚫'
            });
            confirmSubmit(true, warningCount);
        }
    }, [warningCount, submitting]);

    // Fetch Test
    useEffect(() => {
        const loadTest = async () => {
            try {
                const { data } = await api.get(`/tests/${params.id}`);
                setTest(data);

                // Fetch full questions
                if (data.questions && data.questions.length > 0) {
                    let fetchedQuestions = [];
                    if (typeof data.questions[0] === 'string') {
                        // FIX: Use batch fetch to avoid 500 errors from too many parallel requests
                        const { data: batchQuestions } = await api.post('/questions/batch', {
                            ids: data.questions
                        });
                        fetchedQuestions = batchQuestions;

                        if (!fetchedQuestions || fetchedQuestions.length === 0) {
                            throw new Error("Failed to load any questions. Please check your connection.");
                        }
                    } else {
                        fetchedQuestions = data.questions;
                    }

                    // Group by Subject
                    const grouped: { [key: string]: Question[] } = {};
                    fetchedQuestions.forEach((q: Question) => {
                        const subName = (q.subjectId as any)?.name || 'General';
                        if (!grouped[subName]) grouped[subName] = [];
                        grouped[subName].push(q);
                    });

                    const sectionKeys = Object.keys(grouped);
                    setSections(sectionKeys);
                    setQuestionsBySection(grouped);
                    if (sectionKeys.length > 0) setCurrentSection(sectionKeys[0]);

                    // Initialize first question as visited
                    if (sectionKeys.length > 0 && grouped[sectionKeys[0]].length > 0) {
                        const firstQId = grouped[sectionKeys[0]][0]._id;
                        setVisited(prev => ({ ...prev, [firstQId]: true }));
                    }

                    // Fetch bookmarks for this test
                    try {
                        const allQIds = fetchedQuestions.map((q: any) => q._id);
                        const { data: bData } = await api.post('/bookmarks/check', { questionIds: allQIds });
                        if (bData && bData.bookmarkedIds) {
                            const bMap: any = {};
                            bData.bookmarkedIds.forEach((id: string) => { bMap[id] = true; });
                            setBookmarkedQuestions(bMap);
                        }
                    } catch (e) {
                        console.error('Failed to load bookmarks', e);
                    }

                    // RESTORE STATE FROM LOCALSTORAGE
                    const savedStateKey = `live_test_${params.id}_${user?._id}`;
                    const savedState = localStorage.getItem(savedStateKey);
                    if (savedState) {
                        const parsed = JSON.parse(savedState);
                        if (parsed.answers) setAnswers(parsed.answers);
                        if (parsed.markedReview) setMarkedReview(parsed.markedReview);
                        if (parsed.visited) setVisited(parsed.visited);
                        if (parsed.warningCount) setWarningCount(parsed.warningCount);

                        // Calculate recovered jump
                        if (parsed.startTime) {
                            const now = Date.now();
                            const elapsedSeconds = Math.floor((now - parsed.startTime) / 1000);
                            const newTimeLeft = Math.max(0, (data.durationMinutes || 90) * 60 - elapsedSeconds);
                            setTimeLeft(newTimeLeft);
                            setTestStartTime(parsed.startTime);
                        }
                    } else {
                        // NEW TEST SESSION
                        const startTime = Date.now();
                        setTestStartTime(startTime);
                        localStorage.setItem(savedStateKey, JSON.stringify({
                            startTime,
                            answers: {},
                            markedReview: {},
                            visited: { [grouped[sectionKeys[0]][0]._id]: true },
                            warningCount: 0
                        }));
                    }
                }

                if (!timeLeft) setTimeLeft((data.durationMinutes || 90) * 60);

            } catch (error) {
                console.error('Failed', error);
                toast.error('Failed to load test');
            } finally {
                setLoading(false);
            }
        };
        loadTest();
    }, [params.id]);

    // State for absolute timer sync
    const [testStartTime, setTestStartTime] = useState<number | null>(null);

    // Persist answers to localStorage every time they change
    useEffect(() => {
        if (!loading && test && user && testStartTime) {
            const state = {
                startTime: testStartTime,
                answers,
                markedReview,
                visited,
                warningCount
            };
            localStorage.setItem(`live_test_${params.id}_${user?._id}`, JSON.stringify(state));
        }
    }, [answers, markedReview, visited, test, user, loading, testStartTime, params.id]);

    // Absolute Timer Update (Sync every second with actual clock)
    useEffect(() => {
        if (!loading && timeLeft > 0 && testStartTime) {
            const timer = setInterval(() => {
                const now = Date.now();
                const elapsedSeconds = Math.floor((now - testStartTime) / 1000);
                const totalSeconds = (test?.durationMinutes || 90) * 60;
                const remaining = Math.max(0, totalSeconds - elapsedSeconds);

                setTimeLeft(remaining);

                if (remaining === 0) {
                    clearInterval(timer);
                    autoSubmit();
                }
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [loading, testStartTime, test?.durationMinutes]);

    const autoSubmit = () => {
        toast('Time is up! Submitting your test...', { icon: '⏰' });
        confirmSubmit(false, warningCount); // Normal end-of-time submission
    };

    const formatTime = formatDuration;

    // Navigation Logic
    const currentQuestionsList = questionsBySection[currentSection] || [];
    const currentQ = currentQuestionsList[currentQIndex];

    const handleQuestionJump = (idx: number) => {
        setCurrentQIndex(idx);
        if (currentQuestionsList[idx]) {
            setVisited(prev => ({ ...prev, [currentQuestionsList[idx]._id]: true }));
        }
        setDrawerOpen(false); // Mobile UX
    };

    const handleNext = () => {
        if (currentQIndex < currentQuestionsList.length - 1) {
            handleQuestionJump(currentQIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentQIndex > 0) {
            handleQuestionJump(currentQIndex - 1);
        }
    };

    const handleSaveAndNext = () => {
        // Just move next, saving is implicit in state
        if (currentQIndex < currentQuestionsList.length - 1) {
            handleQuestionJump(currentQIndex + 1);
        } else {
            // Maybe switch section?
            toast('End of Section', { icon: '🛑' });
        }
    };
    const handleBookmarkToggle = async () => {
        if (!currentQ) return;
        const qId = currentQ._id;
        try {
            const { data } = await api.post('/bookmarks/toggle', { questionId: qId });
            setBookmarkedQuestions(prev => ({
                ...prev,
                [qId]: data.bookmarked
            }));
            toast.success(data.message, { id: 'bookmark-toast' });
        } catch (error) {
            toast.error('Failed to toggle bookmark');
        }
    };
    const handleMarkForReview = () => {
        if (currentQ) {
            setMarkedReview(prev => ({ ...prev, [currentQ._id]: !prev[currentQ._id] }));
            handleNext();
        }
    };

    const handleClearResponse = () => {
        if (currentQ) {
            setAnswers(prev => {
                const newAns = { ...prev };
                delete newAns[currentQ._id];
                return newAns;
            });
        }
    };

    const handleOptionSelect = (qId: string, idx: number) => {
        setAnswers(prev => ({ ...prev, [qId]: idx }));
    };

    const getPaletteStatus = (qId: string) => {
        const isAns = answers[qId] !== undefined;
        const isMarked = markedReview[qId];
        const isVisited = visited[qId];

        if (isAns && isMarked) return PALETTE.MARKED_ANSWERED; // Special Logic often treated as Answered in Railway, but marked purple
        if (isMarked) return PALETTE.MARKED;
        if (isAns) return PALETTE.ANSWERED;
        if (isVisited) return PALETTE.NOT_ANSWERED; // Visited but no answer
        return PALETTE.NOT_VISITED;
    };

    const confirmSubmit = async (isAutoSubmitted = false, finalWarningCount = warningCount) => {
        setSubmitting(true);

        try {
            // Prepare payload for backend
            const responsePayload = {
                responses: Object.keys(answers).map(qId => {
                    const question = Object.values(questionsBySection).flat().find(q => q._id === qId);
                    const ansIndex = answers[qId];
                    const ansChar = String.fromCharCode(65 + ansIndex); // 0='A', 1='B'
                    return {
                        questionId: qId,
                        selectedOption: ansChar,
                        timeTakenSeconds: 60 // Defaulting to 60 for now
                    }
                }),
                tabSwitchWarnings: finalWarningCount,
                isAutoSubmitted: isAutoSubmitted
            };

            const { data } = await api.post(`/tests/${params.id}/submit`, responsePayload);

            // CLEAR CACHE on successful submit
            localStorage.removeItem(`live_test_${params.id}_${user?._id}`);

            // EXIT FULLSCREEN before redirecting
            if (document.fullscreenElement) {
                try {
                    await document.exitFullscreen();
                } catch (e) {
                    console.warn('Could not exit fullscreen:', e);
                }
            }

            // Small delay to let fullscreen exit complete, then redirect
            setTimeout(() => {
                router.replace(`/dashboard/analysis/${data._id}`);
            }, 300);

        } catch (error) {
            console.error(error);
            toast.error('Submission Failed');
            setSubmitting(false);
            setShowSubmitModal(false);
        }
    };

    const getStats = () => {
        let stats = { answered: 0, marked: 0, notAnswered: 0, notVisited: 0 };
        Object.values(questionsBySection).forEach(qs => qs.forEach(q => {
            const isAns = answers[q._id] !== undefined;
            const isMark = markedReview[q._id];
            const isVis = visited[q._id];

            if (isAns) stats.answered++;
            else if (isMark) stats.marked++;
            else if (isVis) stats.notAnswered++;
            else stats.notVisited++;
        }));
        return stats;
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-white font-bold text-indigo-600">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="tracking-widest uppercase text-[10px] animate-pulse">Initializing Secure Environment...</p>
        </div>
    </div>;

    if (!currentQ) return <div className="h-screen flex items-center justify-center">No questions in this section.</div>;

    return (
        <div className="h-screen flex flex-col bg-slate-50 overflow-hidden font-sans select-none" style={{ userSelect: 'none' }}>
            {/* High-Security Premium Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-40 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div className="hidden md:block">
                        <div className="flex items-center gap-2">
                            <h1 className="font-black text-slate-800 text-lg uppercase tracking-tight truncate max-w-md">{test?.title}</h1>
                            {test?.type !== 'quiz' && (
                                <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border border-emerald-100 flex items-center gap-1.5 animate-pulse shadow-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div> AI Proctoring Active
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lalan RailPath</p>
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">
                                ROLL: {user?._id?.slice(-8)?.toUpperCase() || 'N/A'} | SID: {(typeof params.id === 'string' ? params.id : params.id?.[0])?.slice(0, 6) || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 mr-2">
                        <button
                            onClick={() => setLanguage('en')}
                            className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all duration-300 ${language === 'en' ? 'bg-white text-indigo-700 shadow-sm scale-110' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => setLanguage('hi')}
                            className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all duration-300 ${language === 'hi' ? 'bg-white text-indigo-700 shadow-sm scale-110' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            हिन्दी
                        </button>
                    </div>

                    <div className="flex items-center gap-3 px-5 py-2.5 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl border-dashed">
                        <div className="hidden sm:block text-slate-400 font-black text-[9px] uppercase tracking-[0.2em]">Time Left</div>
                        <div className={`text-2xl font-black tabular-nums transition-all ${timeLeft < 300 ? 'text-rose-600 animate-pulse scale-110' : 'text-indigo-950'}`}>
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    <button
                        onClick={() => setShowSubmitModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-emerald-500/30 transition-all hover:scale-[1.05] active:scale-95 ml-2"
                    >
                        Submit Test
                    </button>

                    <button onClick={() => setDrawerOpen(true)} className="lg:hidden p-2.5 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Premium Security Watermark Overlay */}
                {test?.type !== 'quiz' && !loading && user && (
                    <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] dark:opacity-[0.05] flex flex-wrap gap-20 p-20 content-start select-none overflow-hidden h-full w-full">
                        {Array.from({ length: 48 }).map((_, i) => (
                            <div key={i} className="text-xl font-black -rotate-45 whitespace-nowrap tracking-widest uppercase">
                                {user.email} • {user.name} • {(typeof params.id === 'string' ? params.id : params.id?.[0])?.slice(-6)}
                            </div>
                        ))}
                    </div>
                )}

                {/* Left Side: Question Area */}
                <main className="flex-1 flex flex-col overflow-hidden bg-white relative">
                    {/* Section Tabs */}
                    <div className="h-12 bg-white border-b border-slate-200 flex overflow-x-auto no-scrollbar">
                        {sections.map(sec => (
                            <button
                                key={sec}
                                onClick={() => {
                                    setCurrentSection(sec);
                                    setCurrentQIndex(0); // Reset index when switching section
                                }}
                                className={`px-6 h-full flex items-center font-bold text-sm whitespace-nowrap transition-colors border-b-2
                                    ${currentSection === sec
                                        ? 'border-indigo-600 text-indigo-700 bg-indigo-50'
                                        : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                            >
                                {sec}
                                <span className="ml-2 bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                                    {questionsBySection[sec]?.length || 0}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex justify-between items-start mb-6 border-b border-dashed border-slate-200 pb-4">
                                <div>
                                    <h4 className="text-base font-bold text-indigo-900 mb-1">Question {currentQIndex + 1}</h4>
                                    <div className="flex gap-2 text-xs font-bold">
                                        <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">+ {test?.positiveMark || 1} Marks</span>
                                        <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">- {test?.negativeMark || 0.33} Marks</span>
                                    </div>
                                </div>
                                <button onClick={handleMarkForReview} className="text-xs font-bold text-purple-600 hover:text-purple-700 underline">
                                    {markedReview[currentQ._id] ? 'Unmark Review' : 'Mark for Review'}
                                </button>
                            </div>

                            <div className={`text-lg text-slate-800 font-medium leading-loose mb-8 ${language === 'hi' ? 'font-hindi' : ''}`}>
                                {(language === 'hi' && currentQ.textHindi) ? currentQ.textHindi : currentQ.text}
                            </div>



                            <div className="grid gap-3 max-w-2xl">
                                {currentQ.options.map((opt: any, idx: number) => {
                                    const optText = (language === 'hi' && opt.textHindi) ? opt.textHindi : (typeof opt === 'string' ? opt : opt.text);
                                    const isSelected = answers[currentQ._id] === idx;
                                    return (
                                        <label
                                            key={idx}
                                            className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                                                ${isSelected ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}
                                            `}
                                        >
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
                                                ${isSelected ? 'border-indigo-600' : 'border-slate-400'}`}>
                                                {isSelected && <div className="w-3 h-3 bg-indigo-600 rounded-full" />}
                                            </div>
                                            <div className="text-slate-700 font-medium">{optText}</div>
                                            <input
                                                type="radio"
                                                name={`q-${currentQ._id}`}
                                                className="hidden"
                                                checked={isSelected}
                                                onChange={() => handleOptionSelect(currentQ._id, idx)}
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="h-16 border-t border-slate-200 bg-slate-50 px-6 flex items-center justify-between shrink-0">
                        <div className="flex gap-2">
                            <button
                                onClick={handleMarkForReview}
                                className="flex items-center px-3 md:px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded hover:bg-slate-100 text-sm gap-2"
                                title="Mark for Review"
                            >
                                <div className={`w-3 h-3 rounded-full border-2 ${markedReview[currentQ._id] ? 'bg-purple-600 border-purple-600' : 'border-slate-400'}`}></div>
                                <span className="hidden md:inline">{markedReview[currentQ._id] ? 'Unmark' : 'Review'}</span>
                            </button>
                            <button
                                onClick={handleBookmarkToggle}
                                className={`flex items-center px-3 md:px-4 py-2 bg-white border font-bold rounded hover:bg-slate-100 text-sm gap-2 transition-colors ${bookmarkedQuestions[currentQ._id] ? 'border-amber-500 text-amber-600 bg-amber-50 hover:bg-amber-100' : 'border-slate-300 text-slate-700'}`}
                                title="Bookmark for Revision"
                            >
                                {bookmarkedQuestions[currentQ._id] ? (
                                    <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-500" />
                                ) : (
                                    <Bookmark className="w-4 h-4" />
                                )}
                                <span className="hidden md:inline">{bookmarkedQuestions[currentQ._id] ? 'Saved' : 'Save'}</span>
                            </button>
                            <button
                                onClick={handleClearResponse}
                                className="px-3 md:px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded hover:bg-slate-100 text-sm"
                                title="Clear Response"
                            >
                                <span className="hidden md:inline">Clear</span>
                                <span className="md:hidden">✕</span>
                            </button>
                        </div>

                        <button
                            onClick={handlePrev}
                            disabled={currentQIndex === 0}
                            className="px-5 py-2 bg-slate-200 text-slate-600 font-bold rounded hover:bg-slate-300 disabled:opacity-50 text-sm flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden md:inline">Previous</span>
                        </button>
                        <button
                            onClick={handleSaveAndNext}
                            className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 shadow text-sm flex items-center gap-2"
                        >
                            <span className="hidden md:inline">Save & Next</span>
                            <span className="md:hidden">Next</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </main>

                {/* Right Side: Palette (Desktop & Mobile Drawer) */}
                <aside className={`w-80 bg-white border-l border-slate-200 flex flex-col fixed inset-y-0 right-0 z-40 transform transition-transform lg:relative lg:translate-x-0 ${isdrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    {/* Palette Header */}
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                        <div className="flex items-center gap-3">
                            <img src="/images/lalan_logo.png" alt="Lalan" className="w-10 h-auto opacity-90 brightness-0 grayscale invert" />
                            <h3 className="font-bold text-slate-800">Question Palette</h3>
                        </div>
                        <button onClick={() => setDrawerOpen(false)} className="lg:hidden"><X className="w-5 h-5" /></button>
                    </div>

                    {/* User Info (Real-time) */}
                    <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full overflow-hidden border border-indigo-200">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}${user.avatar}`}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-sm text-slate-800">{user?.name || 'Candidate'}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Exam: {test?.title || 'Mock Test'}</p>
                        </div>
                    </div>

                    {/* Legend */}
                    {(() => {
                        const stats = getStats();
                        const total = stats.answered + stats.notAnswered + stats.marked + stats.notVisited;
                        return (
                            <div className="p-5 border-b border-slate-200 bg-slate-50/40">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions Summary</h4>
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">Total: {total}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                    <div className="flex items-center gap-3 group">
                                        <div className="w-8 h-8 bg-emerald-500 text-white flex items-center justify-center rounded-lg shadow-sm shadow-emerald-500/20 text-xs font-black transition-transform group-hover:scale-110">{stats.answered}</div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight leading-none">Answered</span>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase">Selected</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 group">
                                        <div className="w-8 h-8 bg-rose-500 text-white flex items-center justify-center rounded-lg shadow-sm shadow-rose-500/20 text-xs font-black transition-transform group-hover:scale-110">{stats.notAnswered}</div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight leading-none">Not Answered</span>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase">Visited</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 group">
                                        <div className="w-8 h-8 bg-slate-200 text-slate-600 border border-slate-300 flex items-center justify-center rounded-lg shadow-sm text-xs font-black transition-transform group-hover:scale-110">{stats.notVisited}</div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight leading-none">Not Visited</span>
                                            <span className="text-[8px] font-bold text-slate-300 uppercase">Untouched</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 group">
                                        <div className="w-8 h-8 bg-violet-600 text-white flex items-center justify-center rounded-lg shadow-sm shadow-violet-500/20 text-xs font-black transition-transform group-hover:scale-110">{stats.marked}</div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight leading-none">For Review</span>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase">Marked</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Grid */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <h4 className="font-bold text-xs text-slate-500 uppercase mb-3">{currentSection}</h4>
                        <div className="grid grid-cols-4 gap-2">
                            {currentQuestionsList.map((q, i) => {
                                const status = getPaletteStatus(q._id);
                                return (
                                    <button
                                        key={q._id}
                                        onClick={() => handleQuestionJump(i)}
                                        className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-sm font-black border transition-all ${status} ${currentQIndex === i ? 'ring-2 ring-indigo-600 ring-offset-2 scale-110 z-10' : 'hover:scale-105'}`}
                                    >
                                        {i + 1}
                                        {/* Optional Green Dot if Marked & Answered */}
                                        {status === PALETTE.MARKED_ANSWERED && <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-violet-600 shadow-sm"></div>}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </aside>
            </div>

            {/* Modal & Overlays Section */}
            <>
                <div>
                    {showSubmitModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-6 border-b border-slate-100 text-center">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Info className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">Submit Test?</h3>
                                    <p className="text-slate-500 text-sm mt-1">You generally cannot modify answers after submission.</p>
                                </div>

                                <div className="p-6 grid grid-cols-2 gap-4">
                                    {(() => {
                                        const stats = getStats();
                                        return (
                                            <>
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                                    <div className="text-2xl font-bold text-emerald-600">{stats.answered}</div>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Answered</div>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                                    <div className="text-2xl font-bold text-red-500">{stats.notAnswered}</div>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Not Answered</div>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                                    <div className="text-2xl font-bold text-purple-600">{stats.marked}</div>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Review</div>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                                    <div className="text-2xl font-bold text-slate-400">{stats.notVisited}</div>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Not Visited</div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                                    <button
                                        onClick={() => setShowSubmitModal(false)}
                                        className="flex-1 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => confirmSubmit()}
                                        className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98]"
                                    >
                                        Submit Test
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Fullscreen & Focus Requirement Overlay */}
                    {test?.type !== 'quiz' && !loading && typeof document !== 'undefined' && (!document.fullscreenElement || !isFocused) && !submitting && !showSubmitModal && (
                        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-6 text-center">
                            <div className="max-w-md bg-white p-8 rounded-[2rem] shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
                                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
                                    <Shield className="w-10 h-10 text-indigo-600 animate-pulse" />
                                </div>
                                <h2 className="text-2xl font-black text-indigo-950">Security Check Required</h2>
                                <p className="text-slate-600 font-medium">
                                    {!document.fullscreenElement
                                        ? "This proctored exam must be taken in Fullscreen Mode to ensure a fair environment."
                                        : "The test window has lost focus. Please click below to resume."}
                                </p>
                                <div className="space-y-3 pt-2">
                                    <button
                                        onClick={enterFullscreen}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
                                    >
                                        {!document.fullscreenElement ? "Enter Fullscreen & Begin" : "Resume Test"}
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        Switching apps or exiting Fullscreen is recorded as a violation
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </>
        </div>
    );
}
