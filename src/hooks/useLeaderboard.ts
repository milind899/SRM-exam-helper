import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { validateNickname } from '../utils/nicknameValidator';
import type { LeaderboardEntry } from '../types/leaderboard';
import { useAuth } from '../contexts/AuthContext';

export const useLeaderboard = (
    progressPercentage: number,
    completedItems: number,
    totalItems: number
) => {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [nickname, setNickname] = useState<string>('');
    const [tagline, setTagline] = useState<string>('');

    // Initialize nickname and tagline
    useEffect(() => {
        // Check if user has a saved custom nickname first
        let storedNickname = localStorage.getItem('userNickname');

        if (!storedNickname) {
            // No saved nickname - use Gmail name as default if available
            if (user?.user_metadata?.full_name || user?.user_metadata?.name) {
                const googleName = user.user_metadata.full_name || user.user_metadata.name;
                storedNickname = googleName;
                localStorage.setItem('userNickname', googleName);
            } else {
                // Generate random nickname if no Gmail name available
                storedNickname = generateNickname();
                localStorage.setItem('userNickname', storedNickname);
            }
        }

        setNickname(storedNickname);

        const storedTagline = localStorage.getItem('userTagline') || '';
        setTagline(storedTagline);
    }, [user]);

    // Sync progress to Supabase (ONLY for authenticated users)
    useEffect(() => {
        if (!user || !nickname || totalItems === 0 || !isSupabaseConfigured || !supabase) return;

        const syncProgress = async () => {
            if (!supabase) return;

            try {
                const { error } = await supabase
                    .from('leaderboard')
                    .upsert({
                        user_id: user.id,
                        nickname: nickname,
                        tagline: tagline,
                        progress_percentage: progressPercentage,
                        completed_items: completedItems,
                        total_items: totalItems,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'user_id'
                    });

                if (error) {
                    console.error('Sync error:', error);
                    return;
                }

                refreshLeaderboard();
            } catch (err) {
                console.error('Error syncing progress:', err);
            }
        };

        const timeoutId = setTimeout(syncProgress, 5000);
        return () => clearTimeout(timeoutId);
    }, [user, nickname, tagline, progressPercentage, completedItems, totalItems]);

    // Fetch leaderboard from Supabase
    const refreshLeaderboard = async () => {
        if (!isSupabaseConfigured || !supabase) {
            setLoading(false);
            return;
        }

        try {
            setError(null);

            const { data, error } = await supabase
                .from('leaderboard')
                .select('*')
                .order('progress_percentage', { ascending: false })
                .order('updated_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            setLeaderboard(data || []);
            setLoading(false);
        } catch (err: any) {
            console.error('Error fetching leaderboard:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    // Initial fetch and periodic refresh
    useEffect(() => {
        refreshLeaderboard();
        const interval = setInterval(refreshLeaderboard, 60000);
        return () => clearInterval(interval);
    }, []);

    const updateNickname = (newNickname: string) => {
        const validation = validateNickname(newNickname);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        setNickname(newNickname);
        localStorage.setItem('userNickname', newNickname);
    };

    const updateTagline = (newTagline: string) => {
        if (newTagline.length > 50) {
            throw new Error('Tagline must be 50 characters or less');
        }
        setTagline(newTagline);
        localStorage.setItem('userTagline', newTagline);
    };

    return {
        leaderboard,
        loading,
        error,
        nickname,
        tagline,
        refreshLeaderboard,
        updateNickname,
        updateTagline
    };
};

// Helper function to generate random nickname
function generateNickname(): string {
    const adjectives = ['Swift', 'Clever', 'Brave', 'Wise', 'Quick', 'Noble', 'Bright', 'Bold'];
    const nouns = ['Scholar', 'Learner', 'Student', 'Ace', 'Pro', 'Guru', 'Expert', 'Master'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 999);
    return `${adj}${noun}${num}`;
}
