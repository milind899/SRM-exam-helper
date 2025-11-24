import React from 'react';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const AuthButton: React.FC = () => {
    const { user, loading, signInWithGoogle, signOut } = useAuth();

    const handleSignIn = async () => {
        try {
            await signInWithGoogle();
            toast.success('Signing in with Google...');
        } catch (error: any) {
            toast.error(error.message || 'Failed to sign in');
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            toast.success('Signed out successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to sign out');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface/50 border border-white/10">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-text-muted">Loading...</span>
            </div>
        );
    }

    if (user) {
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface/50 border border-primary/20">
                    {user.user_metadata?.avatar_url ? (
                        <img
                            src={user.user_metadata.avatar_url}
                            alt="Avatar"
                            className="w-6 h-6 rounded-full"
                        />
                    ) : (
                        <UserIcon size={16} className="text-primary" />
                    )}
                    <span className="text-sm text-text-main font-medium">
                        {user.user_metadata?.name || user.email}
                    </span>
                </div>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 text-sm font-medium transition-all"
                >
                    <LogOut size={14} />
                    Sign Out
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={handleSignIn}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white text-sm font-medium transition-all shadow-lg shadow-primary/20"
        >
            <LogIn size={16} />
            Sign in with Google
        </button>
    );
};
