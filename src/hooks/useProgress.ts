import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

export const useProgress = (user: User | null, currentSubjectId: string) => {
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [remoteProgress, setRemoteProgress] = useState<Record<string, string[]>>({});

    // Load initial progress from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(`progress-${currentSubjectId}`);
        if (saved) {
            setCheckedItems(new Set(JSON.parse(saved)));
        } else {
            setCheckedItems(new Set());
        }
        setIsLoading(false);
    }, [currentSubjectId]);

    // Function to fetch and sync progress from Supabase
    const syncFromSupabase = useCallback(async () => {
        if (!user || !isSupabaseConfigured || !supabase) return;

        try {
            const { data, error } = await supabase
                .from('leaderboard')
                .select('progress_data')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching progress:', error);
                return;
            }

            if (data?.progress_data) {
                const serverProgress = data.progress_data as Record<string, string[]>;
                setRemoteProgress(serverProgress);

                // SERVER WINS STRATEGY
                // Update current subject from server
                if (serverProgress[currentSubjectId]) {
                    const serverItems = serverProgress[currentSubjectId];
                    // Only update if different to avoid unnecessary re-renders
                    setCheckedItems(prev => {
                        const current = Array.from(prev);
                        if (JSON.stringify(current.sort()) !== JSON.stringify(serverItems.sort())) {
                            localStorage.setItem(`progress-${currentSubjectId}`, JSON.stringify(serverItems));
                            return new Set(serverItems);
                        }
                        return prev;
                    });
                }

                // Update localStorage for ALL other subjects from remote
                Object.entries(serverProgress).forEach(([subjectId, items]) => {
                    if (subjectId !== currentSubjectId) {
                        localStorage.setItem(`progress-${subjectId}`, JSON.stringify(items));
                    }
                });
            }
        } catch (err) {
            console.error('Error syncing progress:', err);
        }
    }, [user, currentSubjectId]);

    // Initial Sync and Realtime Subscription
    useEffect(() => {
        if (!user || !isSupabaseConfigured || !supabase) return;

        // Initial fetch
        syncFromSupabase();

        // Realtime subscription
        const channel = supabase
            .channel('progress_changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'leaderboard',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    // When an update comes in, refetch to ensure we have the full consistent state
                    // or parse payload.new.progress_data directly
                    if (payload.new && payload.new.progress_data) {
                        const newProgress = payload.new.progress_data as Record<string, string[]>;
                        setRemoteProgress(newProgress);

                        // Update current subject if changed
                        if (newProgress[currentSubjectId]) {
                            setCheckedItems(new Set(newProgress[currentSubjectId]));
                            localStorage.setItem(`progress-${currentSubjectId}`, JSON.stringify(newProgress[currentSubjectId]));
                        }

                        // Update other subjects in localStorage
                        Object.entries(newProgress).forEach(([subjectId, items]) => {
                            if (subjectId !== currentSubjectId) {
                                localStorage.setItem(`progress-${subjectId}`, JSON.stringify(items));
                            }
                        });
                    }
                }
            )
            .subscribe();

        // Refetch on window focus
        const handleFocus = () => {
            syncFromSupabase();
        };
        window.addEventListener('focus', handleFocus);

        return () => {
            if (supabase) supabase.removeChannel(channel);
            window.removeEventListener('focus', handleFocus);
        };
    }, [user, currentSubjectId, syncFromSupabase]);

    const toggleItem = useCallback(async (id: string) => {
        setCheckedItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            const itemsArray = Array.from(next);

            // 1. Update localStorage immediately
            localStorage.setItem(`progress-${currentSubjectId}`, JSON.stringify(itemsArray));

            // 2. Update Supabase if logged in
            if (user && isSupabaseConfigured && supabase) {
                // Optimistic update: We assume remoteProgress is up to date because of Realtime/Focus sync
                // We create a NEW object to avoid mutating state directly
                const updatedProgress = { ...remoteProgress };
                updatedProgress[currentSubjectId] = itemsArray;

                // Update local state immediately
                setRemoteProgress(updatedProgress);

                supabase
                    .from('leaderboard')
                    .update({
                        progress_data: updatedProgress,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id)
                    .then(({ error }) => {
                        if (error) {
                            console.error('Error saving progress:', error);
                            // Revert on error (optional, but good practice)
                            toast.error(`Failed to save progress: ${error.message}`);
                            syncFromSupabase(); // Re-sync to restore correct state
                        }
                    });
            }

            return next;
        });
    }, [currentSubjectId, user, remoteProgress, syncFromSupabase]);

    const resetProgress = useCallback(() => {
        if (window.confirm('Are you sure you want to reset all progress for this subject?')) {
            setCheckedItems(new Set());
            localStorage.removeItem(`progress-${currentSubjectId}`);

            if (user && isSupabaseConfigured && supabase) {
                const updatedProgress = { ...remoteProgress };
                updatedProgress[currentSubjectId] = [];

                setRemoteProgress(updatedProgress);

                supabase
                    .from('leaderboard')
                    .update({
                        progress_data: updatedProgress,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id)
                    .then(({ error }) => {
                        if (error) {
                            console.error('Error resetting progress:', error);
                            syncFromSupabase();
                        }
                    });
            }
        }
    }, [currentSubjectId, user, remoteProgress, syncFromSupabase]);

    return {
        checkedItems,
        toggleItem,
        resetProgress,
        isLoading
    };
};
