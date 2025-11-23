import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, CheckCircle2, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WORK_TIME = 25 * 60;
const SESSIONS_BEFORE_LONG_BREAK = 4;

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export const PomodoroTimer: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState<TimerMode>('work');
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const [customWorkTime, setCustomWorkTime] = useState(25);
    const [customShortBreak, setCustomShortBreak] = useState(5);
    const [customLongBreak, setCustomLongBreak] = useState(15);

    const getTimeForMode = (currentMode: TimerMode) => {
        switch (currentMode) {
            case 'work': return customWorkTime * 60;
            case 'shortBreak': return customShortBreak * 60;
            case 'longBreak': return customLongBreak * 60;
        }
    };

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleTimerComplete();
        }

        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    useEffect(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const modeText = mode === 'work' ? '🧠 Focus' : '☕ Break';
        document.title = `${minutes}:${seconds.toString().padStart(2, '0')} - ${modeText} | Pomodoro`;
    }, [timeLeft, mode]);

    const handleTimerComplete = () => {
        setIsRunning(false);

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
        setIsRunning(false);
        setTimeLeft(getTimeForMode(mode));
    };

    const switchMode = (newMode: TimerMode) => {
        setMode(newMode);
        setIsRunning(false);
        setTimeLeft(getTimeForMode(newMode));
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = ((getTimeForMode(mode) - timeLeft) / getTimeForMode(mode)) * 100;

    const getModeColor = () => {
        switch (mode) {
            case 'work': return 'from-red-500 to-orange-500';
            case 'shortBreak': return 'from-green-500 to-emerald-500';
            case 'longBreak': return 'from-blue-500 to-cyan-500';
        }
    };

    const getModeIcon = () => {
        switch (mode) {
            case 'work': return <Brain size={32} />;
            case 'shortBreak': return <Coffee size={32} />;
            case 'longBreak': return <Coffee size={32} />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">🍅 Pomodoro Timer</h1>
                <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Settings size={24} />
                </button>
            </div>

            <AnimatePresence>
                {showSettings && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="absolute top-20 right-6 bg-gray-800 border border-white/10 rounded-xl p-4 shadow-2xl z-10">
                        <h3 className="font-semibold mb-3">Timer Settings</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-400">Work Time (min)</label>
                                <input type="number" value={customWorkTime} onChange={(e) => setCustomWorkTime(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-gray-700 rounded-lg text-sm mt-1" min="1" max="60" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Short Break (min)</label>
                                <input type="number" value={customShortBreak} onChange={(e) => setCustomShortBreak(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-gray-700 rounded-lg text-sm mt-1" min="1" max="30" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Long Break (min)</label>
                                <input type="number" value={customLongBreak} onChange={(e) => setCustomLongBreak(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-gray-700 rounded-lg text-sm mt-1" min="1" max="60" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col items-center gap-8 max-w-md w-full">
                <div className="flex gap-2 bg-gray-800/50 p-2 rounded-xl border border-white/10">
                    <button onClick={() => switchMode('work')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${mode === 'work' ? 'bg-gradient-to-r from-red-500 to-orange-500 shadow-lg' : 'hover:bg-white/5'}`}>
                        Focus
                    </button>
                    <button onClick={() => switchMode('shortBreak')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${mode === 'shortBreak' ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg' : 'hover:bg-white/5'}`}>
                        Short Break
                    </button>
                    <button onClick={() => switchMode('longBreak')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${mode === 'longBreak' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg' : 'hover:bg-white/5'}`}>
                        Long Break
                    </button>
                </div>

                <div className="relative">
                    <svg className="w-80 h-80 transform -rotate-90">
                        <circle cx="160" cy="160" r="140" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
                        <circle cx="160" cy="160" r="140" stroke="url(#gradient)" strokeWidth="12" fill="none" strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 140}`} strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress / 100)}`}
                            style={{ transition: 'stroke-dashoffset 1s linear' }} />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" className={mode === 'work' ? 'text-red-500' : mode === 'shortBreak' ? 'text-green-500' : 'text-blue-500'} stopColor="currentColor" />
                                <stop offset="100%" className={mode === 'work' ? 'text-orange-500' : mode === 'shortBreak' ? 'text-emerald-500' : 'text-cyan-500'} stopColor="currentColor" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="mb-2">{getModeIcon()}</div>
                        <div className="text-7xl font-bold tabular-nums">
                            {minutes}:{seconds.toString().padStart(2, '0')}
                        </div>
                        <div className="text-sm text-gray-400 mt-2">
                            {mode === 'work' ? 'Focus Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={toggleTimer} className={`p-6 rounded-full bg-gradient-to-r ${getModeColor()} shadow-2xl hover:scale-110 transition-transform`}>
                        {isRunning ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                    </button>
                    <button onClick={resetTimer} className="p-6 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
                        <RotateCcw size={32} />
                    </button>
                </div>

                <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400">Sessions completed:</span>
                    <div className="flex gap-1">
                        {Array.from({ length: SESSIONS_BEFORE_LONG_BREAK }).map((_, i) => (
                            <div key={i} className={`w-3 h-3 rounded-full ${i < sessionsCompleted % SESSIONS_BEFORE_LONG_BREAK ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gray-700'}`} />
                        ))}
                    </div>
                    <span className="font-bold">{sessionsCompleted}</span>
                </div>

                <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 max-w-sm">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle2 size={16} /> Pomodoro Tips
                    </h3>
                    <ul className="text-xs text-gray-400 space-y-1">
                        <li>• Focus fully during work sessions</li>
                        <li>• Take real breaks - step away from screen</li>
                        <li>• After 4 sessions, take a longer break</li>
                        <li>• Enable notifications for timer alerts</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
