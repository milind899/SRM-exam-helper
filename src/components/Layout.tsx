                        >
    <Keyboard size={18} />
                        </button >

    {/* Theme Switcher */ }
    < div className = "flex items-center gap-1 p-1 rounded-full bg-surface border border-white/5" >
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
                        </div >
                    </div >
                </div >
            </header >

            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl relative z-10">
                {children}
            </main>

            <Footer />

{/* Scroll to Top Button */ }
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
        </div >
    );
};
