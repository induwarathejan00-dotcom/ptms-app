"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useProjects } from '@/context/ProjectContext';
import {
    Search,
    Bell,
    Settings,
    ChevronRight,
    Command,
    Plus,
    LayoutGrid,
    Star
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useUI } from '@/context/UIContext';

import { useNotifications } from '@/context/NotificationContext';

export default function TopBar() {
    const pathname = usePathname();
    const { projects, toggleProjectFavorite } = useProjects();
    const { openProjectModal, openSettingsModal, openNotificationsPanel, openSearch } = useUI();
    const { unreadCount } = useNotifications();
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Generate breadcrumbs based on current path
    const getBreadcrumbs = () => {
        const segments = pathname.split('/').filter(Boolean);
        const breadcrumbs: { label: string; href: string }[] = [];

        if (pathname === '/') {
            breadcrumbs.push({ label: 'Dashboard', href: '/' });
        } else if (pathname === '/tasks') {
            breadcrumbs.push({ label: 'Dashboard', href: '/' });
            breadcrumbs.push({ label: 'All Tasks', href: '/tasks' });
        } else if (pathname === '/reports') {
            breadcrumbs.push({ label: 'Dashboard', href: '/' });
            breadcrumbs.push({ label: 'Master Report', href: '/reports' });
        } else if (segments[0] === 'project' && segments[1]) {
            const project = projects.find(p => p.id === segments[1]);
            breadcrumbs.push({ label: 'Dashboard', href: '/' });
            breadcrumbs.push({ label: project?.name || 'Project', href: `/project/${segments[1]}` });
        }

        return breadcrumbs;
    };

    const breadcrumbs = getBreadcrumbs();
    const currentProjectId = pathname.split('/')[1] === 'project' ? pathname.split('/')[2] : null;
    const currentProject = projects.find(p => p.id === currentProjectId);

    return (
        <div className="h-14 bg-[var(--surface)] border-b border-[var(--border)] fixed top-0 left-0 right-0 z-40 print:hidden transition-colors">
            <div className="h-full flex items-center justify-between px-6 gap-6">
                {/* Left: Breadcrumbs */}
                <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 text-sm overflow-x-auto scrollbar-hide">
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={crumb.href}>
                                <Link
                                    href={crumb.href}
                                    className={cn(
                                        "font-semibold whitespace-nowrap transition-colors hover:text-[var(--accent)]",
                                        index === breadcrumbs.length - 1
                                            ? "text-[var(--foreground)]"
                                            : "text-[var(--muted-foreground)]"
                                    )}
                                >
                                    {crumb.label}
                                </Link>
                                {index < breadcrumbs.length - 1 && (
                                    <ChevronRight size={14} className="text-[var(--muted-foreground)] opacity-40" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Center: Search */}
                <div className="flex-1 max-w-md cursor-pointer" onClick={openSearch}>
                    <div
                        className={cn(
                            "relative group transition-all pointer-events-none",
                            isSearchFocused && "scale-[1.02]"
                        )}
                    >
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] transition-colors group-focus-within:text-[var(--accent)]"
                        />
                        <input
                            type="text"
                            placeholder="Search tasks, projects... (Cmd+K)"
                            readOnly
                            className="w-full h-9 bg-[var(--muted)] border border-[var(--border)] rounded-lg pl-9 pr-16 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--background)] transition-all cursor-pointer"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-[var(--muted-foreground)]">
                            <Command size={10} />
                            <span>K</span>
                        </div>
                    </div>
                </div>

                {/* Right: Quick Actions */}
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <button
                            className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all active:scale-95"
                            aria-label="Dashboard"
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </Link>
                    {currentProjectId && (
                        <button
                            onClick={() => toggleProjectFavorite(currentProjectId)}
                            className={cn(
                                "p-2 rounded-lg hover:bg-[var(--muted)] transition-all active:scale-95",
                                currentProject?.isFavorite ? "text-amber-400" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                            )}
                            aria-label="Toggle Favorite"
                        >
                            <Star size={18} fill={currentProject?.isFavorite ? "currentColor" : "none"} />
                        </button>
                    )}
                    <button
                        onClick={openNotificationsPanel}
                        className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all active:scale-95 relative"
                        aria-label="Notifications"
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--error)] rounded-full animate-pulse" />
                        )}
                    </button>
                    <button
                        onClick={openSettingsModal}
                        className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all active:scale-95"
                        aria-label="Settings"
                    >
                        <Settings size={18} />
                    </button>

                    <div className="w-px h-6 bg-[var(--border)] mx-1" />

                    <button
                        onClick={openProjectModal}
                        className="flex items-center gap-2 px-3 h-9 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white rounded-lg font-semibold text-sm transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/20">
                        <Plus size={16} />
                        <span className="hidden sm:inline">New</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
