"use client";

import React, { useState } from 'react';
import { useProjects, Task, Project } from '@/context/ProjectContext';
import { cn } from '@/lib/utils';
import {
    CheckCircle2,
    Circle,
    Search,
    Filter,
    Calendar,
    ChevronRight,
    LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import Link from 'next/link';
import { useUI } from '@/context/UIContext'; // Added

export default function AllTasksPage() {
    const { projects, tasks, toggleTask } = useProjects();
    const { openTaskDetails } = useUI(); // Added
    const [searchQuery, setSearchQuery] = useState('');

    const getAllTasks = () => {
        let all: (Task & { projectName: string; projectId: string })[] = [];
        projects.forEach(project => {
            const projectTasks = tasks[project.id] || [];
            projectTasks.forEach(task => {
                all.push({ ...task, projectName: project.name, projectId: project.id });
            });
        });
        return all.sort((a, b) => new Date(b.dueDate || b.createdAt).getTime() - new Date(a.dueDate || a.createdAt).getTime());
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'on-track': return "bg-green-500/10 text-green-500 border-green-500/20";
            case 'at-risk': return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case 'delayed': return "bg-red-500/10 text-red-500 border-red-500/20";
            case 'on-hold': return "bg-pink-500/10 text-pink-500 border-pink-500/20";
            default: return "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]";
        }
    };

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'urgent': return "bg-red-500 text-white";
            case 'high': return "bg-orange-500 text-white";
            case 'medium': return "bg-indigo-500 text-white";
            case 'low': return "bg-emerald-500 text-white";
            default: return "bg-[var(--muted)] text-[var(--muted-foreground)]";
        }
    };

    const allTasks = getAllTasks();
    const filteredTasks = allTasks.filter(t =>
        t.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.projectName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            <div className="p-10 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">All Tasks</h1>
                            <span className="bg-[var(--surface)] border border-[var(--border)] text-[var(--muted-foreground)] px-3 py-1 rounded-full text-xs font-bold">
                                {allTasks.length}
                            </span>
                        </div>
                        <p className="text-[var(--muted-foreground)] text-sm font-medium">Aggregated task list from all projects</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
                            <input
                                type="text"
                                placeholder="Search tasks or projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-80 bg-[var(--surface)] border border-[var(--border)] rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder:text-[var(--muted-foreground)]/60 shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredTasks.length === 0 ? (
                        <div className="text-center py-20 bg-[var(--surface)] rounded-[2rem] border border-dashed border-[var(--border)]">
                            <p className="text-[var(--muted-foreground)] font-medium">No tasks found.</p>
                            <p className="text-[var(--muted-foreground)]/60 text-sm mt-1">Tasks you add in individual project workspaces will appear here.</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredTasks.map((task) => (
                                <motion.div
                                    key={`${task.projectId}-${task.id}`}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={cn(
                                        "group flex items-center justify-between p-5 rounded-[1.5rem] border transition-all duration-300",
                                        task.completed
                                            ? "bg-[var(--muted)]/50 border-[var(--border)] opacity-60"
                                            : "bg-[var(--surface)] border-[var(--border)] hover:border-indigo-500/50 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5"
                                    )}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <button
                                            onClick={() => toggleTask(task.projectId, task.id)}
                                            className={cn(
                                                "transition-all duration-300 transform group-hover:scale-110",
                                                task.completed ? "text-indigo-500" : "text-[var(--muted-foreground)] group-hover:text-indigo-500"
                                            )}
                                        >
                                            {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                        </button>
                                        <div className="flex flex-col items-start text-left">
                                            <button
                                                onClick={() => openTaskDetails(task, task.projectId)}
                                                className={cn(
                                                    "text-lg font-bold transition-all duration-300 tracking-tight hover:text-indigo-500 text-left",
                                                    task.completed ? "line-through text-[var(--muted-foreground)]" : "text-[var(--foreground)]"
                                                )}
                                            >
                                                {task.text}
                                            </button>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Link href={`/project/${task.projectId}`} className="text-[10px] text-indigo-500 hover:text-indigo-600 flex items-center gap-1 font-black uppercase tracking-widest">
                                                    {task.projectName}
                                                    <ChevronRight size={10} />
                                                </Link>
                                                <span className="text-[10px] text-[var(--muted-foreground)]/30">•</span>
                                                <span className="text-[10px] text-[var(--muted-foreground)] font-mono uppercase tracking-widest">
                                                    {format(new Date(task.dueDate || task.createdAt), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {task.completed && (
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                                Completed
                                            </span>
                                        )}
                                        {!task.completed && (
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm",
                                                getPriorityStyles(task.priority || 'medium')
                                            )}>
                                                {task.priority || 'medium'}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}
