import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Calculator, Trash2 } from 'lucide-react';

interface Subject {
    id: string;
    name: string;
    total: number;
    present: number;
    percentage?: string;
    prediction?: {
        attend: number;
        miss: number;
        active: boolean;
    };
}

interface SubjectCardProps {
    subject: Subject;
    onUpdate: (id: string, field: keyof Subject, value: any) => void;
    onRemove: (id: string) => void;
    calculateMargin: (present: number, total: number) => any;
}

const CircularProgress = ({ percentage, color }: { percentage: number; color: string }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-zinc-800"
                />
                <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke={color}
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-lg font-bold ${color.replace('stroke-', 'text-')}`}>
                    {percentage.toFixed(0)}%
                </span>
            </div>
        </div>
    );
};

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onUpdate, onRemove, calculateMargin }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Calculate stats
    const stats = calculateMargin(subject.present, subject.total);

    // Prioritize scraped percentage if available
    const displayPercentage = (subject.percentage && subject.percentage !== '0.00' && subject.percentage !== '0')
        ? parseFloat(subject.percentage)
        : (subject.total > 0 ? (subject.present / subject.total) * 100 : 0);

    const isSafe = displayPercentage >= 75;
    const color = isSafe ? '#10b981' : '#f43f5e'; // Emerald-500 vs Rose-500
    const needsTotal = subject.total === 0 && displayPercentage > 0;

    // Prediction Logic
    const prediction = subject.prediction || { attend: 0, miss: 0, active: false };

    let projectedPercentage = displayPercentage;


    if (prediction.active) {
        const newTotal = subject.total + prediction.attend + prediction.miss;
        const newPresent = subject.present + prediction.attend;
        projectedPercentage = newTotal > 0 ? (newPresent / newTotal) * 100 : 0;

    }

    const handleUpdatePrediction = (field: 'attend' | 'miss', value: number) => {
        const newPrediction = { ...prediction, [field]: value };
        onUpdate(subject.id, 'prediction', newPrediction);
    };

    const togglePrediction = () => {
        const newPrediction = { ...prediction, active: !prediction.active };
        onUpdate(subject.id, 'prediction', newPrediction);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`bg-surface/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden transition-all ${isExpanded ? 'ring-2 ring-primary/50' : 'hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5'}`}
        >
            {/* Main Card Content */}
            <div
                className="p-5 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex justify-between items-center gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-text-main truncate" title={subject.name}>
                                {subject.name}
                            </h3>
                            {needsTotal && <AlertTriangle size={16} className="text-yellow-500 animate-pulse" />}
                        </div>
                        <p className="text-text-muted text-xs font-mono truncate">{subject.id}</p>

                        <div className="mt-3 flex items-center gap-2">
                            {isSafe ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                    <CheckCircle size={12} /> Can miss {stats.margin}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/20">
                                    <AlertTriangle size={12} /> Must attend {Math.abs(stats.margin)}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex-shrink-0">
                        <CircularProgress percentage={prediction.active ? projectedPercentage : displayPercentage} color={color} />
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/10 bg-surface/30"
                    >
                        <div className="p-5 space-y-5">
                            {/* Inputs */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1.5 block">Total Classes</label>
                                    <input
                                        type="number"
                                        value={subject.total || ''}
                                        onChange={(e) => {
                                            const newTotal = parseInt(e.target.value) || 0;
                                            // Auto-adjust present if we have a percentage but no total
                                            let newPresent = subject.present;
                                            if (subject.percentage && parseFloat(subject.percentage) > 0 && newTotal > 0 && subject.total === 0) {
                                                newPresent = Math.round((parseFloat(subject.percentage) / 100) * newTotal);
                                            }
                                            onUpdate(subject.id, 'total', newTotal);
                                            if (newPresent !== subject.present) onUpdate(subject.id, 'present', newPresent);
                                        }}
                                        className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-text-main font-mono focus:border-primary focus:outline-none transition-colors"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1.5 block">Attended</label>
                                    <input
                                        type="number"
                                        value={subject.present || ''}
                                        onChange={(e) => onUpdate(subject.id, 'present', parseInt(e.target.value) || 0)}
                                        className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-text-main font-mono focus:border-primary focus:outline-none transition-colors"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Prediction Mode */}
                            <div className={`rounded-xl p-4 border transition-all ${prediction.active ? 'bg-primary/10 border-primary/30' : 'bg-background/30 border-white/5'}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className={`text-sm font-bold flex items-center gap-2 ${prediction.active ? 'text-primary' : 'text-text-muted'}`}>
                                        <Calculator size={16} />
                                        Prediction Mode
                                    </h4>
                                    <button
                                        onClick={togglePrediction}
                                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${prediction.active
                                            ? 'bg-primary text-white'
                                            : 'bg-surface border border-white/10 text-text-muted hover:text-text-main'}`}
                                    >
                                        {prediction.active ? 'Active' : 'Enable'}
                                    </button>
                                </div>

                                {prediction.active && (
                                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div>
                                            <label className="text-xs text-primary/70 mb-1 block">Attend Next</label>
                                            <input
                                                type="number"
                                                value={prediction.attend}
                                                onChange={(e) => handleUpdatePrediction('attend', parseInt(e.target.value) || 0)}
                                                className="w-full bg-background/50 border border-primary/30 rounded-lg px-2 py-1.5 text-text-main focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-primary/70 mb-1 block">Miss Next</label>
                                            <input
                                                type="number"
                                                value={prediction.miss}
                                                onChange={(e) => handleUpdatePrediction('miss', parseInt(e.target.value) || 0)}
                                                className="w-full bg-background/50 border border-primary/30 rounded-lg px-2 py-1.5 text-text-main focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div className="col-span-2 mt-2 pt-2 border-t border-primary/20 flex justify-between items-center text-sm">
                                            <span className="text-primary/70">Projected:</span>
                                            <span className="font-bold text-text-main">{projectedPercentage.toFixed(2)}%</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Are you sure you want to remove this subject?')) onRemove(subject.id);
                                    }}
                                    className="text-text-muted hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-500/10"
                                    title="Remove Subject"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SubjectCard;
