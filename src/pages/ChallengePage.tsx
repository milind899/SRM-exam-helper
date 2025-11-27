import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Clock, Users, Share2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface Question {
    id: number;
    question: string;
    options: Record<string, string>;
    answer: string;
}

interface ChallengeData {
    id: string;
    creator_id: string;
    opponent_id: string | null;
    unit: string;
    status: 'pending' | 'active' | 'completed';
    winner_id: string | null;
    questions?: Question[];
    creator_score?: number;
    opponent_score?: number;
}

export default function ChallengePage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [challenge, setChallenge] = useState<ChallengeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Quiz State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchChallenge();
        }
    }, [id, user]);

    const fetchChallenge = async () => {
        try {
            const res = await fetch(`/api/challenge/join?challenge_id=${id}${user ? `&user_id=${user.id}` : ''}`);
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to load challenge');
            }

            setChallenge(data.challenge);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast.success('Link copied! Send it to your friend.');
    };

    const handleOptionSelect = (key: string) => {
        if (selectedOption) return; // Prevent changing answer
        setSelectedOption(key);

        const currentQ = challenge?.questions?.[currentQuestionIndex];
        if (currentQ && key === currentQ.answer) {
            setScore(prev => prev + 1);
            toast.success('Correct!', { duration: 1000, icon: '🎉' });
        } else {
            toast.error('Incorrect', { duration: 1000 });
        }

        // Auto advance after delay
        setTimeout(() => {
            if (currentQuestionIndex < (challenge?.questions?.length || 0) - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedOption(null);
            } else {
                finishQuiz();
            }
        }, 1500);
    };

    const finishQuiz = async () => {
        setQuizCompleted(true);
    };

    // Effect to submit score when quizCompleted becomes true
    useEffect(() => {
        if (quizCompleted && challenge && user && !submitting) {
            submitScore(score);
        }
    }, [quizCompleted]);

    const submitScore = async (finalScore: number) => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/challenge/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    challenge_id: challenge!.id,
                    user_id: user!.id,
                    score: finalScore
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Score submitted!');
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                // Refresh challenge to see winner status
                fetchChallenge();
            }
        } catch (err) {
            toast.error('Failed to submit score');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading Challenge...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
    if (!challenge) return <div className="min-h-screen flex items-center justify-center text-white">Challenge not found</div>;

    // 1. Waiting for Opponent (Creator View)
    if (user?.id === challenge.creator_id && !challenge.opponent_id) {
        return (
            <Layout currentTheme="dark" onThemeChange={() => { }} onShowShortcuts={() => { }} progressPercentage={0} currentSubjectTitle="Challenge">
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <Users size={40} className="text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Challenge Created! ⚔️</h1>
                    <p className="text-gray-400 mb-8 max-w-md">
                        Waiting for an opponent to join. Share this link with a friend to start the battle!
                    </p>

                    <div className="flex items-center gap-2 bg-white/5 p-4 rounded-xl border border-white/10 mb-6 w-full max-w-md">
                        <code className="flex-1 text-sm text-primary truncate">{window.location.href}</code>
                        <button onClick={handleShare} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <Copy size={18} className="text-gray-400" />
                        </button>
                    </div>

                    <button onClick={handleShare} className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2">
                        <Share2 size={20} />
                        Share Link
                    </button>
                </div>
            </Layout>
        );
    }

    // 2. Join Screen (Opponent View)
    if (user?.id !== challenge.creator_id && user?.id !== challenge.opponent_id && challenge.status === 'pending') {
        // This state is handled by the API (it auto-joins if user_id is passed).
        // If we are here, it means the user is not logged in OR the API didn't auto-join?
        // If user is not logged in, we should prompt login.
        if (!user) {
            return (
                <Layout currentTheme="dark" onThemeChange={() => { }} onShowShortcuts={() => { }} progressPercentage={0} currentSubjectTitle="Challenge">
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
                        <h1 className="text-3xl font-bold text-white mb-4">You've been challenged! ⚔️</h1>
                        <p className="text-gray-400 mb-8">Please sign in to accept the challenge.</p>
                        {/* SignInModal should be triggered here or user manually signs in */}
                        <div className="text-primary">Please sign in using the button in the top right.</div>
                    </div>
                </Layout>
            );
        }
    }

    // 3. Quiz Interface
    if (!quizCompleted && challenge.questions) {
        const currentQ = challenge.questions[currentQuestionIndex];
        return (
            <Layout currentTheme="dark" onThemeChange={() => { }} onShowShortcuts={() => { }} progressPercentage={(currentQuestionIndex / 10) * 100} currentSubjectTitle="Challenge Mode">
                <div className="max-w-3xl mx-auto p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 font-bold">
                                VS
                            </div>
                            <div>
                                <h2 className="font-bold text-white">Battle in Progress</h2>
                                <p className="text-sm text-gray-400">Question {currentQuestionIndex + 1} of {challenge.questions.length}</p>
                            </div>
                        </div>
                        <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                            <span className="text-primary font-bold">{score}</span> pts
                        </div>
                    </div>

                    <div className="bg-surface border border-white/10 rounded-2xl p-8 mb-6">
                        <h3 className="text-xl font-medium text-white mb-8 leading-relaxed">
                            {currentQ?.question || 'Error: Question text missing'}
                        </h3>

                        <div className="grid gap-4">
                            {!currentQ ? (
                                <div className="text-red-500">Error: Question data missing</div>
                            ) : !currentQ.options ? (
                                <div className="text-red-500">Error: Options data missing</div>
                            ) : (
                                Object.entries(currentQ.options).map(([key, value]) => (
                                    <button
                                        key={key}
                                        onClick={() => handleOptionSelect(key)}
                                        disabled={selectedOption !== null}
                                        className={`w-full p-4 rounded-xl text-left transition-all border-2 ${selectedOption === key
                                            ? key === currentQ.answer
                                                ? 'bg-green-500/20 border-green-500 text-green-400'
                                                : 'bg-red-500/20 border-red-500 text-red-400'
                                            : 'bg-white/5 border-transparent hover:bg-white/10 text-gray-300'
                                            }`}
                                    >
                                        <span className="font-bold mr-3 opacity-50">{key})</span>
                                        {value}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // 4. Results / Waiting for Result
    return (
        <Layout currentTheme="dark" onThemeChange={() => { }} onShowShortcuts={() => { }} progressPercentage={100} currentSubjectTitle="Challenge Results">
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
                {challenge.winner_id ? (
                    <div className="space-y-6">
                        <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trophy size={48} className="text-yellow-500" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            {challenge.winner_id === user?.id ? 'Victory! 🏆' : challenge.winner_id === 'draw' ? 'It\'s a Draw! 🤝' : 'Defeat 😔'}
                        </h1>
                        <p className="text-xl text-gray-400">
                            You scored <span className="text-white font-bold">{score}</span> vs Opponent <span className="text-white font-bold">{user?.id === challenge.creator_id ? challenge.opponent_score : challenge.creator_score}</span>
                        </p>
                        {challenge.winner_id === user?.id && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-yellow-400 text-sm">
                                You've earned the <b>Challenge Winner</b> badge!
                            </div>
                        )}
                        <button onClick={() => navigate('/')} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors">
                            Return Home
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                            <Clock size={40} className="text-blue-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Waiting for Opponent...</h1>
                        <p className="text-gray-400">
                            You scored <span className="text-white font-bold">{score}</span>/10. <br />
                            Check back later to see who won!
                        </p>
                        <button onClick={() => navigate('/')} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors">
                            Return Home
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
}
