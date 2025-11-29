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
                        {renderSourceWithLinks(item.source, item.link)}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const PYQ_LINKS: Record<string, string> = {
    "PYQ 2023": "https://drive.google.com/file/d/1lvynSN3PcQp6wT_HtCdhfejxRqNDEgFC/view?usp=sharing",
    "PYQ 2024 (1)": "https://drive.google.com/file/d/1XJrLCgpsP40YuZtRXd_1e9j3q5HMGRcL/view?usp=drive_link",
    "PYQ 2024 (2)": "https://drive.google.com/file/d/1GVWOZFX9mOiPNWW7T0qDV-WogfzRzy-q/view?usp=drive_link",
    "PYQ 2025 (1)": "https://drive.google.com/file/d/17v24i0euy_OGRW9_T9cB8EhoG0-2UG6o/view?usp=drive_link",
    "PYQ 2025 (2)": "https://drive.google.com/file/d/1o_6H6Oj8zU-gTZHrLKUZ7TOtMY_TXDdS/view?usp=drive_link",
    "PYQ 2025 (3)": "https://drive.google.com/file/d/1qA2n6Twbr_O_Pldp_2XAlECcbKTG2WwF/view?usp=drive_link"
};

const renderSourceWithLinks = (source: string, defaultLink?: string) => {
    // If no specific PYQ links match, fallback to default behavior
    const hasSpecificLinks = Object.keys(PYQ_LINKS).some(key => source.includes(key));

    if (!hasSpecificLinks) {
        return defaultLink ? (
            <a
                href={defaultLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary hover:underline transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                {source}
            </a>
        ) : (
            <span>{source}</span>
        );
    }

    // Split by bullet point to handle separate segments if needed, or just replace in the whole string
    // Since we want to preserve the text structure (e.g. "PYQ 2025 (1) Q1, Q3"), we should regex replace

    // Create a regex that matches any of the keys
    // Escape parentheses for regex
    const keys = Object.keys(PYQ_LINKS).sort((a, b) => b.length - a.length); // Match longest first
    const pattern = new RegExp(`(${keys.map(k => k.replace(/[()]/g, '\\$&')).join('|')})`, 'g');

    const parts = source.split(pattern);

    return (
        <span>
            {parts.map((part, i) => {
                if (PYQ_LINKS[part]) {
                    return (
                        <a
                            key={i}
                            href={PYQ_LINKS[part]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary hover:underline transition-colors font-medium text-primary/90"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {part}
                        </a>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </span>
    );
};
