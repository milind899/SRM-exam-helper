import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, CheckCircle, XCircle, Trophy, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface Question {
    id: number;
    unit: string;
    question: string;
    options: Record<string, string>;
    answer: string;
}

export default function ComputerNetworks() {
    const { user } = useAuth();
    const [mode, setMode] = useState<'dashboard' | 'practice' | 'test'>('dashboard');
    const [practiceUnit, setPracticeUnit] = useState<string>('random');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(false);
    const [testSubmitted, setTestSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0); // in seconds

    // Theme state (managed by Layout usually, but we need to pass it if we wrap with Layout)
    // Actually App.tsx wraps pages, but here we might need to use Layout if this is a standalone page.
    // Based on App.tsx, it seems App.tsx renders Layout. If we add this as a route in App.tsx, 
    // we might need to ensure it's wrapped correctly or this page uses Layout internally.
    // Looking at App.tsx, it renders Layout directly. If we use React Router, we would put this inside a Route.
    // But App.tsx seems to be a single component that handles everything?
    // Wait, App.tsx has `currentSubjectId` and renders content based on that.
    // It doesn't seem to have a router setup (react-router-dom).
    // The user asked to "Add route for /computer-networks".
    // If there is no router, I might need to add one or handle routing manually in App.tsx.
    // Let's assume I will add react-router-dom or similar, OR just handle it with `window.location.pathname`.
    // Given the file structure, I don't see react-router-dom in package.json (I should have checked).
    // I'll check package.json again.
    // If no router, I'll use simple conditional rendering in App.tsx based on path.

    const fetchQuestions = async (selectedMode: 'practice' | 'test', unit?: string) => {
        setLoading(true);
        try {
            const query = new URLSearchParams({ mode: selectedMode });
            if (unit) query.append('unit', unit);

            const res = await fetch(`/api/questions?${query.toString()}`);
            const data = await res.json();

            if (data.questions) {
                setQuestions(data.questions);
                setCurrentQuestionIndex(0);
                setUserAnswers({});
                setTestSubmitted(false);
                setScore(0);

                if (selectedMode === 'test') {
                    setTimeLeft(30 * 60); // 30 minutes
                }

                setMode(selectedMode);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            toast.error('Failed to load questions');
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

        // In practice mode, show immediate feedback (optional, or just let them see it)
    };

    const submitTest = async () => {
        if (!user) {
            toast.error('Please sign in to submit test results');
            return;
        }

        let calculatedScore = 0;
        questions.forEach(q => {
            // Answer format is "(C) Presentation" or just "(C)"?
            // The DB has "Answer: (C) Presentation".
            // The options keys are "A", "B", "C", "D".
            // We need to extract the letter from the answer string.
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
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-text-main p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
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
                            <div className="bg-surface border border-white/10 rounded-2xl p-6 hover:border-primary/50 transition-all group cursor-pointer"
                                onClick={() => {
                                    // Show unit selection modal or just expand
                                    // For simplicity, we'll just use a dropdown here or start random
                                }}
                            >
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <BookOpen className="text-primary" size={24} />
                                </div>
                                <h2 className="text-xl font-bold mb-2">Practice Mode</h2>
                                <p className="text-text-muted mb-6">Master concepts unit by unit or shuffle everything. Instant feedback.</p>

                                <div className="space-y-3">
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
                            <div className="bg-surface border border-white/10 rounded-2xl p-6 hover:border-accent/50 transition-all group cursor-pointer">
                                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Trophy className="text-accent" size={24} />
                                </div>
                                <h2 className="text-xl font-bold mb-2">Test Mode</h2>
                                <p className="text-text-muted mb-6">Simulate the real exam. 30 questions, 30 minutes. Affects leaderboard.</p>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-text-muted">
                                        <Clock size={16} />
                                        <span>30 Minutes</span>
                                    </div>
                                    <button
                                        onClick={() => fetchQuestions('test')}
                                        className="w-full py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
                                    >
                                        Start Test
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {(mode === 'practice' || mode === 'test') && questions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="max-w-3xl mx-auto"
                        >
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
                            <div className="bg-surface border border-white/10 rounded-2xl p-6 md:p-8 mb-6 shadow-xl">
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

                                        // Styling logic
                                        let styleClass = "border-white/10 hover:bg-white/5";
                                        if (mode === 'practice' || testSubmitted) {
                                            if (isSelected && isCorrect) styleClass = "border-green-500 bg-green-500/10 text-green-500";
                                            else if (isSelected && !isCorrect) styleClass = "border-red-500 bg-red-500/10 text-red-500";
                                            else if (testSubmitted && isCorrect) styleClass = "border-green-500 bg-green-500/10 text-green-500"; // Show correct answer after submit
                                        } else {
                                            if (isSelected) styleClass = "border-primary bg-primary/10 text-primary";
                                        }

                                        return (
                                            <button
                                                key={key}
                                                onClick={() => handleAnswer(key)}
                                                disabled={testSubmitted}
                                                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${styleClass}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className={`h-8 w-8 rounded-full flex items-center justify-center border font-bold text-sm ${isSelected ? 'border-current' : 'border-white/20 text-text-muted'}`}>
                                                        {key}
                                                    </span>
                                                    <span className="font-medium">{value}</span>
                                                </div>
                                                {(mode === 'practice' || testSubmitted) && isCorrect && (
                                                    <CheckCircle size={20} className="text-green-500" />
                                                )}
                                                {(mode === 'practice' || testSubmitted) && isSelected && !isCorrect && (
                                                    <XCircle size={20} className="text-red-500" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
