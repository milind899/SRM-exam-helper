import React, { useState } from 'react';
import { Trophy, Medal, Crown, User as UserIcon, AlertCircle, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { validateNickname } from '../utils/nicknameValidator';
import type { LeaderboardEntry } from '../types/leaderboard';

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
    const [isEditing, setIsEditing] = useState(false);
    const [tempNickname, setTempNickname] = useState(currentUserNickname);
    const [editError, setEditError] = useState<string>('');

    const handleSave = () => {
        if (tempNickname.trim()) {
            const validation = validateNickname(tempNickname.trim());
            if (!validation.valid) {
                setEditError(validation.error || 'Invalid nickname');
                return;
            }

            onUpdateNickname(tempNickname.trim());
            setIsEditing(false);
            setEditError('');
        }
    };

    const handleCancel = () => {
        setTempNickname(currentUserNickname);
        setIsEditing(false);
        setEditError('');
    };

    const getRankBadge = (index: number) => {
        const badges = [
            { icon: <Crown size={16} />, color: 'from-yellow-400 to-yellow-600', glow: 'shadow-yellow-500/50' },
            { icon: <Medal size={16} />, color: 'from-gray-300 to-gray-500', glow: 'shadow-gray-400/50' },
            { icon: <Medal size={16} />, color: 'from-amber-500 to-amber-700', glow: 'shadow-amber-500/50' }
        ];

        if (index < 3) {
            return (
                <div className={`flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br ${badges[index].color} shadow-lg ${badges[index].glow} text-white flex-shrink-0`}>
                    {badges[index].icon}
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-surface border-2 border-primary/20 text-text-main font-bold text-sm flex-shrink-0">
                {index + 1}
            </div>
        );
    };

    return (
        <div className="bg-gradient-to-br from-surface via-surface to-surface/50 rounded-2xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-sm">
            {/* Compact Header */}
            <div className="p-4 border-b border-white/5 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-xl shadow-lg shadow-yellow-500/30">
                        <Trophy className="text-white" size={20} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-text-main">Leaderboard</h2>
                        <p className="text-xs text-text-muted">Top achievers</p>
                    </div>
                </div>

                {/* User Nickname Badge */}
                <div>
                    <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full border border-primary/20">
                        <UserIcon size={12} className="text-primary flex-shrink-0" />
                        {isEditing ? (
                            <div className="flex items-center gap-1 flex-1">
                                <input
                                    type="text"
                                    value={tempNickname}
                                    onChange={(e) => {
                                        setTempNickname(e.target.value);
                                        setEditError(''); // Clear error on change
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSave();
                                        if (e.key === 'Escape') handleCancel();
                                    }}
                                    className={`flex-1 px-2 py-0.5 text-xs bg-background border ${editError ? 'border-red-500/50' : 'border-primary/30'
                                        } rounded text-text-main focus:outline-none focus:border-primary min-w-0`}
                                    autoFocus
                                    maxLength={20}
                                />
                                <button onClick={handleSave} className="p-0.5 hover:bg-green-500/20 rounded text-green-500 transition-colors flex-shrink-0">
                                    <Check size={14} />
                                </button>
                                <button onClick={handleCancel} className="p-0.5 hover:bg-red-500/20 rounded text-red-500 transition-colors flex-shrink-0">
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <span className="text-xs font-medium text-primary flex-1 min-w-0 truncate">{currentUserNickname}</span>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-0.5 hover:bg-primary/20 rounded transition-colors text-text-muted hover:text-primary flex-shrink-0"
                                >
                                    <Edit2 size={12} />
                                </button>
                            </>
                        )}
                    </div>
                    {editError && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[10px] text-red-400 mt-1 ml-1"
                        >
                            {editError}
                        </motion.p>
                    )}
                </div>
            </div>

            {/* Leaderboard Content */}
            <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                {error ? (
                    <div className="p-6 text-center text-red-400 flex flex-col items-center gap-2">
                        <div className="p-2 bg-red-500/10 rounded-full">
                            <AlertCircle size={24} />
                        </div>
                        <p className="text-xs">{error}</p>
                    </div>
                ) : loading ? (
                    <div className="p-8 flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-text-muted">Loading...</p>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="p-8 text-center">
                        <Trophy className="mx-auto mb-2 text-text-muted opacity-30" size={32} />
                        <p className="text-xs text-text-muted">No entries yet!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        <AnimatePresence>
                            {entries.map((entry, index) => {
                                const isCurrentUser = entry.user_id === currentUserId;
                                return (
                                    <motion.div
                                        key={entry.user_id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.03, duration: 0.3 }}
                                        className={`p-3 transition-all ${isCurrentUser
                                            ? 'bg-gradient-to-r from-primary/15 to-transparent border-l-2 border-primary'
                                            : 'hover:bg-white/3'
                                            }`}
                                    >
                                        {/* Row Layout */}
                                        <div className="flex items-center gap-3">
                                            {/* Rank Badge */}
                                            {getRankBadge(index)}

                                            {/* User Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <span className={`font-semibold text-sm leading-tight ${isCurrentUser ? 'text-primary' : 'text-text-main'
                                                        }`}>
                                                        {entry.nickname}
                                                    </span>
                                                    {isCurrentUser && (
                                                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-primary/20 text-primary rounded">
                                                            YOU
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-text-muted">
                                                    {entry.completed_items}/{entry.total_items} topics
                                                </div>
                                            </div>

                                            {/* Progress */}
                                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                <span className="font-bold text-sm text-primary tabular-nums">
                                                    {Math.round(entry.progress_percentage)}%
                                                </span>
                                                <div className="w-16 h-1.5 bg-background rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${entry.progress_percentage}%` }}
                                                        transition={{ delay: index * 0.05, duration: 0.8, ease: 'easeOut' }}
                                                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-3 py-2 text-center text-[9px] text-text-muted/60 border-t border-white/5 bg-background/20">
                Auto-updates every minute
            </div>
        </div>
    );
};
