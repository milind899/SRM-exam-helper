import React, { useState } from 'react';
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaderboard } from './Leaderboard';

interface LeaderboardEntry {
    user_id: string;
    nickname: string;
    progress_percentage: number;
    completed_items: number;
    total_items: number;
    last_updated: string;
}

interface StickyLeaderboardProps {
    entries: LeaderboardEntry[];
    currentUserId?: string;
    currentUserNickname: string;
    onUpdateNickname: (name: string) => void;
    loading: boolean;
    error?: string | null;
}

export const StickyLeaderboard: React.FC<StickyLeaderboardProps> = (props) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            {/* Mobile: Floating Button */}
            <div className="lg:hidden fixed bottom-6 right-6 z-40">
                <motion.button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-4 bg-gradient-to-r from-primary to-accent text-white rounded-full shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Trophy size={24} />
                </motion.button>
            </div>

            {/* Mobile: Full Screen Overlay */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 bg-background/95 backdrop-blur-lg z-50 p-4 overflow-auto"
                    >
                        <div className="max-w-2xl mx-auto">
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="mb-4 px-4 py-2 bg-surface rounded-xl text-text-muted hover:text-text-main transition-colors"
                            >
                                ← Close
                            </button>
                            <Leaderboard {...props} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desktop: Sticky Sidebar */}
            <div className="hidden lg:block fixed right-0 top-20 bottom-0 z-30 transition-all duration-300"
                style={{ width: isExpanded ? '380px' : '60px' }}
            >
                <div className="h-full flex">
                    {/* Toggle Button */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex-shrink-0 w-12 bg-surface/80 backdrop-blur-sm border-l border-y border-white/10 hover:bg-surface transition-colors flex flex-col items-center justify-center gap-2 text-text-muted hover:text-primary rounded-l-xl"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronRight size={20} />
                                <span className="text-xs writing-mode-vertical rotate-180">Hide</span>
                            </>
                        ) : (
                            <>
                                <ChevronLeft size={20} />
                                <Trophy size={20} className="text-primary" />
                                <span className="text-xs writing-mode-vertical rotate-180">Leaderboard</span>
                            </>
                        )}
                    </button>

                    {/* Sidebar Content */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: '330px', opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden bg-background/95 backdrop-blur-sm border-l border-white/10 shadow-2xl"
                            >
                                <div className="h-full overflow-auto p-4">
                                    <Leaderboard {...props} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
};
