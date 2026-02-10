"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CheckSquare, Tag, Trash2, Plus, GripVertical, CheckCircle2, Circle } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { useProjects, Task } from '@/context/ProjectContext';
import { format, isPast, isToday, isTomorrow, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

export default function TaskDetailsModal() {
    const { selectedTask, closeTaskDetails } = useUI();
    const { projects, tasks, updateTask, addSubtask, toggleSubtask, deleteSubtask, deleteTask } = useProjects();
    const [subtaskInput, setSubtaskInput] = useState('');
    const [tagInput, setTagInput] = useState('');
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const titleRef = useRef<HTMLInputElement>(null);

    // Initial state
    const [localDescription, setLocalDescription] = useState('');
    const [localTitle, setLocalTitle] = useState('');

    // Fetch the LIVE task object from ProjectContext
    // selectedTask from UIContext might be stale
    const currentTask = selectedTask && tasks[selectedTask.projectId]?.find(t => t.id === selectedTask.task.id);

    useEffect(() => {
        if (currentTask) {
            setLocalDescription(currentTask.description || '');
            setLocalTitle(currentTask.text);
        }
    }, [currentTask]);

    if (!selectedTask || !currentTask) return null;

    const { projectId } = selectedTask;
    const task = currentTask; // Use the live task object

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLocalDescription(e.target.value);
    };

    const handleDescriptionBlur = () => {
        if (localDescription !== task.description) {
            updateTask(projectId, task.id, { description: localDescription });
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalTitle(e.target.value);
    };

    const handleTitleBlur = () => {
        if (localTitle !== task.text) {
            updateTask(projectId, task.id, { text: localTitle });
        }
    };

    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subtaskInput.trim()) return;
        addSubtask(projectId, task.id, subtaskInput);
        setSubtaskInput('');
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            const newTags = [...(task.tags || [])];
            if (!newTags.includes(tagInput.trim())) {
                newTags.push(tagInput.trim());
                updateTask(projectId, task.id, { tags: newTags });
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        const newTags = (task.tags || []).filter(t => t !== tagToRemove);
        updateTask(projectId, task.id, { tags: newTags });
    };

    const handleDeleteTask = () => {
        if (confirm('Are you sure you want to delete this task?')) {
            deleteTask(projectId, task.id);
            closeTaskDetails();
        }
    };

    const completionPercentage = task.subtasks && task.subtasks.length > 0
        ? Math.round((task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100)
        : 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={closeTaskDetails}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-[var(--border)] flex items-start justify-between gap-4 shrink-0 bg-[var(--surface)] z-10">
                        <div className="flex-1 flex gap-3 items-start">
                            <button
                                onClick={() => updateTask(projectId, task.id, { completed: !task.completed })}
                                className={cn(
                                    "mt-1.5 transition-all duration-300",
                                    task.completed ? "text-indigo-500 scale-110" : "text-[var(--muted-foreground)] hover:text-indigo-500 hover:scale-110"
                                )}
                            >
                                {task.completed ? <CheckCircle2 size={26} /> : <Circle size={26} />}
                            </button>
                            <div className="flex-1 space-y-1">
                                <input
                                    ref={titleRef}
                                    value={localTitle}
                                    onChange={handleTitleChange}
                                    onBlur={handleTitleBlur}
                                    className={cn(
                                        "text-2xl font-black tracking-tight bg-transparent border-none focus:outline-none w-full placeholder:text-[var(--muted-foreground)]/50",
                                        task.completed && "line-through text-[var(--muted-foreground)]"
                                    )}
                                    placeholder="Task title"
                                />
                                <div className="flex items-center gap-2 text-xs font-medium text-[var(--muted-foreground)]">
                                    <span className="bg-[var(--muted)] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                        {task.status || 'on-track'}
                                    </span>
                                    <span>•</span>
                                    <span>{format(new Date(task.dueDate || task.createdAt), 'MMM d, yyyy')}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={closeTaskDetails}
                            className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">

                        {/* Description */}
                        <div className="space-y-3 group">
                            <label className="text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)] flex items-center gap-2 group-focus-within:text-indigo-500 transition-colors">
                                <GripVertical size={14} className="opacity-50" />
                                Description
                            </label>
                            <textarea
                                ref={descriptionRef}
                                value={localDescription}
                                onChange={handleDescriptionChange}
                                onBlur={handleDescriptionBlur}
                                placeholder="Add detailed notes, requirements, or context..."
                                className="w-full bg-[var(--muted)]/30 border border-[var(--border)] rounded-xl p-4 min-h-[120px] focus:outline-none focus:border-indigo-500/50 focus:bg-[var(--surface)] focus:shadow-lg focus:shadow-indigo-500/5 resize-y text-sm leading-relaxed transition-all"
                            />
                        </div>

                        {/* Subtasks */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)] flex items-center gap-2">
                                    <CheckSquare size={14} className="text-emerald-500" />
                                    Subtasks
                                </label>
                                {task.subtasks && task.subtasks.length > 0 && (
                                    <span className="text-xs font-bold text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-0.5 rounded-full">
                                        {completionPercentage}% Done
                                    </span>
                                )}
                            </div>

                            {/* Progress Bar */}
                            {task.subtasks && task.subtasks.length > 0 && (
                                <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${completionPercentage}%` }}
                                        className={cn(
                                            "h-full transition-all duration-500",
                                            completionPercentage === 100 ? "bg-emerald-500" : "bg-indigo-500"
                                        )}
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <AnimatePresence initial={false}>
                                    {task.subtasks?.map(subtask => (
                                        <motion.div
                                            key={subtask.id}
                                            layout
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                            className="group flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--muted)]/50 transition-all border border-transparent hover:border-[var(--border)]"
                                        >
                                            <button
                                                onClick={() => toggleSubtask(projectId, task.id, subtask.id)}
                                                className={cn(
                                                    "shrink-0 transition-all duration-200 hover:scale-110",
                                                    subtask.completed ? "text-emerald-500" : "text-[var(--muted-foreground)] hover:text-emerald-500"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-5 h-5 border-2 rounded-md transition-all flex items-center justify-center",
                                                    subtask.completed ? "bg-emerald-500 border-emerald-500" : "border-[var(--muted-foreground)] bg-[var(--surface)]"
                                                )}>
                                                    {subtask.completed && <CheckSquare size={12} className="text-white" />}
                                                </div>
                                            </button>
                                            <span className={cn(
                                                "flex-1 text-sm font-medium transition-all",
                                                subtask.completed ? "line-through text-[var(--muted-foreground)]" : "text-[var(--foreground)]"
                                            )}>
                                                {subtask.text}
                                            </span>
                                            <button
                                                onClick={() => deleteSubtask(projectId, task.id, subtask.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                title="Delete Subtask"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <form onSubmit={handleAddSubtask} className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-[var(--border)] hover:border-indigo-500/50 hover:bg-[var(--muted)]/20 transition-all mt-2">
                                    <Plus size={18} className="text-indigo-500 shrink-0" />
                                    <input
                                        type="text"
                                        value={subtaskInput}
                                        onChange={(e) => setSubtaskInput(e.target.value)}
                                        placeholder="Add a new subtask..."
                                        className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium placeholder:text-[var(--muted-foreground)]/60"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!subtaskInput.trim()}
                                        className="text-xs font-bold bg-indigo-500 text-white px-3 py-1.5 rounded-lg opacity-0 disabled:opacity-0 focus:opacity-100 form-focus:opacity-100 transition-opacity"
                                        style={{ opacity: subtaskInput.trim() ? 1 : 0 }}
                                    >
                                        Add
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Tags & Metadata */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[var(--border)]">
                            {/* Tags */}
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)] flex items-center gap-2">
                                    <Tag size={14} />
                                    Tags
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {task.tags?.map(tag => (
                                        <div key={tag} className="bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-md text-xs font-bold text-indigo-600 flex items-center gap-1.5 group">
                                            {tag}
                                            <button onClick={() => removeTag(tag)} className="text-indigo-400 hover:text-indigo-700">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleAddTag}
                                        placeholder="+ Add tag"
                                        className="bg-[var(--muted)]/30 border border-transparent hover:border-[var(--border)] focus:border-indigo-500 focus:bg-[var(--surface)] text-xs rounded-md px-2.5 py-1 focus:outline-none transition-all min-w-[80px]"
                                    />
                                </div>
                            </div>

                            {/* Due Date */}
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)] flex items-center gap-2">
                                    <Calendar size={14} />
                                    Due Date
                                </label>
                                <div className="flex items-center gap-3 relative">
                                    <div className={cn(
                                        "px-3 py-1.5 rounded-lg text-sm font-bold border flex items-center gap-2 transition-colors cursor-pointer hover:border-indigo-500 hover:bg-[var(--surface)]",
                                        (task.dueDate ? isPast(new Date(task.dueDate)) : isPast(new Date(task.createdAt))) &&
                                            !(task.dueDate ? isToday(new Date(task.dueDate)) : isToday(new Date(task.createdAt)))
                                            ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                            (task.dueDate ? isToday(new Date(task.dueDate)) : isToday(new Date(task.createdAt)))
                                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                "bg-[var(--muted)]/50 text-[var(--foreground)] border-[var(--border)]"
                                    )}>
                                        <Calendar size={14} />
                                        {format(new Date(task.dueDate || task.createdAt), 'MMMM d, yyyy')}
                                    </div>
                                    <input
                                        type="date"
                                        className="absolute inset-0 opacity-0 w-auto min-w-[150px] cursor-pointer"
                                        style={{ width: '100%' }}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                updateTask(projectId, task.id, { dueDate: e.target.value });
                                            }
                                        }}
                                        value={(task.dueDate || task.createdAt).split('T')[0]}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-[var(--border)] bg-[var(--muted)]/10 flex justify-between items-center shrink-0 backdrop-blur-sm">
                        <span className="text-[10px] text-[var(--muted-foreground)] font-mono uppercase tracking-widest opacity-50">
                            ID: {task.id}
                        </span>
                        <button
                            onClick={handleDeleteTask}
                            className="bg-[var(--error)]/10 text-[var(--error)] hover:bg-[var(--error)] hover:text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 group"
                        >
                            <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                            Delete Task
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
