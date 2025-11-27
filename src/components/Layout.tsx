import React, { useState, useEffect } from 'react';
import { Footer } from './Footer';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Moon, Droplet, Keyboard, Share2, Zap, Trees, Rainbow, Clock, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import { CircularProgress } from './CircularProgress';

type Theme = 'emerald' | 'dark' | 'blue' | 'neon-dark' | 'nature-green' | 'modern-gradient' | 'retro-vintage' | 'gold-black';

interface LayoutProps {
    children: React.ReactNode;
    currentTheme: Theme;
    onThemeChange: (theme: Theme) => void;
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

                                {/* Theme Switcher Dropdown */}
                                <div className="relative group">
                                    <button className="p-2 rounded-lg bg-surface border border-white/5 hover:bg-white/5 transition-colors">
                                        {currentTheme === 'emerald' && <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white/20" />}
                                        {currentTheme === 'dark' && <Moon size={20} />}
                                        {currentTheme === 'blue' && <Droplet size={20} />}
                                        {currentTheme === 'neon-dark' && <Zap size={20} />}
                                        {currentTheme === 'nature-green' && <Trees size={20} />}
                                        {currentTheme === 'modern-gradient' && <Rainbow size={20} />}
                                        {currentTheme === 'retro-vintage' && <Clock size={20} />}
                                        {currentTheme === 'gold-black' && <Crown size={20} />}
                                    </button>
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                                        <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
                                            <button onClick={() => onThemeChange('emerald')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentTheme === 'emerald' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'}`}>
                                                <div className="w-5 h-5 rounded-full bg-emerald-500" />
                                                <span className="text-sm font-medium">Emerald</span>
                                            </button>
                                            <button onClick={() => onThemeChange('dark')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentTheme === 'dark' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'}`}>
                                                <Moon size={20} />
                                                <span className="text-sm font-medium">Dark Violet</span>
                                            </button>
                                            <button onClick={() => onThemeChange('blue')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentTheme === 'blue' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'}`}>
                                                <Droplet size={20} />
                                                <span className="text-sm font-medium">Blue Ocean</span>
                                            </button>
                                            <div className="h-px bg-white/10 my-2" />
                                            <button onClick={() => onThemeChange('neon-dark')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentTheme === 'neon-dark' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'}`}>
                                                <Zap size={20} />
                                                <span className="text-sm font-medium">Neon Dark</span>
                                            </button>
                                            <button onClick={() => onThemeChange('nature-green')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentTheme === 'nature-green' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'}`}>
                                                <Trees size={20} />
                                                <span className="text-sm font-medium">Nature Green</span>
                                            </button>
                                            <button onClick={() => onThemeChange('modern-gradient')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentTheme === 'modern-gradient' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'}`}>
                                                <Rainbow size={20} />
                                                <span className="text-sm font-medium">Modern Gradient</span>
                                            </button>
                                            <button onClick={() => onThemeChange('retro-vintage')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentTheme === 'retro-vintage' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'}`}>
                                                <Clock size={20} />
                                                <span className="text-sm font-medium">Retro Vintage</span>
                                            </button>
                                            <button onClick={() => onThemeChange('gold-black')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentTheme === 'gold-black' ? 'bg-primary/20 text-primary' : 'hover:bg-white/5'}`}>
                                                <Crown size={20} />
                                                <span className="text-sm font-medium">Gold & Black</span>
                                            </button>
                                        </div>
                                    </div>
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
