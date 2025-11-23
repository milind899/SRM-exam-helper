import React from 'react';
import { Trophy, Medal, Crown, User as UserIcon, AlertCircle, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LeaderboardEntry {
    user_id: string;
    nickname: string;
    progress_percentage: number;
    completed_items: number;
    total_items: number;
    last_updated: string;
}

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
    const [isEditing, setIsEditing] = React.useState(false);
    const [tempNickname, setTempNickname] = React.useState(currentUserNickname);

    const handleSave = () => {
        if (tempNickname.trim()) {
            onUpdateNickname(tempNickname.trim());
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setTempNickname(currentUserNickname);
        setIsEditing(false);
    };

    const getRankBadge = (index: number) => {
        const badges = [
            { icon: <Crown size={18} />, color: 'from-yellow-400 to-yellow-600', glow: 'shadow-yellow-500/50' },
            { icon: <Medal size={18} />, color: 'from-gray-300 to-gray-500', glow: 'shadow-gray-400/50' },
            { icon: <Medal size={18} />, color: 'from-amber-500 to-amber-700', glow: 'shadow-amber-500/50' }
        ];

        if (index < 3) {
            return (
                <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${badges[index].color} shadow-lg ${badges[index].glow} text-white`}>
                    {badges[index].icon}
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface border-2 border-primary/20 text-text-main font-bold">
                {index + 1}
            </div>
        );
    };

    return (
        <div className="bg-gradient-to-br from-surface via-surface to-surface/50 rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-sm">
            {/* Compact Header */}
            <div className="p-5 border-b border-white/5 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-xl shadow-lg shadow-yellow-500/30">
                            <Trophy className="text-white" size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-main">Leaderboard</h2>
                            <p className="text-xs text-text-muted">Top achievers</p>
                        </div>
                    </div>

                    {/* User Nickname Badge */}
                    <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full border border-primary/20">
                        <UserIcon size={14} className="text-primary" />
                        {isEditing ? (
                            <div className="flex items-center gap-1">
                                <input
                                    type="text"
                                    value={tempNickname}
                                    onChange={(e) => setTempNickname(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSave();
                                        if (e.key === 'Escape') handleCancel();
                                    }}
                                    className="w-24 px-2 py-0.5 text-xs bg-background border border-primary/30 rounded text-text-main focus:outline-none focus:border-primary"
                                    autoFocus
                                    maxLength={20}
                                />
                                <button onClick={handleSave} className="p-0.5 hover:bg-green-500/20 rounded text-green-500 transition-colors">
                                    <Check size={14} />
                                </button>
                                <button onClick={handleCancel} className="p-0.5 hover:bg-red-500/20 rounded text-red-500 transition-colors">
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <span className="text-xs font-medium text-primary">{currentUserNickname}</span>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-0.5 hover:bg-primary/20 rounded transition-colors text-text-muted hover:text-primary"
                                >
                                    <Edit2 size={12} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Leaderboard Content */}
            <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                {error ? (
                    <div className="p-8 text-center text-red-400 flex flex-col items-center gap-3">
                        <div className="p-3 bg-red-500/10 rounded-full">
                            <AlertCircle size={28} />
                        </div>
                        <p className="text-sm">{error}</p>
                    </div>
                ) : loading ? (
                    <div className="p-12 flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-text-muted">Loading rankings...</p>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="p-12 text-center">
                        <Trophy className="mx-auto mb-3 text-text-muted opacity-30" size={40} />
                        <p className="text-text-muted">No entries yet. Be the first!</p>
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
                                        className={`flex items-center gap-4 p-3 transition-all ${isCurrentUser
                                                ? 'bg-gradient-to-r from-primary/15 to-transparent border-l-2 border-primary'
                                                : 'hover:bg-white/3'
                                            }`}
                                    >
                                        {/* Rank Badge */}
                                        <div className="flex-shrink-0">
                                            {getRankBadge(index)}
                                        </div>

                                        {/* User Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-semibold truncate text-sm ${isCurrentUser ? 'text-primary' : 'text-text-main'
                                                    }`}>
                                                    {entry.nickname}
                                                </span>
                                                {isCurrentUser && (
                                                    <span className="px-2 py-0.5 text-[10px] font-medium bg-primary/20 text-primary rounded-full">
                                                        YOU
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-text-muted mt-0.5">
                                                {entry.completed_items}/{entry.total_items} topics
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <div className="hidden sm:block w-24">
                                                <div className="h-2 bg-background rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${entry.progress_percentage}%` }}
                                                        transition={{ delay: index * 0.05, duration: 0.8, ease: 'easeOut' }}
                                                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                                                    />
                                                </div>
                                            </div>
                                            <span className="font-bold text-sm text-primary min-w-[3rem] text-right">
                                                {Math.round(entry.progress_percentage)}%
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 text-center text-[10px] text-text-muted/60 border-t border-white/5 bg-background/20">
                Auto-updates every minute
            </div>
        </div>
    );
};
