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
                await signInAnonymously(auth);
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
            const data = await getTopLeaderboard();
            setLeaderboard(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
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
        nickname,
        updateNickname,
        refreshLeaderboard
    };
};
