import React, { useEffect } from 'react';
import { supabase } from './lib/supabase';
import { toast } from 'react-hot-toast';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useEffect(() => {
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.log("No session found. Attempting anonymous sign-in...");
                const { error } = await supabase.auth.signInAnonymously();
                if (error) {
                    console.error("Anon Sign-in failed:", error);
                    toast.error("Could not sign in anonymously. Data saving may fail.");
                } else {
                    console.log("Signed in anonymously!");
                    toast.success("Welcome! (Guest Mode)");
                }
            } else {
                console.log("Session active:", session.user.id);
            }
        };
        initAuth();
    }, []);

    return <>{children}</>;
};
