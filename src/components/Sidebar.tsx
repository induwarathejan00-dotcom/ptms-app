"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProjects } from '@/context/ProjectContext';
import { useTheme } from '@/context/ThemeContext';
import { useUI } from '@/context/UIContext';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    ListTodo,
    CheckCircle2,
    Globe,
    Sun,
    Moon,
    ChevronLeft,
    ChevronRight,
    Star,
    Calendar // Added Calendar icon
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const { projects } = useProjects();
    const { sidebarCollapsed, toggleSidebar } = useUI();

    const navItems = [
        { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/tasks', icon: ListTodo, label: 'All Tasks' },
        { href: '/calendar', icon: Calendar, label: 'Calendar' }, // Updated to Calendar
    ];

    return (
        <div
            className={cn(
                "h-screen bg-[var(--surface)] border-r border-[var(--border)] fixed left-0 top-0 z-50 print:hidden transition-all duration-300",
                sidebarCollapsed ? "w-16" : "w-64"
            )}
        >
            <div className="p-4 flex flex-col h-full overflow-hidden">
                {/* Logo & Collapse Toggle */}
                <div className="flex items-center justify-between mb-8 flex-shrink-0">
                    {!sidebarCollapsed && (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent)] to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
                                <LayoutDashboard size={16} className="text-white" />
                            </div>
                            <span className="text-lg font-black tracking-tight text-[var(--foreground)]">PTMS</span>
                        </div>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className={cn(
                            "p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all active:scale-95",
                            sidebarCollapsed && "mx-auto"
                        )}
                        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>

                {/* Main Navigation */}
                <nav className="space-y-1 mb-6" role="navigation" aria-label="Main navigation">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group relative",
                                    pathname === item.href
                                        ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                                )}
                                role="button"
                                tabIndex={0}
                                aria-label={item.label}
                                aria-current={pathname === item.href ? 'page' : undefined}
                                title={sidebarCollapsed ? item.label : undefined}
                            >
                                <item.icon
                                    size={18}
                                    className={cn(
                                        "flex-shrink-0 transition-transform duration-200",
                                        pathname === item.href && "scale-110"
                                    )}
                                />
                                {!sidebarCollapsed && (
                                    <span className="font-semibold text-sm">{item.label}</span>
                                )}
                                {pathname === item.href && !sidebarCollapsed && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute right-2 w-1 h-4 bg-[var(--accent)] rounded-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </div>
                        </Link>
                    ))}
                </nav>

                {/* Favorites Section */}
                {!sidebarCollapsed && (
                    <div className="mb-4">
                        <div className="flex items-center gap-2 px-3 mb-2">
                            <Star size={10} className="text-[var(--muted-foreground)]" />
                            <h3 className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-wider">
                                Favorites
                            </h3>
                        </div>
                        <div className="space-y-0.5 overflow-y-auto max-h-32 custom-scrollbar pr-1 hidden sm:block">
                            {projects.filter(p => p.isFavorite).length > 0 ? (
                                projects.filter(p => p.isFavorite).map(project => (
                                    <Link key={project.id} href={`/project/${project.id}`}>
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-all">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                            <span className="truncate">{project.name}</span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-xs text-[var(--muted-foreground)] opacity-50 italic">
                                    Star a project to pin it here
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Projects Section */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {!sidebarCollapsed && (
                        <h3 className="px-3 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-wider mb-3 opacity-70">
                            Projects
                        </h3>
                    )}
                    <nav className="space-y-0.5 overflow-y-auto custom-scrollbar pr-1 flex-1">
                        {projects.map((project) => (
                            <Link key={project.id} href={`/project/${project.id}`}>
                                <div
                                    className={cn(
                                        "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all cursor-pointer group",
                                        pathname === `/project/${project.id}`
                                            ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                                    )}
                                    title={sidebarCollapsed ? project.name : undefined}
                                >
                                    <Globe
                                        size={14}
                                        className={cn(
                                            "flex-shrink-0",
                                            pathname === `/project/${project.id}` ? "text-[var(--accent)]" : "text-[var(--muted-foreground)]"
                                        )}
                                    />
                                    {!sidebarCollapsed && (
                                        <span className="font-semibold text-xs truncate">{project.name}</span>
                                    )}
                                    {pathname === `/project/${project.id}` && (
                                        <div className="ml-auto w-1 h-1 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                                    )}
                                </div>
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Footer - Theme Toggle */}
            <div className={cn(
                "mt-auto p-4 border-t border-[var(--border)] space-y-3",
                sidebarCollapsed && "px-2"
            )}>
                <button
                    onClick={toggleTheme}
                    className={cn(
                        "flex items-center w-full rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] transition-all duration-300 group border border-transparent hover:border-[var(--accent)]/30",
                        sidebarCollapsed ? "p-2 justify-center" : "px-3 py-2.5 justify-between"
                    )}
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    title={sidebarCollapsed ? (theme === 'dark' ? 'Daylight' : 'Midnight') : undefined}
                >
                    <div className="flex items-center gap-2.5">
                        {theme === 'dark' ? (
                            <Sun size={16} className="text-amber-400 group-hover:rotate-45 transition-transform" />
                        ) : (
                            <Moon size={16} className="text-[var(--accent)] group-hover:-rotate-12 transition-transform" />
                        )}
                        {!sidebarCollapsed && (
                            <span className="font-bold text-xs text-[var(--foreground)]">
                                {theme === 'dark' ? 'Daylight' : 'Midnight'}
                            </span>
                        )}
                    </div>
                    {!sidebarCollapsed && (
                        <div className={cn(
                            "w-7 h-3.5 rounded-full p-0.5 transition-colors duration-300",
                            theme === 'dark' ? "bg-[var(--accent)]" : "bg-zinc-300"
                        )}>
                            <div className={cn(
                                "w-2.5 h-2.5 rounded-full bg-white transition-transform duration-300",
                                theme === 'dark' ? "translate-x-3.5" : "translate-x-0"
                            )} />
                        </div>
                    )}
                </button>
                {!sidebarCollapsed && (
                    <div className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-2 px-1">
                        <div className="w-1 h-1 rounded-full bg-[var(--success)] animate-pulse shadow-[0_0_6px_var(--success)]" />
                        Active
                    </div>
                )}
            </div>
        </div>
    );
}
