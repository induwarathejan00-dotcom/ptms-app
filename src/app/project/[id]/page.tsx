"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useProjects, Task, Project } from '@/context/ProjectContext';
import { cn } from '@/lib/utils';
import {
    Plus,
    Trash2,
    CheckCircle2,
    Circle,
    Calendar,
    ChevronRight,
    FileText,
    Download,
    Search,
    Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface TaskItemProps {
    task: Task;
    project: Project;
    toggleTask: (projectId: string, taskId: string) => void;
    deleteTask: (projectId: string, taskId: string) => void;
    updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
    openTaskDetails: (task: Task, projectId: string) => void; // Added
}

const TaskItem = ({ task, project, toggleTask, deleteTask, updateTask, openTaskDetails }: TaskItemProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(task.text);
    const [editDate, setEditDate] = useState(task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : format(new Date(task.createdAt), 'yyyy-MM-dd'));
    const [editPriority, setEditPriority] = useState<Task['priority']>(task.priority || 'medium');
    const [editStatus, setEditStatus] = useState<Task['status']>(task.status || 'on-track');

    const handleSave = () => {
        updateTask(project.id, task.id, {
            text: editText,
            dueDate: new Date(editDate).toISOString(),
            priority: editPriority,
            status: editStatus
        });
        setIsEditing(false);
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'on-track': return "bg-green-500/10 text-green-500 border-green-500/20";
            case 'at-risk': return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            case 'delayed': return "bg-red-500/10 text-red-500 border-red-500/20";
            case 'on-hold': return "bg-pink-500/10 text-pink-500 border-pink-500/20";
            default: return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
        }
    };

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'urgent': return "bg-red-500 text-white";
            case 'high': return "bg-orange-500 text-white";
            case 'medium': return "bg-indigo-500 text-white";
            case 'low': return "bg-emerald-500 text-white";
            default: return "bg-zinc-700 text-white";
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
                "group flex items-center justify-between p-5 rounded-[1.5rem] border transition-all duration-300",
                task.completed
                    ? "bg-[var(--muted)]/50 border-[var(--border)] opacity-60"
                    : "bg-[var(--surface)] border-[var(--border)] hover:border-indigo-500/50 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5"
            )}
        >
            <div className="flex items-center gap-4 flex-1">
                {!isEditing ? (
                    <>
                        <button
                            onClick={() => toggleTask(project.id, task.id)}
                            className={cn(
                                "transition-all duration-300 transform group-hover:scale-110",
                                task.completed ? "text-indigo-500" : "text-[var(--muted-foreground)] group-hover:text-indigo-500"
                            )}
                        >
                            {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                        </button>
                        <div className="flex flex-col items-start gap-1">
                            <button
                                onClick={() => openTaskDetails(task, project.id)}
                                className={cn(
                                    "text-lg font-bold transition-all duration-300 flex items-center gap-3 tracking-tight hover:text-indigo-500 text-left",
                                    task.completed ? "line-through text-[var(--muted-foreground)]" : "text-[var(--foreground)]"
                                )}
                            >
                                {task.text}
                            </button>
                            {!task.completed && (
                                <div className="flex items-center gap-2">
                                    {task.status && task.status !== 'on-track' && (
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                            getStatusStyles(task.status)
                                        )}>
                                            {task.status.replace('-', ' ')}
                                        </span>
                                    )}
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm",
                                        getPriorityStyles(task.priority || 'medium')
                                    )}>
                                        {task.priority || 'medium'}
                                    </span>
                                </div>
                            )}
                            {task.completed && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                    Completed
                                </span>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-4">
                        <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)] focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                            autoFocus
                        />
                        <div className="flex items-center gap-2">
                            <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value as Task['status'])}
                                className={cn(
                                    "bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none transition-all",
                                    getStatusStyles(editStatus || 'on-track')
                                )}
                            >
                                <option value="on-track" className="text-zinc-900 bg-white">On Track</option>
                                <option value="at-risk" className="text-zinc-900 bg-white">At Risk</option>
                                <option value="delayed" className="text-zinc-900 bg-white">Delayed</option>
                                <option value="on-hold" className="text-zinc-900 bg-white">On Hold</option>
                            </select>
                            <select
                                value={editPriority}
                                onChange={(e) => setEditPriority(e.target.value as Task['priority'])}
                                className={cn(
                                    "bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none transition-all",
                                    getPriorityStyles(editPriority || 'medium')
                                )}
                            >
                                <option value="low" className="text-zinc-900 bg-white">Low</option>
                                <option value="medium" className="text-zinc-900 bg-white">Medium</option>
                                <option value="high" className="text-zinc-900 bg-white">High</option>
                                <option value="urgent" className="text-zinc-900 bg-white">Urgent</option>
                            </select>
                            <input
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className="bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--muted-foreground)] focus:outline-none font-mono"
                            />
                        </div>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2 ml-4">
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-xl transition-all active:scale-95"
                    >
                        <FileText size={18} />
                    </button>
                ) : (
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                    >
                        Save
                    </button>
                )}
                <button
                    onClick={() => deleteTask(project.id, task.id)}
                    className="p-2.5 text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-95"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </motion.div>
    );
};

