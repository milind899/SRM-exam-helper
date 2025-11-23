import React, { useState, useEffect } from 'react';
import { Footer } from './Footer';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
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

    return (
        <div className="min-h-screen flex flex-col bg-background text-slate-100 selection:bg-primary/30 relative overflow-hidden">
            {/* Mouse Spotlight Effect */}
            <div className="pointer-events-none fixed inset-0 z-30 transition duration-300 lg:absolute">
                <motion.div
                    className="absolute inset-0 z-30 transition duration-300 lg:absolute"
                    style={{
                        background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(16, 185, 129, 0.05), transparent 80%)`,
                    }}
                />
            </div>

            <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-emerald-400 bg-clip-text text-transparent">
                        SRM EXAM HELPER
                    </h1>
                    <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
                        <a href="#resources" className="hover:text-primary transition-colors">Resources</a>
                    </nav>
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
                className="fixed bottom-20 right-8 z-50 p-3 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-emerald-600 transition-colors pointer-events-auto"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m18 15-6-6-6 6" />
                </svg>
            </motion.button>
        </div>
    );
};
