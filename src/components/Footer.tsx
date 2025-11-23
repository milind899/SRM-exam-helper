import React from 'react';
import { Github, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="border-t border-white/10 bg-surface/50 backdrop-blur-md py-8 mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2 text-text-muted">
                        <span>Created by</span>
                        <a
                            href="https://milind899.github.io/portfolio/#"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-text-main hover:text-primary transition-colors"
                        >
                            Milind Shandilya
                        </a>
                    </div>

                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com/milind899"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-white/5 text-text-muted hover:text-primary hover:bg-white/10 transition-all"
                        >
                            <Github size={20} />
                        </a>
                        <a
                            href="https://www.linkedin.com/in/milind899/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-white/5 text-text-muted hover:text-primary hover:bg-white/10 transition-all"
                        >
                            <Linkedin size={20} />
                        </a>
                    </div>

                    <div className="max-w-2xl text-center space-y-2">
                        <p className="text-xs text-text-muted">
                            Disclaimer: This is a student-created resource. Please verify all topics and questions with official university materials.
                        </p>
                        <p className="text-[10px] text-text-muted opacity-70">
                            Use at your own risk. The creator is not responsible for any discrepancies or exam outcomes.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};
