import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Shield, AlertTriangle } from 'lucide-react';
import type { AttendanceSubject } from '../hooks/useAttendance';

interface AttendanceCardProps {
    subject: AttendanceSubject;
    onUpdate?: (id: string, status: 'Present' | 'Absent') => void;
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({ subject, onUpdate }) => {
    // Prediction Logic: How many can I bunk? or Need to attend?
    const calculateMargin = (present: number, total: number, target: number) => {
        // (P) / (T + x) >= 0.75  =>  margin = floor((P - 0.75T)/0.75)
        // (P + x) / (T + x) >= 0.75 => required = ceil((0.75T - P)/0.25)
        const current = total === 0 ? 0 : (present / total) * 100;
        const t = target / 100;

        if (current >= target) {
            const margin = Math.floor((present - t * total) / t);
            return { type: 'safe', value: Math.max(0, margin) };
        } else {
            const required = Math.ceil((t * total - present) / (1 - t));
            return { type: 'danger', value: Math.max(0, required) };
        }
    };

    const margin = calculateMargin(subject.present_hours, subject.total_hours, subject.settings.target);
    const percentage = Number(subject.percentage.toFixed(1));

    return (
        <motion.div
            layoutId={subject.id}
            className="group relative bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 overflow-hidden hover:border-white/20 transition-all hover:shadow-2xl hover:shadow-primary/10"
        >
            {/* Background Gradient Mesh */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex flex-col h-full justify-between">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="text-xs font-mono text-zinc-500 mb-1">{subject.code}</div>
                        <h3 className="font-bold text-lg text-white line-clamp-2 leading-tight" title={subject.name}>
                            {subject.name}
                        </h3>
                    </div>
                    {/* Ring Chart */}
                    <div className="relative w-14 h-14 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-zinc-800" />
                            <circle
                                cx="28" cy="28" r="24"
                                stroke={percentage >= subject.settings.target ? '#10b981' : '#f43f5e'}
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 24}
                                strokeDashoffset={2 * Math.PI * 24 * (1 - percentage / 100)}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-white">
                            {percentage}%
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                    <div className="bg-zinc-950/50 rounded-xl p-3 border border-white/5">
                        <div className="text-xs text-zinc-500 mb-1">Attended</div>
                        <div className="text-lg font-bold text-emerald-400">
                            {subject.present_hours} <span className="text-zinc-600 text-xs font-normal">/ {subject.total_hours}</span>
                        </div>
                    </div>
                    <div className={`bg-zinc-950/50 rounded-xl p-3 border border-white/5 ${margin.type === 'safe' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
                        <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
                            {margin.type === 'safe' ? <Shield size={10} /> : <AlertTriangle size={10} />}
                            {margin.type === 'safe' ? 'Can Bunk' : 'Must Attend'}
                        </div>
                        <div className={`text-lg font-bold ${margin.type === 'safe' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {margin.value} <span className="text-xs font-normal opacity-70">classes</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                    <button
                        onClick={() => onUpdate?.(subject.id, 'Present')}
                        className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-500 font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <Check size={16} /> <span className="text-sm">Present</span>
                    </button>
                    <button
                        onClick={() => onUpdate?.(subject.id, 'Absent')}
                        className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <X size={16} /> <span className="text-sm">Absent</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
