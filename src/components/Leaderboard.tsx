import React from 'react';
import { Trophy, Medal, Crown, User as UserIcon, AlertCircle } from 'lucide-react';
import type { LeaderboardEntry } from '../services/leaderboard';
import { UserNickname } from './UserNickname';
import { motion } from 'framer-motion';

interface LeaderboardProps {
    entries: LeaderboardEntry[];
    currentUserId?: string;
    currentUserNickname: string;
    onUpdateNickname: (name: string) => void;
    loading: boolean;
    error?: string | null;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
    entries,
    currentUserId,
    currentUserNickname,
    onUpdateNickname,
    loading,
    error
}) => {
    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Crown className="text-yellow-400" size={20} />;
            case 1: return <Medal className="text-gray-300" size={20} />;
            case 2: return <Medal className="text-amber-600" size={20} />;
            default: return <span className="text-text-muted font-bold w-5 text-center">{index + 1}</span>;
        }
    };

    return (
        <div className="bg-surface rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-surface to-surface/50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <Trophy className="text-yellow-500" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-text-main">Leaderboard</h2>
                            <p className="text-sm text-text-muted">Top students this week</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-text-muted mb-1">You are playing as:</p>
                        <UserNickname
                            currentNickname={currentUserNickname}
                            onUpdate={onUpdateNickname}
                        />
                    </div>
                </div>

                {/* Header Row */}
                <div className="grid grid-cols-12 gap-4 text-xs font-medium text-text-muted uppercase tracking-wider px-2">
                    <div className="col-span-2">Rank</div>
                    <div className="col-span-6">Student</div>
                    <div className="col-span-4 text-right">Progress</div>
                </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {error ? (
                    <div className="p-8 text-center text-red-400 flex flex-col items-center gap-2">
                        <AlertCircle size={32} />
                        <p>{error}</p>
                    </div>
                ) : loading ? (
                    <div className="p-8 text-center text-text-muted">
                        Loading rankings...
                    </div>
                ) : entries.length === 0 ? (
                    <div className="p-8 text-center text-text-muted">
                        No players yet. Be the first!
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {entries.map((entry, index) => {
                            const isCurrentUser = entry.userId === currentUserId;
                            return (
                                <motion.div
                                    key={entry.userId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`grid grid-cols-12 gap-4 items-center p-4 hover:bg-white/5 transition-colors ${isCurrentUser ? 'bg-primary/10 hover:bg-primary/15' : ''
                                        }`}
                                >
                                    <div className="col-span-2 flex items-center gap-2">
                                        {getRankIcon(index)}
                                    </div>
                                    <div className="col-span-6 flex items-center gap-2">
                                        {isCurrentUser && <UserIcon size={14} className="text-primary" />}
                                        <span className={`font-medium truncate ${isCurrentUser ? 'text-primary' : 'text-text-main'}`}>
                                            {entry.nickname}
                                        </span>
                                    </div>
                                    <div className="col-span-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-16 h-1.5 bg-background rounded-full overflow-hidden hidden sm:block">
                                                <div
                                                    className="h-full bg-primary rounded-full"
                                                    style={{ width: `${entry.progressPercentage}%` }}
                                                />
                                            </div>
                                            <span className="font-bold text-text-main">
                                                {Math.round(entry.progressPercentage)}%
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="p-3 text-center text-xs text-text-muted border-t border-white/5 bg-background/30">
                Updates automatically every minute
            </div>
        </div>
    );
};
