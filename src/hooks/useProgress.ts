import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

export const useProgress = (user: User | null, currentSubjectId: string) => {
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

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

                if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
                    console.error('Error fetching progress:', error);
                    return;
                }

                if (data?.progress_data) {
                    const remoteProgress = data.progress_data as Record<string, string[]>;

                    // Merge current subject progress
                    const remoteSubjectProgress = remoteProgress[currentSubjectId] || [];
                    const localSaved = localStorage.getItem(`progress-${currentSubjectId}`);
                    const localSubjectProgress = localSaved ? JSON.parse(localSaved) : [];

                    const merged = new Set([...localSubjectProgress, ...remoteSubjectProgress]);
                    setCheckedItems(merged);

                    // Update localStorage for all subjects from remote
                    Object.entries(remoteProgress).forEach(([subjectId, items]) => {
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

            // Update localStorage
            const itemsArray = Array.from(next);
            localStorage.setItem(`progress-${currentSubjectId}`, JSON.stringify(itemsArray));

            // Sync to Supabase if logged in
            if (user && isSupabaseConfigured && supabase) {
                // We need to get all progress to update the JSONB column correctly
                // Or we can just read from localStorage for other subjects
                const allProgress: Record<string, string[]> = {};

                // This is a bit of a hack: we iterate over known keys in localStorage
                // Ideally we should have a list of all subject IDs
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key?.startsWith('progress-')) {
                        const subjectId = key.replace('progress-', '');
                        if (subjectId === currentSubjectId) {
                            allProgress[subjectId] = itemsArray;
                        } else {
                            try {
                                allProgress[subjectId] = JSON.parse(localStorage.getItem(key) || '[]');
                            } catch (e) {
                                console.error('Error parsing progress for', subjectId, e);
                            }
                        }
                    }
                }

                // Ensure current subject is definitely updated in the map
                allProgress[currentSubjectId] = itemsArray;

                supabase
                    .from('leaderboard')
                    .update({
                        progress_data: allProgress,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id)
                    .then(({ error }) => {
                        if (error) console.error('Error saving progress:', error);
                    });
            }

            return next;
        });
    }, [currentSubjectId, user]);

    const resetProgress = useCallback(() => {
        if (window.confirm('Are you sure you want to reset all progress for this subject?')) {
            setCheckedItems(new Set());
            localStorage.removeItem(`progress-${currentSubjectId}`);

            if (user && isSupabaseConfigured && supabase) {
                // We need to fetch current progress first to preserve other subjects?
                // Or just read from localStorage as above
                const allProgress: Record<string, string[]> = {};
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key?.startsWith('progress-') && key !== `progress-${currentSubjectId}`) {
                        const subjectId = key.replace('progress-', '');
                        try {
                            allProgress[subjectId] = JSON.parse(localStorage.getItem(key) || '[]');
                        } catch (e) { }
                    }
                }
                allProgress[currentSubjectId] = [];

                supabase
                    .from('leaderboard')
                    .update({
                        progress_data: allProgress,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id)
                    .then(({ error }) => {
                        if (error) console.error('Error resetting progress:', error);
                    });
            }
        }
    }, [currentSubjectId, user]);

    return {
        checkedItems,
        toggleItem,
        resetProgress,
        isLoading
    };
};
