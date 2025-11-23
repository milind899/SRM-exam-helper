import { useState, useEffect } from 'react';

export interface LeaderboardEntry {
    user_id: string;
    nickname: string;
    progress_percentage: number;
    completed_items: number;
    total_items: number;
    last_updated: string;
}

export const useLeaderboard = (
    progressPercentage: number,
    completedItems: number,
    totalItems: number
) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [nickname, setNickname] = useState<string>('');
    const [userId, setUserId] = useState<string>('');

    // Initialize user ID and nickname
    useEffect(() => {
        let storedUserId = localStorage.getItem('userId');
        if (!storedUserId) {
            storedUserId = crypto.randomUUID();
            localStorage.setItem('userId', storedUserId);
        }
        setUserId(storedUserId);

        let storedNickname = localStorage.getItem('userNickname');
        if (!storedNickname) {
            storedNickname = generateNickname();
            localStorage.setItem('userNickname', storedNickname);
        }
        setNickname(storedNickname);
    }, []);

    // Sync progress to database
    useEffect(() => {
        if (!userId || !nickname || totalItems === 0) return;

        const syncProgress = async () => {
            try {
                await fetch('/api/leaderboard/entries', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        nickname,
                        progressPercentage,
                        completedItems,
                        totalItems
                    })
                });
                refreshLeaderboard();
            } catch (err) {
                console.error('Error syncing progress:', err);
            }
        };

        // Debounce sync
        const timeoutId = setTimeout(syncProgress, 5000);
        return () => clearTimeout(timeoutId);
    }, [userId, nickname, progressPercentage, completedItems, totalItems]);

    // Fetch leaderboard
    const refreshLeaderboard = async () => {
        try {
            setError(null);
            const response = await fetch('/api/leaderboard/entries');
            if (!response.ok) throw new Error('Failed to fetch leaderboard');

            const data = await response.json();
            setLeaderboard(data);
            setLoading(false);
        } catch (err: any) {
            console.error('Error fetching leaderboard:', err);
            setError(err.message || 'Failed to load leaderboard');
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshLeaderboard();
        // Refresh every minute
        const interval = setInterval(refreshLeaderboard, 60000);
        return () => clearInterval(interval);
    }, []);

    const updateNickname = (newNickname: string) => {
        setNickname(newNickname);
        localStorage.setItem('userNickname', newNickname);

        // Immediately sync to database
        if (userId) {
            fetch('/api/leaderboard/entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    nickname: newNickname,
                    progressPercentage,
                    completedItems,
                    totalItems
                })
            }).then(refreshLeaderboard);
        }
    };

    return {
        user: userId ? { uid: userId } : null,
        leaderboard,
        loading,
        error,
        nickname,
        updateNickname,
        refreshLeaderboard
    };
};

// Simple nickname generator
function generateNickname(): string {
    const adjectives = ['Happy', 'Swift', 'Brave', 'Clever', 'Bright', 'Smart', 'Quick', 'Bold'];
    const animals = ['Panda', 'Tiger', 'Eagle', 'Fox', 'Wolf', 'Bear', 'Falcon', 'Lion'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const num = Math.floor(Math.random() * 100);
    return `${adj}${animal}${num}`;
}
