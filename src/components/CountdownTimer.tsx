import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export const CountdownTimer: React.FC = () => {
    const calculateTimeLeft = (): TimeLeft => {
        const difference = +new Date('2025-11-24T10:00:00') - +new Date();
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
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

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
    );
};
