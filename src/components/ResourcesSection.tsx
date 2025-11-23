import React from 'react';
import { ExternalLink, Youtube, BookOpen } from 'lucide-react';
import { resources } from '../data/resources';

export const ResourcesSection: React.FC = () => {
    return (
        <section id="resources" className="mt-16 space-y-6">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="text-primary" />
                Study Resources
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {resources.map((resource, index) => (
                    <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-4 rounded-xl border border-slate-800 bg-surface/50 hover:border-primary/50 hover:bg-surface transition-all duration-300"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="p-2 rounded-lg bg-slate-900 text-primary group-hover:scale-110 transition-transform">
                                {resource.type === 'Video' ? <Youtube size={20} /> : <BookOpen size={20} />}
                            </div>
                            <ExternalLink size={16} className="text-slate-500 group-hover:text-primary transition-colors" />
                        </div>

                        <h3 className="font-semibold text-slate-200 group-hover:text-primary transition-colors mb-1">
                            {resource.title}
                        </h3>

                        {resource.author && (
                            <p className="text-sm text-slate-500">
                                by {resource.author}
                            </p>
                        )}
                    </a>
                ))}
            </div>
        </section>
    );
};
