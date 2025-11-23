import React from 'react';
import { Check, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { ChecklistItem as IChecklistItem } from '../data/examContent';

interface ChecklistItemProps {
    item: IChecklistItem;
    isChecked: boolean;
    onToggle: (id: string) => void;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, isChecked, onToggle }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                "group relative flex items-start gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer border",
                isChecked
                    ? "bg-primary/5 border-primary/20"
                    : "bg-surface/30 border-slate-800 hover:border-slate-700 hover:bg-surface/50"
            )}
            onClick={() => onToggle(item.id)}
        >
            <div className={clsx(
                "mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors duration-200",
                isChecked
                    ? "bg-primary border-primary text-white"
                    : "border-slate-600 group-hover:border-primary/50"
            )}>
                {isChecked && <Check size={14} strokeWidth={3} />}
            </div>

            <div className="flex-1 min-w-0">
                <p className={clsx(
                    "text-sm leading-relaxed transition-colors duration-200",
                    isChecked ? "text-slate-400 line-through" : "text-slate-200"
                )}>
                    {item.text}
                </p>

                {item.isRepeated && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            <Clock size={10} />
                            Repeated
                        </span>
                        {item.year && (
                            <span className="text-[10px] text-slate-500 font-mono">
                                {item.year}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};
