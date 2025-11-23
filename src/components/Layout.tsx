import React from 'react';
import { Footer } from './Footer';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-background text-slate-100 selection:bg-primary/30">
            <header className="sticky top-0 z-50 border-b border-slate-800 bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                        Discrete Math Prep
                    </h1>
                    <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
                        <a href="#resources" className="hover:text-primary transition-colors">Resources</a>
                    </nav>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                {children}
            </main>

            <Footer />
        </div>
    );
};
