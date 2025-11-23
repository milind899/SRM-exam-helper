import { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../config/firebase';
import {
    updateLeaderboardEntry,
    getTopLeaderboard,
    type LeaderboardEntry
} from '../services/leaderboard';
import { generateNickname } from '../utils/nicknameGenerator';

export const useLeaderboard = (
    progressPercentage: number,
    completedItems: number,
    totalItems: number
) => {
    const [user, setUser] = useState<User | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [nickname, setNickname] = useState<string>('');

    // Auth & Initial Setup
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                // Load saved nickname or generate one
                const savedName = localStorage.getItem('userNickname');
                if (savedName) {
                    setNickname(savedName);
                } else {
                    const newName = generateNickname();
                    setNickname(newName);
                    localStorage.setItem('userNickname', newName);
                }
            } else {
                try {
                    await signInAnonymously(auth);
                } catch (err) {
                    console.error("Auth error:", err);
                    setError(`Authentication failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    // Sync Progress
    useEffect(() => {
        if (user && nickname && totalItems > 0) {
            const syncProgress = async () => {
                try {
                    await updateLeaderboardEntry(user.uid, {
                        nickname,
                        progressPercentage,
                        completedItems,
                        totalItems
                    });
                    refreshLeaderboard();
                } catch (error) {
                    console.error("Error syncing progress:", error);
                    // Don't set global error for sync failure, just log it
                }
            };

            // Debounce sync
            const timeoutId = setTimeout(syncProgress, 5000);
            return () => clearTimeout(timeoutId);
        }
    }, [user, nickname, progressPercentage, completedItems, totalItems]);

    // Fetch Leaderboard
    const refreshLeaderboard = async () => {
        try {
            setError(null);
            const data = await getTopLeaderboard();
            setLeaderboard(data);
            setLoading(false);
        } catch (err: any) {
            console.error("Error fetching leaderboard:", err);
            setLoading(false);
            if (err.code === 'failed-precondition') {
                setError("Database index missing. Please check console.");
            } else if (err.code === 'permission-denied') {
                setError("Permission denied. Check security rules.");
            } else {
                setError("Failed to load leaderboard. Please try again later.");
            }
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
        if (user) {
            updateLeaderboardEntry(user.uid, {
                nickname: newNickname,
                progressPercentage,
                completedItems,
                totalItems
            }).then(refreshLeaderboard);
        }
    };

    return {
        user,
        leaderboard,
        loading,
        error,
        nickname,
        updateNickname,
        refreshLeaderboard
    };
};
