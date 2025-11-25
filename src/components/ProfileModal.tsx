import React, { useState } from 'react';
import { X, User, Edit2, Check, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    nickname: string;
    tagline: string;
    onUpdateNickname: (nickname: string) => void;
    onUpdateTagline: (tagline: string) => void;
    progressPercentage: number;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
    isOpen,
    onClose,
    nickname,
    tagline,
    onUpdateNickname,
    onUpdateTagline,
    progressPercentage
}) => {
    const { user, signOut } = useAuth();
    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const [isEditingTagline, setIsEditingTagline] = useState(false);
    const [tempNickname, setTempNickname] = useState(nickname);
    const [tempTagline, setTempTagline] = useState(tagline);

    if (!isOpen || !user) return null;

    const handleSaveNickname = () => {
        try {
            onUpdateNickname(tempNickname);
            setIsEditingNickname(false);
            toast.success('Nickname updated!');
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleSaveTagline = () => {
        try {
            onUpdateTagline(tempTagline);
            setIsEditingTagline(false);
            toast.success('Tagline updated!');
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            onClose();
            toast.success('Signed out successfully');
        } catch (error) {
            toast.error('Failed to sign out');
        }
    };

    const wordCount = tempTagline.trim().split(/\s+/).filter(w => w).length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-md bg-gradient-to-br from-surface via-surface to-surface/80 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
            >
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-r from-primary/20 to-accent/20 p-6 border-b border-white/10">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-text-muted" />
                    </button>

                    <div className="flex items-center gap-4">
                        {user.user_metadata?.avatar_url ? (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt="Profile"
                                className="w-16 h-16 rounded-full border-2 border-primary/30"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                                <User size={32} className="text-primary" />
                            </div>
                        )}
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-text-main">Your Profile</h2>
                            <p className="text-sm text-text-muted">{user.email}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Nickname Section */}
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">
                            Nickname
                        </label>
                        <div className="flex items-center gap-2">
                            {isEditingNickname ? (
                                <>
                                    <input
                                        type="text"
                                        value={tempNickname}
                                        onChange={(e) => setTempNickname(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-background border border-primary/20 rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="Enter nickname"
                                        maxLength={20}
                                    />
                                    <button
                                        onClick={handleSaveNickname}
                                        className="p-2 bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                                    >
                                        <Check size={20} className="text-white" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="flex-1 px-3 py-2 bg-background/50 border border-white/10 rounded-lg text-text-main">
                                        {nickname}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setTempNickname(nickname);
                                            setIsEditingNickname(true);
                                        }}
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={20} className="text-text-muted" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Tagline Section */}
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">
                            Tagline <span className="text-xs">(max 20 words)</span>
                        </label>
                        <div className="space-y-2">
                            {isEditingTagline ? (
                                <>
                                    <textarea
                                        value={tempTagline}
                                        onChange={(e) => setTempTagline(e.target.value)}
                                        className="w-full px-3 py-2 bg-background border border-primary/20 rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                        placeholder="Enter your tagline..."
                                        rows={3}
                                    />
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs ${wordCount > 20 ? 'text-red-500' : 'text-text-muted'}`}>
                                            {wordCount} / 20 words
                                        </span>
                                        <button
                                            onClick={handleSaveTagline}
                                            disabled={wordCount > 20}
                                            className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white text-sm font-medium"
                                        >
                                            Save Tagline
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="px-3 py-2 bg-background/50 border border-white/10 rounded-lg text-text-main min-h-[60px]">
                                        {tagline || <span className="text-text-muted italic">No tagline set</span>}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setTempTagline(tagline);
                                            setIsEditingTagline(true);
                                        }}
                                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                                    >
                                        {tagline ? 'Edit tagline' : 'Add tagline'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Progress Stats */}
                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
                        <h3 className="text-sm font-medium text-text-muted mb-2">Overall Progress</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <div className="h-2 bg-background rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-primary">
                                {Math.round(progressPercentage)}%
                            </span>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors font-medium border border-red-500/20"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
