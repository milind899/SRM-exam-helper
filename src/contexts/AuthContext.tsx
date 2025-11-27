import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isSupabaseConfigured || !supabase) {
            setLoading(false);
            return;
        }

        const client = supabase;

        // Get initial session
        client.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = client.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            // Sync user to public.users table
            if (session?.user) {
                const { user } = session;
                const nickname = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous';

                console.log('Attempting to sync user:', user.id, nickname);

                client
                    .from('users')
                    .upsert({
                        id: user.id,
                        email: user.email,
                        nickname: nickname,
                        last_seen: new Date().toISOString()
                    }, { onConflict: 'id' })
                    .then(({ error }) => {
                        if (error) {
                            console.error('Error syncing user:', error);
                        } else {
                            console.log('User synced successfully');
                        }
                    });
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const client = supabase;
        if (!isSupabaseConfigured || !client) {
            throw new Error('Supabase is not configured. Please add environment variables.');
        }
        const { error } = await client.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            },
        });
        if (error) throw error;
    };

    const signOut = async () => {
        if (!isSupabaseConfigured || !supabase) {
            throw new Error('Supabase is not configured.');
        }
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                signInWithGoogle,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
