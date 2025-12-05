import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, BookOpen, Hash, CheckCircle, Percent } from 'lucide-react';

interface AddSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (subject: { name: string; total: number; present: number; percentage?: string; code?: string }) => void;
}

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [total, setTotal] = useState('');
    const [present, setPresent] = useState('');
    const [percentage, setPercentage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            name,
            code,
            total: parseInt(total) || 0,
            present: parseInt(present) || 0,
            percentage: percentage || undefined
        });
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setName('');
        setCode('');
        setTotal('');
        setPresent('');
        setPercentage('');
    };

    // Auto-calculate percentage or present
    const handleTotalChange = (val: string) => {
        setTotal(val);
        const t = parseInt(val);
        const p = parseInt(present);
        if (t > 0 && p >= 0) {
            setPercentage(((p / t) * 100).toFixed(2));
        }
    };

    const handlePresentChange = (val: string) => {
        setPresent(val);
        const t = parseInt(total);
        const p = parseInt(val);
        if (t > 0 && p >= 0) {
            setPercentage(((p / t) * 100).toFixed(2));
        }
    };

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
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md shadow-2xl pointer-events-auto overflow-hidden">
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Plus className="text-primary" size={24} />
                                    Add New Subject
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-text-muted hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Subject Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                                        <BookOpen size={16} />
                                        Subject Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Discrete Mathematics"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                    />
                                </div>

                                {/* Subject Code */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                                        <Hash size={16} />
                                        Subject Code
                                    </label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="e.g. 18CSC303J"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all font-mono uppercase"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Total Classes */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                                            <Hash size={16} />
                                            Total Classes
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={total}
                                            onChange={(e) => handleTotalChange(e.target.value)}
                                            placeholder="0"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all font-mono"
                                        />
                                    </div>

                                    {/* Attended Classes */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                                            <CheckCircle size={16} />
                                            Attended
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={total}
                                            value={present}
                                            onChange={(e) => handlePresentChange(e.target.value)}
                                            placeholder="0"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all font-mono"
                                        />
                                    </div>
                                </div>

                                {/* Percentage (Optional/Auto) */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-muted flex items-center gap-2">
                                        <Percent size={16} />
                                        Current Percentage (Optional)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={percentage}
                                        onChange={(e) => setPercentage(e.target.value)}
                                        placeholder="Auto-calculated"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all font-mono"
                                    />
                                    <p className="text-xs text-text-muted">
                                        Leave blank if you entered Total & Attended.
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="pt-4 flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 py-3 rounded-xl border border-white/10 text-text-muted hover:bg-white/5 hover:text-white transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                    >
                                        Add Subject
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
