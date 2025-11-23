import React, { useState } from 'react';
import { ChevronDown, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Unit } from '../data/examContent';
import { ChecklistItem } from './ChecklistItem';
import clsx from 'clsx';

interface UnitSectionProps {
    unit: Unit;
    checkedItems: Set<string>;
    onToggleItem: (id: string) => void;
}

export const UnitSection: React.FC<UnitSectionProps> = ({ unit, checkedItems, onToggleItem }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Calculate progress for this unit
    const totalItems = unit.sections.reduce((acc, sec) => acc + sec.items.length, 0);
    const completedItems = unit.sections.reduce((acc, sec) =>
        acc + sec.items.filter(item => checkedItems.has(item.id)).length, 0
    );
    const progress = Math.round((completedItems / totalItems) * 100);
    const isComplete = progress === 100;

    return (
        <div className="rounded-2xl border border-white/5 bg-surface/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 group">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-6 py-5 flex items-center justify-between bg-transparent hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-4 flex-1">
                    {/* Completion Icon */}
                    <div className={clsx(
                        "flex-shrink-0 transition-all duration-300",
                        isComplete ? "text-primary" : "text-text-muted"
                    )}>
                        {isComplete ? (
                            <CheckCircle2 size={24} className="animate-pulse" />
                        ) : (
                            <Circle size={24} />
                        )}
                    </div>

                    {/* Title and Stats */}
                    <div className="flex flex-col items-start gap-2 flex-1">
                        <h3 className="text-lg font-bold text-text-main group-hover:text-primary transition-colors">
                            {unit.title}
                        </h3>

                        {/* Progress Bar */}
                        <div className="w-full flex items-center gap-3">
                            <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    className={clsx(
                                        "h-full rounded-full transition-all duration-300",
                                        isComplete
                                            ? "bg-gradient-to-r from-primary to-accent"
                                            : "bg-gradient-to-r from-primary/70 to-primary"
                                    )}
                                    style={{
                                        boxShadow: progress > 0 ? '0 0 10px rgba(var(--color-primary), 0.3)' : 'none'
                                    }}
                                />
                            </div>
                            <span className="text-sm font-semibold text-text-main min-w-[3rem] text-right">
                                {progress}%
                            </span>
                        </div>

                        {/* Topic Count Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-xs font-medium text-primary">
                                    {completedItems}/{totalItems} Topics
                                </span>
                            </div>
                            {isComplete && (
                                <div className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
                                    <span className="text-xs font-medium text-accent">
                                        ✨ Complete
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chevron */}
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-text-muted group-hover:text-primary transition-colors flex-shrink-0"
                    >
                        <ChevronDown size={20} />
                    </motion.div>
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 pt-2 space-y-6">
                            {unit.sections.map((section) => (
                                <div key={section.title} className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                                        <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider px-3">
                                            {section.title}
                                        </h4>
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                                    </div>
                                    <div className="space-y-2">
                                        {section.items.map((item) => (
                                            <ChecklistItem
                                                key={item.id}
                                                item={item}
                                                isChecked={checkedItems.has(item.id)}
                                                onToggle={onToggleItem}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
