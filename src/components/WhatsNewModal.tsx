import React from 'react';
import { X, Sparkles, Keyboard, Palette, Clock, Zap, PartyPopper, Share2, Book, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface WhatsNewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, onClose }) => {
    const SITE_URL = 'https://srm-exam-helper.vercel.app';
    const SHARE_TEXT = '🎓 Check out SRM Exam Helper - Track your Discrete Math exam prep! 📚✨';

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'SRM Exam Helper',
                    text: SHARE_TEXT,
                    url: SITE_URL
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`${SHARE_TEXT}\n${SITE_URL}`);
            toast.success('Link copied to clipboard! 📋');
        }
    };

    const shareToWhatsApp = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT + '\n' + SITE_URL)}`;
        window.open(url, '_blank');
    };

    const shareToTwitter = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SITE_URL)}`;
        window.open(url, '_blank');
    };

    const shareToLinkedIn = () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`;
        window.open(url, '_blank');
    };

    const updates = [
        {
            icon: Book,
            title: 'Computer Networks Added! 🎉',
            description: 'New subject syllabus for Computer Networks is now available',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: UserCheck,
            title: 'Google Sign-In 🔐',
            description: 'Sign in with Google to save your progress across devices and compete on the leaderboard',
            color: 'from-green-500 to-emerald-500'
        },
        {
            icon: PartyPopper,
            title: '🏆 Leaderboard Feature!',
            description: 'Compete with fellow students in real-time rankings'
        },
        {
            icon: Share2,
            title: 'Sticky Leaderboard Sidebar',
            description: 'Always visible on the right side (desktop) or floating button (mobile)'
        },
        {
            icon: Sparkles,
            title: 'Welcome Popup for New Users',
            description: 'Choose your nickname and join the competition'
        },
        {
            icon: Keyboard,
            title: 'Keyboard Shortcuts',
            description: 'Navigate faster with hotkeys (Press ? to see all)'
        },
        {
            icon: Palette,
            title: 'Blue Ocean Theme',
            description: 'New beautiful theme option'
        },
        {
            icon: Clock,
            title: 'Tab Timer',
            description: 'Countdown always visible in browser tab'
        },
        {
            icon: Zap,
            title: 'Better Performance',
            description: 'Faster and smoother experience'
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-surface border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden">
                            {/* Header */}
                            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-primary/10 to-accent/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                                            <Sparkles size={24} className="text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-text-main">What's New! 🎉</h2>
                                            <p className="text-sm text-text-muted">Latest updates & improvements</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-main transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Updates List */}
                            <div className="p-6 overflow-y-auto max-h-[40vh]">
                                <div className="space-y-4">
                                    {updates.map((update, index) => {
                                        const Icon = update.icon;
                                        return (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors group"
                                            >
                                                <div className={`p-2 rounded-lg ${update.color ? `bg-gradient-to-br ${update.color} text-white` : 'bg-primary/10 text-primary'} border border-white/10 group-hover:scale-110 transition-transform flex-shrink-0`}>
                                                    <Icon size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-text-main mb-1">{update.title}</h3>
                                                    <p className="text-sm text-text-muted">{update.description}</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Share Section */}
                            <div className="px-6 py-4 border-t border-white/5 bg-background/30">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-semibold text-text-main flex items-center gap-2">
                                        <Share2 size={16} className="text-primary" />
                                        Share with friends!
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={shareToWhatsApp}
                                        className="flex-1 py-2 px-4 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/20 transition-colors text-sm font-medium"
                                    >
                                        WhatsApp
                                    </button>
                                    <button
                                        onClick={shareToTwitter}
                                        className="flex-1 py-2 px-4 rounded-lg bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors text-sm font-medium"
                                    >
                                        Twitter
                                    </button>
                                    <button
                                        onClick={shareToLinkedIn}
                                        className="flex-1 py-2 px-4 rounded-lg bg-[#0A66C2]/10 border border-[#0A66C2]/20 text-[#0A66C2] hover:bg-[#0A66C2]/20 transition-colors text-sm font-medium"
                                    >
                                        LinkedIn
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="py-2 px-4 rounded-lg bg-white/5 border border-white/10 text-text-main hover:bg-white/10 transition-colors"
                                        title="More options"
                                    >
                                        <Share2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-white/5 bg-background/50">
                                <button
                                    onClick={onClose}
                                    className="w-full py-3 px-6 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                >
                                    Got it! 🚀
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
