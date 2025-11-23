import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Sparkles } from 'lucide-react';

interface WelcomeModalProps {
    onSubmit: (nickname: string) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onSubmit }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [nickname, setNickname] = useState('');

    useEffect(() => {
        // Check if user has already set a nickname
        const hasNickname = localStorage.getItem('userNickname');
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');

        if (!hasNickname && !hasSeenWelcome) {
            // Show modal after a short delay
            setTimeout(() => setIsOpen(true), 1000);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nickname.trim()) {
            onSubmit(nickname.trim());
            localStorage.setItem('hasSeenWelcome', 'true');
            setIsOpen(false);
        }
    };

    const handleSkip = () => {
        localStorage.setItem('hasSeenWelcome', 'true');
        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={handleSkip}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
                    >
                        <div className="bg-gradient-to-br from-surface via-surface to-background border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="relative p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-white/5">
                                <button
                                    onClick={handleSkip}
                                    className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-text-muted hover:text-text-main"
                                >
                                    <X size={20} />
                                </button>

                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-3 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl shadow-lg shadow-yellow-500/30">
                                        <Trophy className="text-white" size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
                                            Welcome! <Sparkles size={20} className="text-primary" />
                                        </h2>
                                    </div>
                                </div>
                                <p className="text-text-muted text-sm">
                                    Join the leaderboard and compete with fellow students!
                                </p>
                            </div>

                            {/* Content */}
                            <form onSubmit={handleSubmit} className="p-8">
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-text-main mb-2">
                                        Choose your display name
                                    </label>
                                    <input
                                        type="text"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        placeholder="e.g., SwiftPanda42"
                                        className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                                        maxLength={20}
                                        autoFocus
                                    />
                                    <p className="text-xs text-text-muted mt-2">
                                        You can change this anytime from the leaderboard
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={!nickname.trim()}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Join Leaderboard
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSkip}
                                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-text-muted hover:text-text-main font-medium rounded-xl transition-all"
                                    >
                                        Skip
                                    </button>
                                </div>
                            </form>

                            {/* Footer */}
                            <div className="px-8 py-4 bg-background/30 border-t border-white/5 text-center">
                                <p className="text-xs text-text-muted">
                                    🏆 Track your progress • 📊 Compete globally • ⚡ Stay motivated
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
