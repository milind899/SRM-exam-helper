import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SignInBannerProps {
    onSignIn: () => void;
}

export const SignInBanner: React.FC<SignInBannerProps> = ({ onSignIn }) => {
    const { user } = useAuth();
    const [isVisible, setIsVisible] = React.useState(true);

    // Don't show if user is logged in or if dismissed
    if (user || !isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-gradient-to-r from-primary/20 to-accent/20 border-b border-primary/20"
            >
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-full">
                            <LogIn size={18} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-main">
                                Sync your progress across devices!
                            </p>
                            <p className="text-xs text-text-muted hidden sm:block">
                                Sign in to save your checklist and compete on the leaderboard.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onSignIn}
                            className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-primary/20 whitespace-nowrap"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-text-muted transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
