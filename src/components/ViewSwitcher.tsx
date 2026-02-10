"use client";

import React from 'react';
import { useUI } from '@/context/UIContext';
import { cn } from '@/lib/utils';
import { LayoutGrid, List, Kanban } from 'lucide-react';

type ViewMode = 'grid' | 'list' | 'board';

export default function ViewSwitcher() {
    const { viewMode, setViewMode } = useUI();

    const views: { mode: ViewMode; icon: typeof LayoutGrid; label: string }[] = [
        { mode: 'grid', icon: LayoutGrid, label: 'Grid' },
        { mode: 'list', icon: List, label: 'List' },
        { mode: 'board', icon: Kanban, label: 'Board' },
    ];

    return (
        <div className="inline-flex items-center gap-1 p-1 bg-[var(--muted)] rounded-lg border border-[var(--border)]">
            {views.map((view) => (
                <button
                    key={view.mode}
                    onClick={() => setViewMode(view.mode)}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all active:scale-95",
                        viewMode === view.mode
                            ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]/50"
                    )}
                    aria-label={`Switch to ${view.label} view`}
                    title={`${view.label} view`}
                >
                    <view.icon size={14} />
                    <span className="hidden sm:inline">{view.label}</span>
                </button>
            ))}
        </div>
    );
}
