"use client";

import React, { useState } from 'react';
import { useProjects } from '@/context/ProjectContext';
import { cn } from '@/lib/utils';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Plus,
    Clock
} from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday,
    parseISO,
    isValid
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useUI } from '@/context/UIContext'; // Added

export default function CalendarPage() {
    const { projects, tasks } = useProjects();
    const { openTaskDetails } = useUI(); // Added
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const jumpToToday = () => setCurrentDate(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Helper to get color for a project (deterministic based on index)
    const getProjectColor = (projectId: string) => {
        const colors = [
            'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
            'bg-cyan-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-lime-500'
        ];
        const index = projects.findIndex(p => p.id === projectId);
        return colors[index % colors.length] || 'bg-gray-500';
    };

    const getTasksForDay = (day: Date) => {
        const dayTasks: any[] = [];
        Object.entries(tasks).forEach(([projectId, projectTasks]) => {
            const project = projects.find(p => p.id === projectId);
            if (!project) return;

            projectTasks.forEach(task => {
                const taskDate = parseISO(task.createdAt);
                if (isValid(taskDate) && isSameDay(taskDate, day)) {
                    dayTasks.push({
                        ...task,
                        projectId,
                        projectName: project.name,
                        projectColor: getProjectColor(projectId)
                    });
                }
            });
        });
        return dayTasks;
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col h-[calc(100vh-3.5rem)]">
            <div className="p-6 md:p-10 flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Calendar</h1>
                            <span className="bg-[var(--surface)] border border-[var(--border)] text-[var(--muted-foreground)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <CalendarIcon size={12} />
                                {format(currentDate, 'MMMM yyyy')}
                            </span>
                        </div>
                        <p className="text-[var(--muted-foreground)] text-sm font-medium">Visualize your project timeline and task deadlines</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={prevMonth}
                            className="p-2 rounded-lg hover:bg-[var(--muted)] border border-[var(--border)] hover:border-[var(--foreground)] transition-all"
                            aria-label="Previous Month"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={jumpToToday}
                            className="px-4 py-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--muted)] border border-[var(--border)] text-sm font-bold transition-all"
                        >
                            Today
                        </button>
                        <button
                            onClick={nextMonth}
                            className="p-2 rounded-lg hover:bg-[var(--muted)] border border-[var(--border)] hover:border-[var(--foreground)] transition-all"
                            aria-label="Next Month"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] shadow-xl overflow-hidden flex flex-col h-full min-h-0">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--muted)]/5 shrink-0">
                        {weekDays.map(day => (
                            <div key={day} className="py-3 text-center text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Cells */}
                    <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto">
                        {days.map((day, dayIdx) => {
                            const dayTasks = getTasksForDay(day);
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isTodayDate = isToday(day);

                            return (
                                <div
                                    key={day.toString()}
                                    className={cn(
                                        "min-h-[120px] p-2 border-b border-r border-[var(--border)] relative group transition-colors hover:bg-[var(--muted)]/20 flex flex-col gap-1",
                                        !isCurrentMonth && "bg-[var(--muted)]/10 text-[var(--muted-foreground)] opacity-50",
                                        isTodayDate && "bg-indigo-500/5"
                                    )}
                                    onClick={() => setSelectedDate(day)}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={cn(
                                            "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full",
                                            isTodayDate ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "text-[var(--muted-foreground)]"
                                        )}>
                                            {format(day, dateFormat)}
                                        </span>
                                        {dayTasks.length > 0 && (
                                            <span className="text-[10px] font-bold text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity">
                                                {dayTasks.length} {dayTasks.length === 1 ? 'Task' : 'Tasks'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                                        {dayTasks.slice(0, 4).map((task) => (
                                            <button
                                                key={task.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openTaskDetails(task, task.projectId);
                                                }}
                                                className="w-full text-left"
                                            >
                                                <div
                                                    className={cn(
                                                        "text-[10px] px-2 py-1 rounded-md truncate cursor-pointer transition-transform hover:scale-[1.02] flex items-center gap-1.5 border border-transparent hover:border-black/5 dark:hover:border-white/10",
                                                        task.completed
                                                            ? "bg-[var(--muted)] text-[var(--muted-foreground)] line-through opacity-70"
                                                            : `${task.projectColor}/10 text-[var(--foreground)]`
                                                    )}
                                                    title={`${task.text} (${task.projectName})`}
                                                >
                                                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", task.projectColor)} />
                                                    <span className="truncate flex-1">{task.text}</span>
                                                </div>
                                            </button>
                                        ))}
                                        {dayTasks.length > 4 && (
                                            <div className="text-[10px] text-[var(--muted-foreground)] text-center font-medium mt-auto">
                                                +{dayTasks.length - 4} more
                                            </div>
                                        )}
                                    </div>

                                    {/* Hover visual cue */}
                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[var(--accent)]/0 to-transparent group-hover:via-[var(--accent)]/50 transition-all" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
