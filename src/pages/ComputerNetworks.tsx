import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, CheckCircle, XCircle, Trophy, RefreshCw, Eye, AlertCircle, X, Grid, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { Layout } from '../components/Layout';
import { User as UserIcon } from 'lucide-react';
import { SignInModal } from '../components/SignInModal';

interface Question {
    id: number;
    unit: string;
    question: string;
    options: Record<string, string>;
    answer: string;
}

interface ComputerNetworksProps {
    theme?: 'emerald' | 'dark' | 'blue';
    onThemeChange?: (theme: 'emerald' | 'dark' | 'blue') => void;
}

export default function ComputerNetworks({ theme = 'emerald', onThemeChange = () => { } }: ComputerNetworksProps) {
    const { user } = useAuth();
    const [mode, setMode] = useState<'dashboard' | 'practice' | 'test'>('dashboard');
    const [practiceUnit, setPracticeUnit] = useState<string>('random');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [testSubmitted, setTestSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [showBanner, setShowBanner] = useState(true);
    const [showSignInModal, setShowSignInModal] = useState(false);

    const fetchQuestions = async (selectedMode: 'practice' | 'test', unit?: string) => {
        if (selectedMode === 'test' && !user) {
            toast.error('Please sign in to take the test');
            setShowSignInModal(true);
            return;
        }

        setLoading(true);
        try {
            // Fetch static JSON file
            const res = await fetch('/questions.json');
            if (!res.ok) throw new Error('Failed to load questions file');

            const data = await res.json();
            let allQuestions: Question[] = data.questions;

            if (!allQuestions || allQuestions.length === 0) {
                throw new Error('No questions found in file');
            }

            let filteredQuestions: Question[] = [];

            if (selectedMode === 'practice') {
                if (unit && unit !== 'random') {
                    // Filter by unit
                    filteredQuestions = allQuestions.filter(q =>
                        q.unit.toLowerCase().includes(unit.toLowerCase())
                    );
                } else {
                    // Random questions
                    filteredQuestions = [...allQuestions];
                }

                // Shuffle and limit to 30
                filteredQuestions = filteredQuestions
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 30);

            } else if (selectedMode === 'test') {
                // Test mode: 6 questions from each of 5 units
                const units = ['UNIT 1', 'UNIT 2', 'UNIT 3', 'UNIT 4', 'UNIT 5'];
                const questionsPerUnit = 6;

                for (const u of units) {
                    const unitQuestions = allQuestions.filter(q => q.unit === u);
                    const shuffled = unitQuestions.sort(() => Math.random() - 0.5);
                    filteredQuestions.push(...shuffled.slice(0, questionsPerUnit));
                }

                // Shuffle the final test set
                filteredQuestions = filteredQuestions.sort(() => Math.random() - 0.5);
            }

            if (filteredQuestions.length > 0) {
                setQuestions(filteredQuestions);
                setCurrentQuestionIndex(0);
                setUserAnswers({});
                setRevealedAnswers({});
                setTestSubmitted(false);
                setScore(0);

                if (selectedMode === 'test') {
                    setTimeLeft(30 * 60); // 30 minutes
                }

                setMode(selectedMode);
            } else {
                toast.error('No questions found for selected criteria.');
            }
        } catch (error: any) {
            console.error('Error fetching questions:', error);
            toast.error(
                <div className="flex flex-col gap-2">
                    <span className="font-bold">Failed to load questions</span>
                    <span className="text-xs opacity-80">{error.message || 'Unknown error'}</span>
                </div>,
                { duration: 6000 }
            );
        } finally {
            setLoading(false);
        }
    };


    const handleAnswer = (optionKey: string) => {
        if (testSubmitted) return;

        setUserAnswers(prev => ({
            ...prev,
            [questions[currentQuestionIndex].id]: optionKey
        }));
    };

    const toggleRevealAnswer = () => {
        const currentQId = questions[currentQuestionIndex].id;
        setRevealedAnswers(prev => ({
            ...prev,
            [currentQId]: !prev[currentQId]
        }));
    };

    const submitTest = async () => {
        if (!user) {
            toast.error('Please sign in to submit test results');
            return;
        }

        let calculatedScore = 0;
        questions.forEach(q => {
            const correctLetter = q.answer.match(/\(([A-D])\)/)?.[1];
            if (correctLetter && userAnswers[q.id] === correctLetter) {
                calculatedScore++;
            }
        });

        setScore(calculatedScore);
        setTestSubmitted(true);

        // Celebrate if good score
        if (calculatedScore > questions.length * 0.7) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }

        try {
            await fetch('/api/submit_test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    score: calculatedScore,
                    total_questions: questions.length
                })
            });
            toast.success('Test submitted successfully!');
        } catch (error) {
            console.error('Error submitting test:', error);
            toast.error('Failed to save result');
        }
    };

    useEffect(() => {
        if (mode === 'test' && !testSubmitted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        submitTest();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [mode, testSubmitted, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Render Logic
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <Layout
            currentTheme={theme}
            onThemeChange={onThemeChange}
            currentSubjectTitle="CN MCQ"
            headerActions={
                user ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-primary rounded-lg font-medium text-sm">
                        {user.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Profile" className="w-5 h-5 rounded-full border border-primary/30" />
                        ) : (
                            <UserIcon size={16} />
                        )}
                        <span className="hidden sm:inline">Profile</span>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowSignInModal(true)}
                        className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all font-medium text-sm shadow-lg shadow-primary/20"
                    >
                        Sign In
                    </button>
                )
            }
        >
            <SignInModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} />

            <div className="max-w-6xl mx-auto">
                {/* Banner */}
                <AnimatePresence>
                    {showBanner && mode === 'dashboard' && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 flex items-start gap-4 relative"
                        >
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 shrink-0">
                                <AlertCircle size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-blue-100 mb-1">New: Computer Networks MCQ Practice!</h3>
                                <p className="text-sm text-blue-200/70 leading-relaxed">
                                    You can now practice unit-wise MCQs directly on the website.
                                    <br />
                                    <span className="text-blue-300 font-medium">Note:</span> Taking the <strong>Test Mode</strong> and completing the syllabus will directly affect your ranking on the Leaderboard.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowBanner(false)}
                                className="p-1 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header / Nav */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => mode === 'dashboard' ? window.location.href = '/' : setMode('dashboard')}
                        className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to {mode === 'dashboard' ? 'Home' : 'Dashboard'}
                    </button>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        CN MCQ Practice
                    </h1>
                </div>

                <AnimatePresence mode="wait">
                    {mode === 'dashboard' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid md:grid-cols-2 gap-6"
                        >
                            {/* Practice Card */}
                            <div className="bg-surface border border-white/10 rounded-2xl p-6 hover:border-primary/50 transition-all group cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <BookOpen size={100} />
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative z-10">
                                    <BookOpen className="text-primary" size={24} />
                                </div>
                                <h2 className="text-xl font-bold mb-2 relative z-10">Practice Mode</h2>
                                <p className="text-text-muted mb-6 relative z-10">Master concepts unit by unit or shuffle everything. Instant feedback with "Show Answer".</p>

                                <div className="space-y-3 relative z-10">
                                    <select
                                        value={practiceUnit}
                                        onChange={(e) => setPracticeUnit(e.target.value)}
                                        className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-primary outline-none"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <option value="random">Random Questions</option>
                                        <option value="UNIT 1">Unit 1 - Intro & OSI</option>
                                        <option value="UNIT 2">Unit 2 - IP & Subnetting</option>
                                        <option value="UNIT 3">Unit 3 - Routing</option>
                                        <option value="UNIT 4">Unit 4 - MAC & Errors</option>
                                        <option value="UNIT 5">Unit 5 - Transport & App</option>
                                    </select>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            fetchQuestions('practice', practiceUnit);
                                        }}
                                        className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                    >
                                        Start Practice
                                    </button>
                                </div>
                            </div>

                            {/* Test Card */}
                            <div className="bg-surface border border-white/10 rounded-2xl p-6 hover:border-accent/50 transition-all group cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Trophy size={100} />
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative z-10">
                                    <Trophy className="text-accent" size={24} />
                                </div>
                                <h2 className="text-xl font-bold mb-2 relative z-10">Test Mode</h2>
                                <p className="text-text-muted mb-6 relative z-10">Simulate the real exam. 30 questions, 30 minutes. Affects leaderboard.</p>

                                <div className="space-y-3 relative z-10">
                                    <div className="flex items-center justify-between text-sm text-text-muted">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} />
                                            <span>30 Minutes</span>
                                        </div>
                                        {!user && (
                                            <div className="flex items-center gap-1 text-red-400">
                                                <Lock size={14} />
                                                <span>Sign in required</span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fetchQuestions('test')}
                                        className="w-full py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {user ? 'Start Test' : 'Sign In to Start Test'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {(mode === 'practice' || mode === 'test') && questions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8"
                        >
                            {/* Main Question Area */}
                            <div className="max-w-3xl">
                                {/* Progress Bar & Timer */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="text-sm font-medium text-text-muted">
                                        Question {currentQuestionIndex + 1} / {questions.length}
                                    </div>
                                    {mode === 'test' && (
                                        <div className={`flex items-center gap-2 font-mono text-lg ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
                                            <Clock size={20} />
                                            {formatTime(timeLeft)}
                                        </div>
                                    )}
                                </div>

                                {/* Question Card */}
                                <div className="bg-surface border border-white/10 rounded-2xl p-6 md:p-8 mb-6 shadow-xl relative">
                                    <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-xs font-medium text-text-muted mb-4 border border-white/5">
                                        {questions[currentQuestionIndex].unit}
                                    </span>
                                    <h3 className="text-xl md:text-2xl font-bold mb-8 leading-relaxed">
                                        {questions[currentQuestionIndex].question}
                                    </h3>

                                    <div className="space-y-3">
                                        {Object.entries(questions[currentQuestionIndex].options).map(([key, value]) => {
                                            const isSelected = userAnswers[questions[currentQuestionIndex].id] === key;
                                            const correctLetter = questions[currentQuestionIndex].answer.match(/\(([A-D])\)/)?.[1];
                                            const isCorrect = key === correctLetter;
                                            const isRevealed = revealedAnswers[questions[currentQuestionIndex].id];

                                            // Styling logic
                                            let styleClass = "border-white/10 hover:bg-white/5";

                                            if (mode === 'practice') {
                                                if (isRevealed) {
                                                    if (isCorrect) styleClass = "border-green-500 bg-green-500/10 text-green-500";
                                                    else if (isSelected) styleClass = "border-red-500 bg-red-500/10 text-red-500";
                                                } else {
                                                    if (isSelected) styleClass = "border-primary bg-primary/10 text-primary";
                                                }
                                            } else if (testSubmitted) {
                                                if (isCorrect) styleClass = "border-green-500 bg-green-500/10 text-green-500";
                                                else if (isSelected) styleClass = "border-red-500 bg-red-500/10 text-red-500";
                                            } else {
                                                if (isSelected) styleClass = "border-primary bg-primary/10 text-primary";
                                            }

                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => handleAnswer(key)}
                                                    disabled={testSubmitted || (mode === 'practice' && isRevealed)}
                                                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${styleClass}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <span className={`h-8 w-8 rounded-full flex items-center justify-center border font-bold text-sm ${isSelected ? 'border-current' : 'border-white/20 text-text-muted'}`}>
                                                            {key}
                                                        </span>
                                                        <span className="font-medium">{value}</span>
                                                    </div>
                                                    {((mode === 'practice' && isRevealed) || testSubmitted) && isCorrect && (
                                                        <CheckCircle size={20} className="text-green-500" />
                                                    )}
                                                    {((mode === 'practice' && isRevealed) || testSubmitted) && isSelected && !isCorrect && (
                                                        <XCircle size={20} className="text-red-500" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Show Answer Button (Practice Mode Only) */}
                                    {mode === 'practice' && (
                                        <div className="mt-6 flex justify-end">
                                            <button
                                                onClick={toggleRevealAnswer}
                                                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                            >
                                                {revealedAnswers[questions[currentQuestionIndex].id] ? (
                                                    <>
                                                        <Eye size={16} />
                                                        Answer Revealed
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye size={16} />
                                                        Show Answer
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Navigation */}
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                        disabled={currentQuestionIndex === 0}
                                        className="px-6 py-2 rounded-xl bg-surface border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>

                                    {currentQuestionIndex === questions.length - 1 ? (
                                        !testSubmitted && mode === 'test' ? (
                                            <button
                                                onClick={submitTest}
                                                className="px-8 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                                            >
                                                Submit Test
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setMode('dashboard')}
                                                className="px-6 py-2 rounded-xl bg-surface border border-white/10 hover:bg-white/5 transition-colors"
                                            >
                                                Finish
                                            </button>
                                        )
                                    ) : (
                                        <button
                                            onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                            className="px-6 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                                        >
                                            Next
                                        </button>
                                    )}
                                </div>

                                {testSubmitted && (
                                    <div className="mt-8 p-6 bg-surface border border-white/10 rounded-2xl text-center animate-fade-in">
                                        <h3 className="text-2xl font-bold mb-2">Test Completed!</h3>
                                        <p className="text-text-muted mb-4">You scored</p>
                                        <div className="text-5xl font-bold text-primary mb-4">
                                            {score} <span className="text-2xl text-text-muted">/ {questions.length}</span>
                                        </div>
                                        <button
                                            onClick={() => setMode('dashboard')}
                                            className="flex items-center gap-2 mx-auto px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            <RefreshCw size={18} />
                                            Back to Dashboard
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar / Question Grid (Test Mode Only) */}
                            {mode === 'test' && (
                                <div className="space-y-6">
                                    <div className="bg-surface border border-white/10 rounded-2xl p-6 sticky top-24">
                                        <div className="flex items-center gap-2 mb-4 text-text-main font-bold">
                                            <Grid size={20} />
                                            <h3>Question Navigator</h3>
                                        </div>

                                        <div className="grid grid-cols-5 gap-2">
                                            {questions.map((q, idx) => {
                                                const isAnswered = !!userAnswers[q.id];
                                                const isCurrent = idx === currentQuestionIndex;
                                                const correctLetter = q.answer.match(/\(([A-D])\)/)?.[1];
                                                const isCorrect = userAnswers[q.id] === correctLetter;

                                                let bgClass = "bg-white/5 hover:bg-white/10 border-white/10";
                                                let textClass = "text-text-muted";

                                                if (testSubmitted) {
                                                    if (isCorrect) {
                                                        bgClass = "bg-green-500/20 border-green-500/50";
                                                        textClass = "text-green-500";
                                                    } else if (isAnswered) {
                                                        bgClass = "bg-red-500/20 border-red-500/50";
                                                        textClass = "text-red-500";
                                                    }
                                                } else {
                                                    if (isAnswered) {
                                                        bgClass = "bg-primary text-white border-primary";
                                                        textClass = "text-white";
                                                    }
                                                }

                                                if (isCurrent) {
                                                    bgClass += " ring-2 ring-primary ring-offset-2 ring-offset-background";
                                                }

                                                return (
                                                    <button
                                                        key={q.id}
                                                        onClick={() => setCurrentQuestionIndex(idx)}
                                                        className={`aspect-square rounded-lg border flex items-center justify-center text-sm font-medium transition-all ${bgClass} ${textClass}`}
                                                    >
                                                        {idx + 1}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-6 space-y-2 text-xs text-text-muted">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded bg-primary"></div>
                                                <span>Answered</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded bg-white/5 border border-white/10"></div>
                                                <span>Not Answered</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded border-2 border-primary"></div>
                                                <span>Current Question</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
}
