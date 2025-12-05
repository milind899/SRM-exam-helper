import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface BentoGridProps {
    children: React.ReactNode;
    className?: string;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ children, className }) => {
    return (
        <div className={clsx("grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]", className)}>
            {children}
        </div>
    );
};

interface BentoItemProps {
    children: React.ReactNode;
    className?: string;
    colSpan?: 1 | 2 | 3 | 4;
    rowSpan?: 1 | 2 | 3 | 4;
    title?: string;
    icon?: React.ReactNode;
    headerAction?: React.ReactNode;
    noPadding?: boolean;
    onClick?: () => void;
}

export const BentoItem: React.FC<BentoItemProps> = ({
    children,
    className,
    colSpan = 1,
    rowSpan = 1,
    title,
    icon,
    headerAction,
    noPadding = false,
    onClick
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={clsx(
                "group relative overflow-hidden rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
                {
                    'md:col-span-1': colSpan === 1,
                    'md:col-span-2': colSpan === 2,
                    'md:col-span-3': colSpan === 3,
                    'md:col-span-4': colSpan === 4,
                    'md:row-span-1': rowSpan === 1,
                    'md:row-span-2': rowSpan === 2,
                    'md:row-span-3': rowSpan === 3,
                    'md:row-span-4': rowSpan === 4,
                    'p-6': !noPadding,
                    'cursor-pointer': !!onClick
                },
                className
            )}
            onClick={onClick}
        >
            {/* Background Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {(title || icon || headerAction) && (
                <div className={clsx("flex items-center justify-between mb-4 relative z-10", { "px-6 pt-6": noPadding })}>
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                {icon}
                            </div>
                        )}
                        {title && <h3 className="font-bold text-lg text-text-main">{title}</h3>}
                    </div>
                    {headerAction}
                </div>
            )}

            <div className={clsx("relative z-10 h-full", { "h-[calc(100%-3rem)]": title || icon })}>
                {children}
            </div>
        </motion.div>
    );
};
