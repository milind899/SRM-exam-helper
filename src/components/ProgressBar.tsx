import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
    total: number;
    completed: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ total, completed }) => {
    const percentage = Math.round((completed / total) * 100) || 0;

    return (
        <div className="bg-surface border border-slate-800 rounded-xl p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-100 mb-1">{percentage}%</h2>
                    <p className="text-slate-400 text-sm font-medium">Overall Progress</p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-slate-200">{completed}</span>
                    <span className="text-slate-500 text-sm font-medium"> / {total} Topics</span>
                </div>
            </div>

            <div className="h-4 bg-slate-800 rounded-full overflow-hidden p-0.5">
                <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-primary rounded-full relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                </motion.div>
            </div>
        </div>
    );
};
