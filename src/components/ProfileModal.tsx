import React, { useState, useEffect } from 'react';
import { X, User, Tag, Save, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    nickname: string;
    tagline: string;
    onUpdateNickname: (newNickname: string) => void;
    onUpdateTagline: (newTagline: string) => void;
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
    const [newNickname, setNewNickname] = useState(nickname);
    const [newTagline, setNewTagline] = useState(tagline);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setNewNickname(nickname);
        setNewTagline(tagline);
    }, [nickname, tagline, isOpen]);

    const handleSave = () => {
        try {
            if (newNickname !== nickname) {
                onUpdateNickname(newNickname);
            }
            if (newTagline !== tagline) {
                onUpdateTagline(newTagline);
            }
            setIsEditing(false);
            toast.success('Profile updated successfully! 🎉');
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            onClose();
            toast.success('Signed out successfully');
        } catch (error) {
            toast.error('Error signing out');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-surface border border-white/10 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-primary/10 to-accent/10">
                                <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                                    <User className="text-primary" size={24} />
                                    Your Profile
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-main transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* User Info */}
                                <div className="flex items-center gap-4">
                                    {user?.user_metadata?.avatar_url ? (
                                        <img
                                            src={user.user_metadata.avatar_url}
                                            alt="Profile"
                                            className="w-16 h-16 rounded-full border-2 border-primary/50"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50">
                                            <User size={32} className="text-primary" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-text-muted">Signed in as</p>
                                        <p className="font-medium text-text-main">{user?.email || 'Guest User'}</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <div className="h-2 w-24 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all duration-500"
                                                    style={{ width: `${progressPercentage}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-primary font-medium">{Math.round(progressPercentage)}% Complete</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Edit Form */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">Nickname</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={newNickname}
                                                onChange={(e) => setNewNickname(e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2.5 text-text-main focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
                                                placeholder="Enter nickname"
                                            />
                                            <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">Tagline</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={newTagline}
                                                onChange={(e) => setNewTagline(e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2.5 text-text-main focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
                                                placeholder="Add a fun tagline..."
                                                maxLength={50}
                                            />
                                            <Tag size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                        </div>
                                        <p className="text-xs text-text-muted mt-1 text-right">{newTagline.length}/50</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="flex-1 py-2 rounded-xl border border-white/10 text-text-muted hover:bg-white/5 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                className="flex-1 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Save size={18} />
                                                Save Changes
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex-1 py-2 rounded-xl bg-white/5 text-text-main font-medium hover:bg-white/10 transition-colors border border-white/10"
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                </div>

                                {user && (
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full py-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 mt-2"
                                    >
                                        <LogOut size={18} />
                                        Sign Out
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
