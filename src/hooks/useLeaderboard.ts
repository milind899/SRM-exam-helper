import { useState, useEffect } from 'react';
import { validateNickname } from '../utils/nicknameValidator';

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
                const response = await fetch('/api/leaderboard/entries', {
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

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Sync error:', errorData);
                    return;
                }

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

            const response = await fetch('/api/leaderboard/entries', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Response Error:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('Leaderboard data:', data);
            setLeaderboard(data);
            setLoading(false);
        } catch (err: any) {
            console.error('Error fetching leaderboard:', err);

            // More specific error message
            let errorMsg = 'Failed to load leaderboard';
            if (err.message.includes('fetch')) {
                errorMsg = 'Cannot connect to leaderboard server. Deploy to Vercel to enable.';
            } else {
                errorMsg = err.message || errorMsg;
            }

            setError(errorMsg);
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
        // Validate nickname before updating
        const validation = validateNickname(newNickname);
        if (!validation.valid) {
            console.error('Invalid nickname:', validation.error);
            return false;
        }

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
            }).then(refreshLeaderboard).catch(console.error);
        }

        return true;
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
