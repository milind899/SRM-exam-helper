import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShortcutsHelpProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ShortcutsHelp: React.FC<ShortcutsHelpProps> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-surface border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                        <Keyboard size={20} className="text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold text-text-main">Keyboard Shortcuts</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-main transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Shortcuts List */}
                            <div className="space-y-3">
                                <ShortcutItem shortcut="/" description="Focus search box" />
                                <ShortcutItem shortcut="T" description="Toggle theme" />
                                <ShortcutItem shortcut="E" description="Expand all units" />
                                <ShortcutItem shortcut="C" description="Collapse all units" />
                                <ShortcutItem shortcut="R" description="Reset progress" />
                                <ShortcutItem shortcut="?" description="Show this help" />
                            </div>

                            {/* Footer */}
                            <div className="mt-6 pt-4 border-t border-white/5">
                                <p className="text-xs text-text-muted text-center">
                                    Press <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 text-primary">Esc</kbd> to close
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const ShortcutItem: React.FC<{ shortcut: string; description: string }> = ({ shortcut, description }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-primary/20 transition-colors group">
        <span className="text-sm text-text-main group-hover:text-primary transition-colors">{description}</span>
        <kbd className="px-3 py-1.5 rounded-lg bg-surface border border-white/10 text-primary font-mono text-sm font-semibold min-w-[2.5rem] text-center">
            {shortcut}
        </kbd>
    </div>
);
