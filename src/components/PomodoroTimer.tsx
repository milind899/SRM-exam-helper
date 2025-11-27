import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, BarChart3, Home, Download, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WORK_TIME = 25 * 60;
const SESSIONS_BEFORE_LONG_BREAK = 4;

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface SessionRecord {
    date: string;
    mode: TimerMode;
    duration: number;
    completed: boolean;
}

export const PomodoroTimer: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState<TimerMode>('work');
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [showStats, setShowStats] = useState(false);
    const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([]);

    // Load session history from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('pomodoroHistory');
        if (saved) {
            setSessionHistory(JSON.parse(saved));
        }
        const savedSessions = localStorage.getItem('pomodoroSessions');
        if (savedSessions) {
            setSessionsCompleted(Number(savedSessions));
        }
    }, []);

    const saveSession = (completed: boolean) => {
        const session: SessionRecord = {
            date: new Date().toISOString(),
            mode,
            duration: getTimeForMode(mode) - timeLeft,
            completed
        };

        const newHistory = [...sessionHistory, session];
        setSessionHistory(newHistory);
        localStorage.setItem('pomodoroHistory', JSON.stringify(newHistory));

        if (completed) {
            localStorage.setItem('pomodoroSessions', String(sessionsCompleted + 1));
        }
    };

    const getTimeForMode = (currentMode: TimerMode) => {
        switch (currentMode) {
            case 'work': return 25 * 60;
            case 'shortBreak': return 5 * 60;
            case 'longBreak': return 15 * 60;
        }
    };

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isRunning && timeLeft > 0) {
            // Calculate target end time based on current timeLeft
            const targetTime = Date.now() + timeLeft * 1000;

            interval = setInterval(() => {
                const now = Date.now();
                const newTimeLeft = Math.ceil((targetTime - now) / 1000);

                if (newTimeLeft <= 0) {
                    setTimeLeft(0);
                    handleTimerComplete();
                    clearInterval(interval);
                } else {
                    setTimeLeft(newTimeLeft);
                }
            }, 1000);
        } else if (timeLeft === 0) {
            handleTimerComplete();
        }

        return () => clearInterval(interval);
    }, [isRunning]); // Removed timeLeft dependency to prevent re-creating interval on every tick

    useEffect(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const modeText = mode === 'work' ? '🧠 Focus' : '☕ Break';
        document.title = `${minutes}:${seconds.toString().padStart(2, '0')} - ${modeText}`;
    }, [timeLeft, mode]);

    const handleTimerComplete = () => {
        setIsRunning(false);
        saveSession(true);

        if ('Notification' in window && Notification.permission === 'granted') {
            const notifText = mode === 'work'
                ? '🎉 Work session complete! Time for a break.'
                : '✨ Break over! Ready to focus?';
            new Notification('Pomodoro Timer', { body: notifText });
        }

        if (mode === 'work') {
            const newSessions = sessionsCompleted + 1;
            setSessionsCompleted(newSessions);

            if (newSessions % SESSIONS_BEFORE_LONG_BREAK === 0) {
                setMode('longBreak');
                setTimeLeft(getTimeForMode('longBreak'));
            } else {
                setMode('shortBreak');
                setTimeLeft(getTimeForMode('shortBreak'));
            }
        } else {
            setMode('work');
            setTimeLeft(getTimeForMode('work'));
        }
    };

    const toggleTimer = () => {
        if (!isRunning && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        if (isRunning) {
            saveSession(false); // Save incomplete session
        }
        setIsRunning(false);
        setTimeLeft(getTimeForMode(mode));
    };

    const switchMode = (newMode: TimerMode) => {
        if (isRunning) {
            saveSession(false);
        }
        setMode(newMode);
        setIsRunning(false);
        setTimeLeft(getTimeForMode(newMode));
    };

    const exportData = () => {
        const data = {
            sessions: sessionsCompleted,
            history: sessionHistory
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pomodoro-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (data.history) {
                    setSessionHistory(data.history);
                    localStorage.setItem('pomodoroHistory', JSON.stringify(data.history));
                }
                if (data.sessions) {
                    setSessionsCompleted(data.sessions);
                    localStorage.setItem('pomodoroSessions', String(data.sessions));
                }
            } catch (err) {
                alert('Invalid file format');
            }
        };
        reader.readAsText(file);
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = ((getTimeForMode(mode) - timeLeft) / getTimeForMode(mode)) * 100;

    const getModeColor = () => {
        switch (mode) {
            case 'work': return { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' };
            case 'shortBreak': return { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500' };
            case 'longBreak': return { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' };
        }
    };

    // Calculate stats
    const totalFocusTime = sessionHistory
        .filter(s => s.mode === 'work' && s.completed)
        .reduce((acc, s) => acc + s.duration, 0);
    const todaysSessions = sessionHistory
        .filter(s => new Date(s.date).toDateString() === new Date().toDateString() && s.completed)
        .length;
    const last7Days = sessionHistory
        .filter(s => {
            const sessionDate = new Date(s.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return sessionDate >= weekAgo && s.completed;
        });

    const colors = getModeColor();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#2C3E50] via-[#34495E] to-[#2C3E50] text-white flex flex-col items-center justify-center p-4 sm:p-8">
            {/* Top Bar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <a
                    href="/"
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-sm font-medium"
                >
                    <Home size={18} />
                    <span className="hidden sm:inline">Back to Study</span>
                </a>
                <div className="flex gap-2">
                    <label className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer text-sm">
                        <Upload size={18} />
                        <span className="hidden sm:inline">Import</span>
                        <input type="file" accept=".json" onChange={importData} className="hidden" />
                    </label>
                    <button onClick={exportData} className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-sm">
                        <Download size={18} />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                    <button
                        onClick={() => setShowStats(!showStats)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm ${showStats ? 'bg-primary text-white' : 'bg-white/10 hover:bg-white/20'
                            }`}
                    >
                        <BarChart3 size={18} />
                        <span className="hidden sm:inline">Stats</span>
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showStats && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-20 right-4 bg-[#1E293B] border border-white/10 rounded-2xl p-6 shadow-2xl z-10 max-w-md w-full max-h-[70vh] overflow-auto"
                    >
                        <h3 className="text-xl font-bold mb-4">📊 Your Statistics</h3>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/5 p-4 rounded-xl">
                                <div className="text-2xl font-bold text-orange-500">{sessionsCompleted}</div>
                                <div className="text-xs text-gray-400">Total Sessions</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl">
                                <div className="text-2xl font-bold text-emerald-500">{todaysSessions}</div>
                                <div className="text-xs text-gray-400">Today</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl col-span-2">
                                <div className="text-2xl font-bold text-blue-500">{Math.floor(totalFocusTime / 60)}m</div>
                                <div className="text-xs text-gray-400">Total Focus Time</div>
                            </div>
                        </div>

                        <h4 className="font-semibold mb-3 text-sm">Last 7 Days</h4>
                        <div className="space-y-2 mb-4">
                            {last7Days.slice(-10).reverse().map((session, i) => (
                                <div key={i} className="flex items-center justify-between text-xs bg-white/5 p-2 rounded">
                                    <span className="text-gray-400">
                                        {new Date(session.date).toLocaleDateString()}
                                    </span>
                                    <span className={session.mode === 'work' ? 'text-orange-500' : 'text-emerald-500'}>
                                        {session.mode === 'work' ? '🧠 Focus' : '☕ Break'} • {Math.floor(session.duration / 60)}m
                                    </span>
                                </div>
                            ))}
                        </div>

                        {last7Days.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">No sessions yet. Start your first one!</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mode Tabs */}
            <div className="flex gap-1 bg-[#1E293B] p-1.5 rounded-2xl mb-16 mt-16">
                <button
                    onClick={() => switchMode('work')}
                    className={`px-8 py-3 rounded-xl font-semibold text-base transition-all ${mode === 'work' ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Focus
                </button>
                <button
                    onClick={() => switchMode('shortBreak')}
                    className={`px-6 py-3 rounded-xl font-semibold text-base transition-all ${mode === 'shortBreak' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Short Break
                </button>
                <button
                    onClick={() => switchMode('longBreak')}
                    className={`px-6 py-3 rounded-xl font-semibold text-base transition-all ${mode === 'longBreak' ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Long Break
                </button>
            </div>

            {/* Timer Circle */}
            <div className="relative mb-12">
                <svg className="w-[380px] h-[380px] sm:w-[420px] sm:h-[420px] transform -rotate-90">
                    <circle cx="210" cy="210" r="180" stroke="#374151" strokeWidth="8" fill="none" className="sm:block hidden" />
                    <circle cx="190" cy="190" r="160" stroke="#374151" strokeWidth="8" fill="none" className="sm:hidden" />
                    <circle cx="210" cy="210" r="180" stroke="url(#progressGradient)" strokeWidth="8" fill="none" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 180}`} strokeDashoffset={`${2 * Math.PI * 180 * (1 - progress / 100)}`}
                        className="transition-all duration-1000 ease-linear sm:block hidden" />
                    <circle cx="190" cy="190" r="160" stroke="url(#progressGradient)" strokeWidth="8" fill="none" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 160}`} strokeDashoffset={`${2 * Math.PI * 160 * (1 - progress / 100)}`}
                        className="transition-all duration-1000 ease-linear sm:hidden" />
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" className={colors.text} stopColor="currentColor" />
                            <stop offset="100%" className={colors.text} stopColor="currentColor" stopOpacity="0.6" />
                        </linearGradient>
                    </defs>
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {mode === 'work' ? <Brain size={40} className="mb-4 opacity-80" /> : <Coffee size={40} className="mb-4 opacity-80" />}
                    <div className="text-[5.5rem] sm:text-[6.5rem] font-bold tabular-nums tracking-tight">
                        {minutes}:{seconds.toString().padStart(2, '0')}
                    </div>
                    <div className="text-lg text-gray-400 mt-1">
                        {mode === 'work' ? 'Focus Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                    </div>
                </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-4 mb-12">
                <button
                    onClick={toggleTimer}
                    className={`${colors.bg} hover:opacity-90 w-20 h-20 rounded-full shadow-2xl ${colors.text.replace('text', 'shadow')}/40 hover:scale-105 transition-all flex items-center justify-center`}
                >
                    {isRunning ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" className="ml-1" />}
                </button>
                <button
                    onClick={resetTimer}
                    className="bg-[#374151] hover:bg-[#4B5563] w-20 h-20 rounded-full transition-all flex items-center justify-center"
                >
                    <RotateCcw size={28} />
                </button>
            </div>

            {/* Sessions Counter */}
            <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm">Sessions completed:</span>
                <div className="flex gap-2">
                    {Array.from({ length: SESSIONS_BEFORE_LONG_BREAK }).map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < sessionsCompleted % SESSIONS_BEFORE_LONG_BREAK ? colors.bg : 'bg-gray-600'}`} />
                    ))}
                </div>
                <span className="font-bold text-lg">{sessionsCompleted}</span>
            </div>
        </div>
    );
};
