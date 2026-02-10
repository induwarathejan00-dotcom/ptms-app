"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProjectLogoProps {
    logoUrl?: string;
    name: string;
    isCompleted: boolean;
    className?: string;
}

export default function ProjectLogo({ logoUrl, name, isCompleted, className }: ProjectLogoProps) {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    if (logoUrl && !error) {
        return (
            <div className={cn("bg-white border border-[var(--border)] p-2 flex items-center justify-center overflow-hidden shrink-0 relative", className)}>
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white">
                        <div className="w-4 h-4 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                )}
                <img
                    src={logoUrl}
                    alt={`${name} logo`}
                    className="max-w-full max-h-full object-contain"
                    onError={() => {
                        setError(true);
                        setLoading(false);
                    }}
                    onLoad={() => setLoading(false)}
                />
            </div>
        );
    }

    return (
        <div className={cn(
            "flex items-center justify-center border transition-all shrink-0",
            isCompleted ? "bg-emerald-500/10 border-emerald-500/20" : "bg-indigo-500/10 border-indigo-500/20",
            className
        )}>
            <div className="relative">
                <div className={cn(
                    "w-1/2 h-1/2 border-2 rounded-md rotate-45 absolute -top-1 -left-1",
                    isCompleted ? "border-emerald-500/30" : "border-indigo-500/30"
                )} />
                <div className={cn(
                    "w-1/2 h-1/2 border-2 rounded-md rotate-45",
                    isCompleted ? "border-emerald-500/60" : "border-indigo-500/60"
                )} />
            </div>
        </div>
    );
}
