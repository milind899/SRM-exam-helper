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

        setNickname(storedNickname!);

        const storedTagline = localStorage.getItem('userTagline') || '';
        setTagline(storedTagline);
    }, [user]);

    // Sync progress to Supabase (ONLY for authenticated users)
    useEffect(() => {
        if (!user || !nickname || totalItems === 0 || !isSupabaseConfigured || !supabase) return;

        const syncProgress = async () => {
            if (!supabase) return;

            try {
                // 1. Fetch existing data to get MCQ score
                const { data: existingData } = await supabase
                    .from('leaderboard')
                    .select('progress_data')
                    .eq('user_id', user.id)
                    .single();

                const currentData = existingData?.progress_data || {};
                const mcqScore = currentData.cn_max_score || 0;
                const totalMcqQuestions = currentData.cn_total_questions || 30; // Default to 30 if not set
                const mcqPercentage = (mcqScore / totalMcqQuestions) * 100;

                // 2. Calculate Weighted Percentage (50% Syllabus + 50% MCQ)
                // Syllabus is passed as progressPercentage arg
                const weightedPercentage = (progressPercentage * 0.5) + (mcqPercentage * 0.5);

                // 3. Sync Leaderboard Data with Weighted Percentage
                const { error: leaderboardError } = await supabase
                    .from('leaderboard')
                    .upsert({
                        user_id: user.id,
                        nickname: nickname,
                        tagline: tagline,
                        progress_percentage: weightedPercentage, // Use weighted score for ranking
                        completed_items: completedItems,
                        total_items: totalItems,
                        updated_at: new Date().toISOString(),
                        // Ensure we preserve/update progress_data with syllabus info if needed, 
                        // but for now just keeping existing data + maybe syllabus stats?
                        // Actually, upsert might overwrite progress_data if we don't include it?
                        // Supabase upsert updates ALL columns passed. If we don't pass progress_data, it might NOT update it?
                        // BUT if it's a new row, it needs it.
                        // Safe bet: include it.
                        progress_data: currentData
                    }, {
                        onConflict: 'user_id'
                    });

                if (leaderboardError) {
                    console.error('Sync error (leaderboard):', leaderboardError);
                }

                // Sync User Email (for Admin List)
                if (user.email) {
                    const { error: userError } = await supabase
                        .from('users')
                        .upsert({
                            id: user.id,
                            email: user.email,
                            nickname: nickname,
                            last_seen: new Date().toISOString()
                        }, {
                            onConflict: 'id'
                        });

                    if (userError) {
                        console.error('Sync error (users):', userError);
                    }
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

            // Calculate weighted score on the fly for display
            const processedData = (data || []).map(entry => {
                const syllabusPercentage = entry.total_items > 0
                    ? (entry.completed_items / entry.total_items) * 100
                    : 0;

                const progressData = entry.progress_data || {};
                const mcqScore = progressData.cn_max_score || 0;
                const totalMcqQuestions = progressData.cn_total_questions || 30;
                const mcqPercentage = (mcqScore / totalMcqQuestions) * 100;

                // Weighted Score: 50% Syllabus + 50% MCQ
                const weightedScore = (syllabusPercentage * 0.5) + (mcqPercentage * 0.5);

                return {
                    ...entry,
                    progress_percentage: weightedScore // Override for display
                };
            });

            // Re-sort based on new weighted scores
            processedData.sort((a, b) => b.progress_percentage - a.progress_percentage);

            setLeaderboard(processedData);
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
