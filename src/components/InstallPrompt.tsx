import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleClose = () => {
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    className="fixed bottom-6 right-6 z-50 animate-[float_3s_ease-in-out_infinite]"
                >
                    <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 border-2 border-emerald-400 rounded-2xl shadow-2xl p-5 flex items-center gap-4 backdrop-blur-xl max-w-sm
                        shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                        {/* Sparkle effects */}
                        <span className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-300 rounded-full animate-ping" />
                        <span className="absolute top-1/2 -left-2 w-2 h-2 bg-pink-300 rounded-full animate-[ping_2s_ease-in-out_infinite_0.5s]" />
                        <span className="absolute -bottom-2 right-1/4 w-2 h-2 bg-purple-300 rounded-full animate-[ping_3s_ease-in-out_infinite_1s]" />

                        {/* Download icon with animation */}
                        <div className="p-4 bg-white/20 rounded-xl animate-pulse">
                            <Download className="text-white" size={32} />
                        </div>

                        <div className="flex-1">
                            <h3 className="font-bold text-white text-lg mb-1">Install Desktop App</h3>
                            <p className="text-sm text-white/90">Get the app for offline access & better performance!</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleInstallClick}
                                className="px-5 py-2 bg-white text-emerald-600 rounded-xl font-bold hover:bg-white/90 transition-all shadow-lg hover:scale-105"
                            >
                                Install
                            </button>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors flex items-center justify-center"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
