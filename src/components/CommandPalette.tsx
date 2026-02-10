"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ArrowRight, LayoutGrid, ListTodo, FileText } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { useProjects } from '@/context/ProjectContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function CommandPalette() {
    const { isSearchOpen, closeSearch } = useUI();
    const { projects } = useProjects();
    const router = useRouter();
    const [query, setQuery] = useState('');

    // Handle keyboard shortcuts (Cmd+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                isSearchOpen ? closeSearch() : window.dispatchEvent(new CustomEvent('open-search'));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSearchOpen, closeSearch]);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase())
    );

    const handleSelect = (path: string) => {
        closeSearch();
        router.push(path);
        setQuery('');
    };

    return (
        <AnimatePresence>
            {isSearchOpen && (
                <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                        onClick={closeSearch}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden relative flex flex-col"
                    >
                        <div className="flex items-center px-4 border-b border-[var(--border)]">
                            <Search size={20} className="text-[var(--muted-foreground)] ml-2" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search projects or navigation..."
                                className="w-full px-4 py-4 text-lg bg-transparent border-none focus:outline-none placeholder:text-[var(--muted-foreground)]/50"
                                autoFocus
                            />
                            <div className="px-2 py-1 rounded bg-[var(--muted)] text-[var(--muted-foreground)] text-[10px] font-bold uppercase tracking-wider">
                                Esc
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-2">
                            {/* Navigation Group */}
                            <div className="px-2 py-1.5 text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                                Navigation
                            </div>
                            <button
                                onClick={() => handleSelect('/')}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-all group text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <LayoutGrid size={18} className="text-[var(--muted-foreground)] group-hover:text-[var(--accent)]" />
                                    <span className="font-semibold text-sm">Dashboard</span>
                                </div>
                                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <button
                                onClick={() => handleSelect('/tasks')}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-all group text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <ListTodo size={18} className="text-[var(--muted-foreground)] group-hover:text-[var(--accent)]" />
                                    <span className="font-semibold text-sm">All Tasks</span>
                                </div>
                                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>

                            {/* Projects Group */}
                            {filteredProjects.length > 0 && (
                                <>
                                    <div className="mt-4 px-2 py-1.5 text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider border-t border-[var(--border)] pt-4">
                                        Projects
                                    </div>
                                    {filteredProjects.map(project => (
                                        <button
                                            key={project.id}
                                            onClick={() => handleSelect(`/project/${project.id}`)}
                                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-all group text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText size={18} className="text-[var(--muted-foreground)] group-hover:text-[var(--accent)]" />
                                                <span className="font-semibold text-sm">{project.name}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider bg-[var(--muted)] px-2 py-0.5 rounded">
                                                Jump to
                                            </span>
                                        </button>
                                    ))}
                                </>
                            )}

                            {query && filteredProjects.length === 0 && (
                                <div className="py-8 text-center text-[var(--muted-foreground)]">
                                    No results found for "{query}"
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
