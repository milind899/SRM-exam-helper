import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';

const WORK_TIME = 25 * 60;
const SESSIONS_BEFORE_LONG_BREAK = 4;

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export const PomodoroTimer: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState(WORK_TIME);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState<TimerMode>('work');
    const [sessionsCompleted, setSessionsCompleted] = useState(0);

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
        document.title = `${minutes}:${seconds.toString().padStart(2, '0')} - ${modeText}`;
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
            case 'work': return { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' };
            case 'shortBreak': return { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500' };
            case 'longBreak': return { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' };
        }
    };

    const colors = getModeColor();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#2C3E50] via-[#34495E] to-[#2C3E50] text-white flex flex-col items-center justify-center p-4 sm:p-8">
            {/* Mode Tabs */}
            <div className="flex gap-1 bg-[#1E293B] p-1.5 rounded-2xl mb-16">
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
                {/* Progress Ring Background */}
                <svg className="w-[380px] h-[380px] sm:w-[420px] sm:h-[420px] transform -rotate-90">
                    <circle
                        cx="210"
                        cy="210"
                        r="180"
                        stroke="#374151"
                        strokeWidth="8"
                        fill="none"
                        className="sm:block hidden"
                    />
                    <circle
                        cx="190"
                        cy="190"
                        r="160"
                        stroke="#374151"
                        strokeWidth="8"
                        fill="none"
                        className="sm:hidden"
                    />

                    {/* Progress Ring */}
                    <circle
                        cx="210"
                        cy="210"
                        r="180"
                        stroke="url(#progressGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 180}`}
                        strokeDashoffset={`${2 * Math.PI * 180 * (1 - progress / 100)}`}
                        className="transition-all duration-1000 ease-linear sm:block hidden"
                    />
                    <circle
                        cx="190"
                        cy="190"
                        r="160"
                        stroke="url(#progressGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 160}`}
                        strokeDashoffset={`${2 * Math.PI * 160 * (1 - progress / 100)}`}
                        className="transition-all duration-1000 ease-linear sm:hidden"
                    />

                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" className={colors.text} stopColor="currentColor" />
                            <stop offset="100%" className={colors.text} stopColor="currentColor" stopOpacity="0.6" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Timer Display */}
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
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-full transition-all ${i < sessionsCompleted % SESSIONS_BEFORE_LONG_BREAK ? colors.bg : 'bg-gray-600'
                                }`}
                        />
                    ))}
                </div>
                <span className="font-bold text-lg">{sessionsCompleted}</span>
            </div>
        </div>
    );
};
