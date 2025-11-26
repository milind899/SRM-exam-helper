import React, { useState, useEffect } from 'react';
import { Footer } from './Footer';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Moon, Droplet, Keyboard, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { CircularProgress } from './CircularProgress';

interface LayoutProps {
    children: React.ReactNode;
    currentTheme: 'emerald' | 'dark' | 'blue';
    onThemeChange: (theme: 'emerald' | 'dark' | 'blue') => void;
    onShowShortcuts?: () => void;
    progressPercentage?: number;
    currentSubjectTitle?: string;
    headerActions?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    currentTheme,
    onThemeChange,
    onShowShortcuts,
    progressPercentage = 0,
    currentSubjectTitle = "DM",
    headerActions,
}) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [mouseX, mouseY]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const background = useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, rgba(var(--color-primary), 0.08), transparent 80%)`;

    return (
        <div className="min-h-screen relative overflow-x-hidden">
            {/* Dot Pattern Background */}
            <div
                className="fixed inset-0 z-0 opacity-30"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(var(--color-primary), 0.1) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Mouse spotlight effect */}
            <motion.div
                className="pointer-events-none fixed inset-0 z-0"
                style={{ background }}
            />

            <div className="relative z-10">
                {/* Header */}
                <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity text-left"
                                >
                                    SRM EXAM HELPER
                                </button>
                                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                    {currentSubjectTitle}
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-text-muted">
                                    <a
                                        href="#resources"
                                        className="px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all font-bold shadow-[0_0_10px_rgba(var(--color-primary),0.2)] hover:shadow-[0_0_15px_rgba(var(--color-primary),0.4)]"
                                    >
                                        Resources
                                    </a>
                                </nav>

                                {/* Progress Ring */}
                                {progressPercentage > 0 && (
                                    <div className="hidden sm:block" title={`${Math.round(progressPercentage)}% Complete`}>
                                        <CircularProgress percentage={progressPercentage} size={50} strokeWidth={3} />
                                    </div>
                                )}

                                {/* Header Actions (Profile/Sign In) */}
                                {headerActions}

                                {/* Share Button */}
                                <button
                                    onClick={() => {
                                        const shareData = {
                                            title: 'SRM Exam Helper',
                                            text: '🎓 Check out SRM Exam Helper - Track your exam prep! 📚✨',
                                            url: window.location.origin
                                        };
                                        if (navigator.share) {
                                            navigator.share(shareData);
                                        } else {
                                            navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                                            toast.success('Link copied to clipboard! 📋');
                                        }
                                    }}
                                    className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-primary transition-colors"
                                    title="Share Website"
                                >
                                    <Share2 size={18} />
                                </button>

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
                    style={{ pointerEvents: showScrollTop ? 'auto' : 'none' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m18 15-6-6-6 6" />
                    </svg>
                </motion.button>
            </div>
        </div>
    );
};