import { useUI } from '@/context/UIContext';
import KanbanBoard from '@/components/KanbanBoard';
import ViewSwitcher from '@/components/ViewSwitcher';

export default function ProjectPage() {
    const { id } = useParams();
    const { projects, tasks, addTask, toggleTask, deleteTask, updateTask, getTasksByMonth } = useProjects();
    const { openTaskDetails, viewMode } = useUI();
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskDate, setNewTaskDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

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

    const project = projects.find(p => p.id === id);
    if (!project) return <div>Project not found</div>;

    const projectTasks = tasks[project.id] || [];
    const reportTasks = getTasksByMonth(project.id, selectedMonth);

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskText.trim() && project) {
            addTask(project.id, newTaskText.trim(), new Date(newTaskDate).toISOString(), newTaskPriority);
            setNewTaskText('');
            setNewTaskPriority('medium');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const isToday = (dateStr: string) => {
        return format(new Date(dateStr), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    };

    const todayTasks = projectTasks.filter(t => isToday(t.dueDate || t.createdAt));
    const roadmapTasks = projectTasks.filter(t => !isToday(t.dueDate || t.createdAt));

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            <div className="p-8 max-w-5xl mx-auto print:p-0 print:max-w-none">
                {/* Breadcrumbs - Hidden on Print */}
                <div className="flex items-center gap-2 text-[var(--muted-foreground)] text-[10px] font-black uppercase tracking-widest mb-6 print:hidden">
                    <span>Projects</span>
                    <ChevronRight size={10} className="text-[var(--muted-foreground)]/30" />
                    <span className="text-indigo-500">{project.name}</span>
                </div>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 print:mb-4">
                    <div className="print:hidden">
                        <h1 className="text-4xl font-black text-[var(--foreground)] mb-2 tracking-tight uppercase">{project.name} Execution</h1>
                        <p className="text-[var(--muted-foreground)] flex items-center gap-2 font-medium">
                            <Globe size={14} className="text-indigo-500" />
                            Targeting <span className="text-[var(--foreground)] font-bold">{project.audience}</span> audience
                        </p>
                    </div>
                    <div className="print:hidden">
                        <ViewSwitcher />
                    </div>
                </div>


                {/* Unified Roadmap & Tracker */}
                <div className="space-y-12">
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-10 shadow-xl relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/5">
                        <div className="flex items-start justify-between mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--foreground)] mb-2 tracking-tight uppercase">Strategy & Execution</h2>
                                <p className="text-[var(--muted-foreground)] text-sm font-medium">Coordinate your roadmap and daily milestones in one unified view.</p>
                            </div>
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-6 py-3 bg-[var(--muted)] hover:bg-indigo-500/10 text-[var(--foreground)] hover:text-indigo-500 border border-[var(--border)] rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 print:hidden shadow-sm"
                            >
                                <Download size={16} />
                                Export Roadmap
                            </button>
                        </div>

                        {/* Task Input */}
                        <form onSubmit={handleAddTask} className="flex flex-col md:flex-row gap-4 mb-12 print:hidden">
                            <div className="relative flex-1 group">
                                <input
                                    type="text"
                                    value={newTaskText}
                                    onChange={(e) => setNewTaskText(e.target.value)}
                                    placeholder="Define a new milestone or task..."
                                    className="w-full bg-[var(--muted)]/50 border border-[var(--border)] rounded-[1.25rem] py-4 pl-14 pr-4 text-lg font-bold text-[var(--foreground)] focus:outline-none focus:border-indigo-500 transition-all placeholder:text-[var(--muted-foreground)]/40 shadow-inner"
                                />
                                <Plus className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500" size={24} />
                            </div>
                            <div className={cn(
                                "relative group min-w-[160px] rounded-[1.25rem] border transition-all overflow-hidden shadow-sm",
                                getPriorityStyles(newTaskPriority || 'medium')
                            )}>
                                <select
                                    value={newTaskPriority}
                                    onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
                                    className="w-full bg-transparent py-4 pl-5 pr-10 text-[10px] font-black uppercase tracking-[0.2em] text-transparent focus:outline-none appearance-none cursor-pointer"
                                >
                                    <option value="low" className="text-zinc-900 bg-white">Priority: Low</option>
                                    <option value="medium" className="text-zinc-900 bg-white">Priority: Medium</option>
                                    <option value="high" className="text-zinc-900 bg-white">Priority: High</option>
                                    <option value="urgent" className="text-zinc-900 bg-white">Priority: Urgent</option>
                                </select>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                        {newTaskPriority || 'medium'}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.25rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                            >
                                Add Item
                            </button>
                        </form>

                        <div className="space-y-16">
                            {viewMode === 'board' ? (
                                <KanbanBoard
                                    project={project}
                                    tasks={projectTasks}
                                    updateTask={updateTask}
                                    openTaskDetails={openTaskDetails}
                                />
                            ) : (
                                <>
                                    {/* Today's Section */}
                                    <section className="space-y-6">
                                        <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] flex items-center gap-4">
                                            <span className="w-12 h-[2px] bg-indigo-500/20" />
                                            Today's Focus ({todayTasks.length})
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            {todayTasks.length === 0 ? (
                                                <div className="py-12 text-center text-[var(--muted-foreground)]/40 text-[10px] font-black uppercase tracking-widest border-2 border-dashed border-[var(--border)] rounded-[1.5rem]">
                                                    No tasks allocated for today.
                                                </div>
                                            ) : (
                                                todayTasks.map((task) => (
                                                    <TaskItem key={task.id} task={task} project={project} toggleTask={toggleTask} deleteTask={deleteTask} updateTask={updateTask} openTaskDetails={openTaskDetails} />
                                                ))
                                            )}
                                        </div>
                                    </section>

                                    {/* Roadmap Section */}
                                    <section className="space-y-6">
                                        <h3 className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.4em] flex items-center gap-4">
                                            <span className="w-12 h-[2px] bg-[var(--border)]" />
                                            Future Milestones & Roadmap ({roadmapTasks.length})
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            {roadmapTasks.length === 0 ? (
                                                <div className="py-12 text-center text-[var(--muted-foreground)]/40 text-[10px] font-black uppercase tracking-widest border-2 border-dashed border-[var(--border)] rounded-[1.5rem]">
                                                    No future milestones scheduled.
                                                </div>
                                            ) : (
                                                roadmapTasks.map((task) => (
                                                    <TaskItem key={task.id} task={task} project={project} toggleTask={toggleTask} deleteTask={deleteTask} updateTask={updateTask} openTaskDetails={openTaskDetails} />
                                                ))
                                            )}
                                        </div>
                                    </section>
                                </>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

