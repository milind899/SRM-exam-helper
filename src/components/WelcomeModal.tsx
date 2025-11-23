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
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                        onClick={handleSkip}
                    />

                    {/* Modal - Mobile Optimized */}
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            className="w-full sm:max-w-md pointer-events-auto m-0 sm:m-4"
                        >
                            <div className="bg-gradient-to-br from-surface via-surface to-background border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
                                {/* Header - Mobile Optimized */}
                                <div className="relative p-6 sm:p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-white/5">
                                    <button
                                        onClick={handleSkip}
                                        className="absolute top-4 right-4 p-3 sm:p-2 hover:bg-white/10 active:bg-white/20 rounded-full transition-colors text-text-muted hover:text-text-main touch-manipulation"
                                    >
                                        <X size={20} />
                                    </button>

                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-3 sm:p-3 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl shadow-lg shadow-yellow-500/30">
                                            <Trophy className="text-white" size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-bold text-text-main flex items-center gap-2">
                                                Welcome! <Sparkles size={18} className="text-primary" />
                                            </h2>
                                        </div>
                                    </div>
                                    <p className="text-text-muted text-sm">
                                        Join the leaderboard and compete with fellow students!
                                    </p>
                                </div>

                                {/* Content - Mobile Optimized */}
                                <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-text-main mb-3">
                                            Choose your display name
                                        </label>
                                        <input
                                            type="text"
                                            value={nickname}
                                            onChange={(e) => setNickname(e.target.value)}
                                            placeholder="e.g., SwiftPanda42"
                                            className="w-full px-4 py-4 sm:py-3 text-base sm:text-sm bg-background/50 border border-white/10 rounded-xl text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all touch-manipulation"
                                            maxLength={20}
                                            autoFocus
                                            autoComplete="off"
                                        />
                                        <p className="text-xs text-text-muted mt-2">
                                            You can change this anytime
                                        </p>
                                    </div>

                                    {/* Mobile Optimized Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            type="submit"
                                            disabled={!nickname.trim()}
                                            className="flex-1 px-6 py-4 sm:py-3 bg-gradient-to-r from-primary to-accent text-white font-medium text-base sm:text-sm rounded-xl hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                                        >
                                            Join Leaderboard 🏆
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSkip}
                                            className="px-6 py-4 sm:py-3 bg-white/5 hover:bg-white/10 active:bg-white/15 text-text-muted hover:text-text-main font-medium text-base sm:text-sm rounded-xl active:scale-[0.98] transition-all touch-manipulation"
                                        >
                                            Skip for now
                                        </button>
                                    </div>
                                </form>

                                {/* Footer - Mobile Optimized */}
                                <div className="px-6 sm:px-8 py-4 bg-background/30 border-t border-white/5 text-center">
                                    <p className="text-xs text-text-muted leading-relaxed">
                                        🏆 Track progress • 📊 Compete globally • ⚡ Stay motivated
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
