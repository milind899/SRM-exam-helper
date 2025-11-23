import React, { useState, useEffect } from 'react';
import { Footer } from './Footer';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Moon, Droplet, Keyboard } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    currentTheme: 'emerald' | 'dark' | 'blue';
    onThemeChange: (theme: 'emerald' | 'dark' | 'blue') => void;
    onShowShortcuts?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentTheme, onThemeChange, onShowShortcuts }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleHeaderClick = () => {
        window.history.pushState("", document.title, window.location.pathname + window.location.search);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen flex flex-col bg-background text-text-main selection:bg-primary/30 relative overflow-hidden transition-colors duration-300">
            {/* Mouse Spotlight Effect */}
            <div className="pointer-events-none fixed inset-0 z-30 transition duration-300 lg:absolute">
                <motion.div
                    className="absolute inset-0 z-30 transition duration-300 lg:absolute"
                    style={{
                        background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(var(--color-primary), 0.05), transparent 80%)`,
                    }}
                />
            </div>

            <header className="sticky top-0 z-50 border-b border-text-main/10 bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={handleHeaderClick}
                        className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity text-left"
                    >
                        SRM EXAM HELPER
                    </button>

                    <div className="flex items-center gap-4">
                        <nav className="hidden md:flex gap-6 text-sm font-medium text-text-muted">
                            <a href="#resources" className="hover:text-primary transition-colors">Resources</a>
                        </nav>

                        {/* Keyboard Shortcuts Button */}
                        <button
                            onClick={onShowShortcuts}
                            className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-primary transition-colors"
                            title="Keyboard Shortcuts (?)"
                        >
                            <Keyboard size={18} />
                        </button>

                        {/* Theme Switcher */}
                        <div className="flex items-center gap-1 p-1 rounded-full bg-surface border border-white/5">
                            <button
                                onClick={() => onThemeChange('emerald')}
                                className={`p-1.5 rounded-full transition-all ${currentTheme === 'emerald' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                                title="Emerald Theme"
                            >
                                <div className="w-4 h-4 rounded-full bg-emerald-500 border border-white/20" />
                            </button>
                            <button
                                onClick={() => onThemeChange('dark')}
                                className={`p-1.5 rounded-full transition-all ${currentTheme === 'dark' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                                title="Dark Theme"
                            >
                                <Moon size={16} />
                            </button>
                            <button
                                onClick={() => onThemeChange('blue')}
                                className={`p-1.5 rounded-full transition-all ${currentTheme === 'blue' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                                title="Blue Ocean Theme"
                            >
                                <Droplet size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl relative z-10">
                {children}
            </main>

            <Footer />

            {/* Scroll to Top Button */}
            <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: showScrollTop ? 1 : 0, scale: showScrollTop ? 1 : 0.5 }}
                onClick={scrollToTop}
                className="fixed bottom-20 right-8 z-50 p-3 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:opacity-90 transition-all pointer-events-auto"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m18 15-6-6-6 6" />
                </svg>
            </motion.button>
        </div>
    );
};
