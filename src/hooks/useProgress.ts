import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

export const useProgress = (user: User | null, currentSubjectId: string) => {
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    // Store the full progress object from Supabase to ensure we don't overwrite other subjects
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

    // Sync with Supabase when user logs in
    useEffect(() => {
        if (!user || !isSupabaseConfigured || !supabase) return;

        const fetchAndMergeProgress = async () => {
            if (!supabase) return;
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

                    // Merge current subject progress
                    const remoteSubjectProgress = serverProgress[currentSubjectId] || [];
                    const localSaved = localStorage.getItem(`progress-${currentSubjectId}`);
                    const localSubjectProgress = localSaved ? JSON.parse(localSaved) : [];

                    // Union of local and remote
                    const merged = new Set([...localSubjectProgress, ...remoteSubjectProgress]);
                    setCheckedItems(merged);

                    // Update localStorage for ALL subjects from remote
                    Object.entries(serverProgress).forEach(([subjectId, items]) => {
                        const local = localStorage.getItem(`progress-${subjectId}`);
                        const localItems = local ? JSON.parse(local) : [];
                        const mergedItems = [...new Set([...localItems, ...items])];
                        localStorage.setItem(`progress-${subjectId}`, JSON.stringify(mergedItems));
                    });

                    toast.success('Progress synced! 🔄');
                }
            } catch (err) {
                console.error('Error syncing progress:', err);
            }
        };

        fetchAndMergeProgress();
    }, [user, currentSubjectId]);

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
                // Prepare the new full progress object
                // We start with the last known remote state to preserve other subjects
                const updatedProgress = { ...remoteProgress };

                // Update the current subject
                updatedProgress[currentSubjectId] = itemsArray;

                // Also check if we have other local subjects that might be newer than remote
                // (This is a simple heuristic, ideally we'd have timestamps)
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key?.startsWith('progress-')) {
                        const subjectId = key.replace('progress-', '');
                        if (subjectId !== currentSubjectId) {
                            try {
                                const localItems = JSON.parse(localStorage.getItem(key) || '[]');
                                // If local has items and remote doesn't, or just to be safe, we can merge or overwrite
                                // For now, let's trust local if it exists, but ideally we merge
                                const remoteItems = updatedProgress[subjectId] || [];
                                updatedProgress[subjectId] = [...new Set([...remoteItems, ...localItems])];
                            } catch (e) { }
                        }
                    }
                }

                // Update state
                setRemoteProgress(updatedProgress);

                // Send to Supabase
                supabase
                    .from('leaderboard')
                    .update({
                        progress_data: updatedProgress,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id)
                    .then(({ error }) => {
                        if (error) console.error('Error saving progress:', error);
                    });
            }

            return next;
        });
    }, [currentSubjectId, user, remoteProgress]);

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
                        if (error) console.error('Error resetting progress:', error);
                    });
            }
        }
    }, [currentSubjectId, user, remoteProgress]);

    return {
        checkedItems,
        toggleItem,
        resetProgress,
        isLoading
    };
};
