import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
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
    const [isExpanded, setIsExpanded] = useState(true);

    // Calculate progress for this unit
    const totalItems = unit.sections.reduce((acc, sec) => acc + sec.items.length, 0);
    const completedItems = unit.sections.reduce((acc, sec) =>
        acc + sec.items.filter(item => checkedItems.has(item.id)).length, 0
    );
    const progress = Math.round((completedItems / totalItems) * 100);

    return (
        <div className="rounded-xl border border-slate-800 bg-surface overflow-hidden transition-colors hover:border-slate-700">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between bg-surface hover:bg-slate-800/50 transition-colors"
            >
                <div className="flex flex-col items-start gap-1">
                    <h2 className="text-lg font-bold text-slate-100">{unit.title}</h2>
                    <div className="flex items-center gap-3 text-xs">
                        <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-slate-400 font-medium">{progress}% Complete</span>
                    </div>
                </div>

                <div className={clsx(
                    "p-2 rounded-full bg-slate-800 text-slate-400 transition-transform duration-200",
                    isExpanded && "rotate-180"
                )}>
                    <ChevronDown size={20} />
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 pb-6 pt-2 space-y-8">
                            {unit.sections.map((section, idx) => (
                                <div key={idx} className="space-y-3">
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider pl-1">
                                        {section.title}
                                    </h3>
                                    <div className="grid gap-2">
                                        {section.items.map(item => (
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
