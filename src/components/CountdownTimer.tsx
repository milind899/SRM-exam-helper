import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface CountdownTimerProps {
    targetDate?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate = '2025-11-24T10:00:00' }) => {
    const calculateTimeLeft = (): TimeLeft => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

    useEffect(() => {
        setTimeLeft(calculateTimeLeft()); // Recalculate immediately when targetDate changes
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]); // Add targetDate to dependency array

    // Update browser tab title with countdown
    useEffect(() => {
        if (timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0) {
            document.title = `${timeLeft.days}d ${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')} - Exam`;
        } else {
            document.title = 'SRM EXAM HELPER';
        }
    }, [timeLeft]);

    const timerComponents = Object.keys(timeLeft).map((interval) => {
        if (!timeLeft[interval as keyof TimeLeft] && interval !== 'seconds' && interval !== 'minutes') {
            return null;
        }

        return (
            <div key={interval} className="flex flex-col items-center mx-2">
                <span className="text-2xl md:text-3xl font-bold text-primary font-mono">
                    {timeLeft[interval as keyof TimeLeft].toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] md:text-xs uppercase text-text-muted tracking-wider">
                    {interval}
                </span>
            </div>
        );
    });

    return (
        <div className="w-full mb-8 p-6 rounded-2xl border border-primary/20 bg-surface/50 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <Clock size={24} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-text-main">Exam Countdown</h3>
                        <p className="text-sm text-text-muted">
                            {new Date(targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(targetDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-center bg-background/50 px-6 py-3 rounded-xl border border-white/5">
                    {timerComponents.length ? timerComponents : <span className="text-xl font-bold text-primary">Exam Started!</span>}
                </div>
            </div>
        </div>
    );
};
