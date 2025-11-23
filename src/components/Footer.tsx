import React from 'react';
import { Github, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="border-t border-white/10 bg-surface/50 backdrop-blur-md py-8 mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2 text-slate-400">
                        <span>Created by</span>
                        <span className="font-semibold text-slate-200">Milind Shandilya</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com/milind899"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-primary hover:bg-white/10 transition-all"
                        >
                            <Github size={20} />
                        </a>
                        <a
                            href="https://www.linkedin.com/in/milind-shandilya-7b9606296/"
                            target="_blank"
                            rel="noopener noreferrer"
            </div>
                </footer>
                );
};
