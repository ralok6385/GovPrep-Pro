"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { io, Socket } from 'socket.io-client';
import { Loader2, Swords, Trophy, XCircle, CheckCircle, Zap, Clock } from 'lucide-react';
import BackButton from '@/components/BackButton';

// Types
interface Player {
    id: string; // socket id
    odii: string;
    name: string;
    score: number;
    avatar?: string;
}

interface Question {
    _id: string;
    text: string;
    options: { id: string; text: string }[];
    // correctOption is NEVER sent from server
}

interface AnswerResult {
    questionId: string;
    isCorrect: boolean;
    correctOption: string;
    pointsEarned: number;
}

export default function BattlePage() {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [status, setStatus] = useState<'idle' | 'searching' | 'playing' | 'game_over'>('idle');
    const [roomId, setRoomId] = useState<string | null>(null);

    // Game State
    const [players, setPlayers] = useState<Player[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    // Server-validated answer result
    const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);

    // Derived
    const me = players.find(p => p.odii === user?._id);
    const opponent = players.find(p => p.odii !== user?._id);
    const currentQuestion = questions[currentQIndex];

    useEffect(() => {
        if (!user) return;

        const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

        const newSocket = io(socketUrl, {
            transports: ['websocket'],
            upgrade: false
        });

        newSocket.on('connect', () => { });

        newSocket.on('match_found', (data) => {
            setRoomId(data.roomId);
            setStatus('searching');
        });

        newSocket.on('game_start', (data) => {
            setQuestions(data.questions);
            setPlayers(data.players);
            setStatus('playing');
            setCurrentQIndex(0);
            setTimeLeft(15);
            setIsAnswered(false);
            setSelectedOption(null);
            setAnswerResult(null);
        });

        newSocket.on('score_update', (data) => {
            setPlayers(data.players);
        });

        // Server tells us if our answer was correct
        newSocket.on('answer_result', (data: AnswerResult) => {
            setAnswerResult(data);
        });

        newSocket.on('opponent_disconnected', () => {
            alert('Opponent Disconnected! You Win!');
            setStatus('game_over');
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    // Timer Logic
    useEffect(() => {
        if (status !== 'playing') return;

        if (timeLeft > 0 && !isAnswered) {
            const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !isAnswered) {
            handleAnswer('TIMEOUT');
        }
    }, [timeLeft, status, isAnswered]);

    const findMatch = () => {
        if (!socket || !user) return;
        setStatus('searching');
        socket.emit('find_match', {
            userId: user._id,
            name: user.name,
            avatar: user.avatar
        });
    };

    const handleAnswer = (optionId: string) => {
        if (isAnswered) return;
        setIsAnswered(true);
        setSelectedOption(optionId);

        // Send answer to SERVER for validation — NO client-side scoring
        if (socket && roomId && currentQuestion) {
            socket.emit('submit_answer', {
                roomId,
                questionId: currentQuestion._id,
                selectedOption: optionId === 'TIMEOUT' ? null : optionId,
                timeLeft: timeLeft
            });
        }

        // Next Question Delay — wait for server result then advance
        setTimeout(() => {
            if (currentQIndex < questions.length - 1) {
                setCurrentQIndex(prev => prev + 1);
                setTimeLeft(15);
                setIsAnswered(false);
                setSelectedOption(null);
                setAnswerResult(null);
            } else {
                setStatus('game_over');
            }
        }, 2000);
    };

    // View: Idle
    if (status === 'idle') {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <BackButton label="Back" />

                <div className="relative z-10 max-w-md w-full">
                    <div className="w-24 h-24 bg-red-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-red-600/40 rotate-12 transform hover:rotate-0 transition-all duration-500">
                        <Swords className="w-12 h-12 text-white" />
                    </div>

                    <h1 className="text-5xl font-black mb-4 tracking-tighter bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                        BATTLE ARENA
                    </h1>
                    <p className="text-slate-400 mb-10 text-lg">
                        Challenge real opponents in 1v1 live quiz battles. Prove your dominance!
                    </p>

                    <button
                        onClick={findMatch}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold text-xl shadow-lg shadow-red-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        <Swords className="w-6 h-6" />
                        FIND MATCH
                    </button>
                </div>
            </div>
        );
    }

    // View: Searching
    if (status === 'searching') {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-red-500/30 flex items-center justify-center animate-[ping_2s_ease-in-out_infinite]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center blur-xl"></div>
                </div>
                <h2 className="mt-8 text-2xl font-bold text-slate-200">Searching for Opponent...</h2>
                <p className="text-slate-500 mt-2">Get ready to fight!</p>
            </div>
        );
    }

    // View: Playing
    if (status === 'playing' && currentQuestion) {
        return (
            <div className="min-h-screen bg-slate-950 text-white p-4 flex flex-col">
                {/* Score Bar */}
                <div className="flex justify-between items-center mb-6 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-bold">You</div>
                        <div>
                            <div className="text-sm text-slate-400">Score</div>
                            <div className="text-xl font-bold text-indigo-400">{me?.score || 0}</div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="text-2xl font-black text-slate-700">VS</div>
                        <div className="text-[10px] text-slate-600 font-bold mt-1">Q{currentQIndex + 1}/{questions.length}</div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                        <div>
                            <div className="text-sm text-slate-400">{opponent?.name || 'Opponent'}</div>
                            <div className="text-xl font-bold text-red-400">{opponent?.score || 0}</div>
                        </div>
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-sm font-bold">OP</div>
                    </div>
                </div>

                {/* Question Area */}
                <div className="flex-1 max-w-2xl mx-auto w-full flex flex-col justify-center pb-20">
                    {/* Timer */}
                    <div className="flex items-center gap-3 mb-6">
                        <Clock className={`w-5 h-5 ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ease-linear rounded-full ${timeLeft < 5 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                style={{ width: `${(timeLeft / 15) * 100}%` }}
                            ></div>
                        </div>
                        <span className={`text-lg font-black tabular-nums w-8 text-right ${timeLeft < 5 ? 'text-red-500' : 'text-slate-300'}`}>{timeLeft}</span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-tight">
                        {currentQuestion.text}
                    </h2>

                    <div className="grid gap-4">
                        {currentQuestion.options.map((opt) => {
                            let optionClass = "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300";

                            if (isAnswered && answerResult) {
                                // Server told us the result — use server's correctOption
                                if (opt.id === answerResult.correctOption) {
                                    optionClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                                } else if (opt.id === selectedOption) {
                                    optionClass = "bg-red-500/20 border-red-500 text-red-400";
                                } else {
                                    optionClass = "bg-slate-800/50 opacity-50 border-transparent";
                                }
                            } else if (isAnswered && !answerResult) {
                                // Waiting for server response — show selection only
                                if (opt.id === selectedOption) {
                                    optionClass = "bg-indigo-600 border-indigo-500 text-white animate-pulse";
                                } else {
                                    optionClass = "bg-slate-800/50 opacity-50 border-transparent";
                                }
                            }

                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => handleAnswer(opt.id)}
                                    disabled={isAnswered}
                                    className={`p-5 rounded-xl border-2 text-left font-semibold text-lg transition-all flex justify-between items-center ${optionClass}`}
                                >
                                    {opt.text}
                                    {isAnswered && answerResult && opt.id === answerResult.correctOption && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                                    {isAnswered && answerResult && opt.id === selectedOption && opt.id !== answerResult.correctOption && <XCircle className="w-5 h-5 text-red-500" />}
                                </button>
                            )
                        })}
                    </div>

                    {/* Points Feedback */}
                    {answerResult && (
                        <div className={`mt-6 text-center py-3 rounded-xl font-bold text-sm ${answerResult.isCorrect ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {answerResult.isCorrect ? `✅ Correct! +${answerResult.pointsEarned} points` : '❌ Wrong answer!'}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // View: Game Over
    if (status === 'game_over') {
        const iWon = (me?.score || 0) > (opponent?.score || 0);
        const tie = (me?.score || 0) === (opponent?.score || 0);

        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
                <div className="mb-8 relative">
                    {iWon ? (
                        <div className="w-32 h-32 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-yellow-500 animate-bounce">
                            <Trophy className="w-16 h-16 text-yellow-500" />
                        </div>
                    ) : (
                        <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mx-auto grayscale">
                            <Swords className="w-16 h-16 text-slate-500" />
                        </div>
                    )}
                </div>

                <h1 className="text-4xl font-black mb-2 uppercase">
                    {iWon ? 'Victory!' : tie ? 'It\'s a Draw' : 'Defeat'}
                </h1>
                <p className="text-slate-400 mb-8">
                    {iWon ? '+100 XP Earned' : '+20 XP Participation'}
                </p>

                <div className="flex gap-8 mb-10 text-left bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <div className="text-center">
                        <div className="text-xs text-slate-500 uppercase font-bold">You</div>
                        <div className="text-3xl font-black text-white">{me?.score}</div>
                    </div>
                    <div className="w-px bg-slate-800"></div>
                    <div className="text-center">
                        <div className="text-xs text-slate-500 uppercase font-bold">{opponent?.name || 'Opponent'}</div>
                        <div className="text-3xl font-black text-slate-400">{opponent?.score}</div>
                    </div>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                    Play Again
                </button>
                <div className="mt-4">
                    <BackButton label="Back to Dashboard" />
                </div>
            </div>
        );
    }

    return null;
}
