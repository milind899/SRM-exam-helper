import React from 'react';
import { Github, Linkedin } from 'lucide-react';
import { socialLinks } from '../data/resources';

export const Footer: React.FC = () => {
    return (
        <footer className="border-t border-slate-800 bg-surface/50 py-8 mt-12">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-slate-400 text-sm">
                    Created by <span className="text-slate-200 font-medium">{socialLinks.name}</span>
                </p>

                <div className="flex items-center gap-4">
                    <a
                        href={socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full"
                        aria-label="GitHub"
                    >
                        <Github size={20} />
                    </a>
                    <a
                        href={socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-blue-400 transition-colors p-2 hover:bg-slate-800 rounded-full"
                        aria-label="LinkedIn"
                    >
                        <Linkedin size={20} />
                    </a>
                </div>
            </div>
        </footer>
    );
};
