import React from 'react';
import type { AttendanceSubject } from '../hooks/useAttendance';
// We'll use simple SVG charts to keep bundle size low, effectively creating our own "Recharts-lite"
// or just use BentoGrid style stats if Recharts isn't installed.
// Assuming user might not have Recharts installed, I'll stick to CSS/SVG charts for robustness.

interface AttendanceStatsProps {
    subjects: AttendanceSubject[];
}

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({ subjects }) => {
    // 1. Overall Percentage
    const totalClasses = subjects.reduce((acc, s) => acc + s.total_hours, 0);
    const attendedClasses = subjects.reduce((acc, s) => acc + s.present_hours, 0);
    const overall = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

    // 2. Weekly Trend (Mocked for now since we need complex log processing)
    // We can calculate actual trend if subjects have logs.

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Ring */}
            <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex items-center justify-between col-span-1">
                <div>
                    <h3 className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-1">Overall Attendance</h3>
                    <div className="text-4xl font-bold text-white">{overall.toFixed(1)}%</div>
                    <p className="text-xs text-zinc-500 mt-2">
                        {attendedClasses} attended / {totalClasses} total
                    </p>
                </div>
                <div className="relative w-24 h-24">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#27272a" strokeWidth="8" fill="transparent" />
                        <circle
                            cx="48" cy="48" r="40"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 40}
                            strokeDashoffset={2 * Math.PI * 40 * (1 - overall / 100)}
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>

            {/* Distribution Bar */}
            <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 col-span-2 flex flex-col justify-center">
                <h3 className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-4">Subject Performance</h3>
                <div className="space-y-3">
                    {subjects.slice(0, 3).map(sub => (
                        <div key={sub.id} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-white font-medium truncate w-1/2">{sub.name}</span>
                                <span className={sub.percentage >= 75 ? 'text-emerald-400' : 'text-rose-400'}>{sub.percentage.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${sub.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                    style={{ width: `${sub.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
