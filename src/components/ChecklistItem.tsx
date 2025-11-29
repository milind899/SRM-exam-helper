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
                "group relative flex items-start gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer border backdrop-blur-sm",
                isChecked
                    ? "bg-primary/10 border-primary/20"
                    : "bg-white/5 border-white/5 hover:border-primary/30 hover:bg-white/10"
            )}
            onClick={() => onToggle(item.id)}
        >
            <div className={clsx(
                "mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all duration-200",
                isChecked
                    ? "bg-primary border-primary text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                    : "border-slate-600 group-hover:border-primary/50 group-hover:shadow-[0_0_10px_rgba(16,185,129,0.2)]"
            )}>
                {isChecked && <Check size={14} strokeWidth={3} />}
            </div>

            <div className="flex-1 min-w-0">
                <p className={clsx(
                    "text-sm leading-relaxed transition-colors duration-200",
                    isChecked ? "text-text-muted line-through" : "text-text-main group-hover:text-primary"
                )}>
                    {item.text}
                </p>

                {item.isRepeated && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                            <Clock size={10} />
                            Repeated
                        </span>
                        {item.year && (
                            <span className="text-[10px] text-slate-500 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                                {item.year}
                            </span>
                        )}
                    </div>
                )}

                {item.source && (
                    <div className="mt-2 text-xs text-text-muted">
                        <span className="font-semibold text-primary/80">Source: </span>
                        {item.link ? (
                            <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary hover:underline transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {item.source}
                            </a>
                        ) : (
                            <span>{item.source}</span>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};
