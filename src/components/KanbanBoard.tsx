"use client";

import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, Project } from '@/context/ProjectContext';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, GripVertical, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface KanbanBoardProps {
    project: Project;
    tasks: Task[];
    updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
    openTaskDetails: (task: Task, projectId: string) => void;
}

const COLUMNS = [
    { id: 'not-started', title: 'To Do', color: 'zinc' },
    { id: 'on-track', title: 'On Track', color: 'green' },
    { id: 'at-risk', title: 'At Risk', color: 'amber' },
    { id: 'delayed', title: 'Delayed', color: 'red' },
    { id: 'on-hold', title: 'On Hold', color: 'pink' },
    { id: 'completed', title: 'Completed', color: 'indigo' },
];

export default function KanbanBoard({ project, tasks, updateTask, openTaskDetails }: KanbanBoardProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const getTasksByStatus = (status: string) => {
        if (status === 'completed') return tasks.filter(t => t.completed);
        if (status === 'not-started') return tasks.filter(t => !t.completed && (!t.status || t.status === 'not-started'));
        return tasks.filter(t => !t.completed && t.status === status);
    };

    const onDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = tasks.find(t => t.id === active.id);
        if (task) setActiveTask(task);
    };

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId === overId) return;

        // Handle drop over a column
        const isOverAColumn = COLUMNS.some(col => col.id === overId);
        if (isOverAColumn) {
            const newStatus = overId as Task['status'] | 'completed';
            if (newStatus === 'completed') {
                updateTask(project.id, activeId, { completed: true });
            } else {
                updateTask(project.id, activeId, { completed: false, status: newStatus as Task['status'] });
            }
        }

        setActiveTask(null);
    };

    const onDragOver = (event: DragOverEvent) => {
        // Logic for moving between columns while dragging can be added here
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
        >
            <div className="flex gap-6 overflow-x-auto pb-6 min-h-[600px] custom-scrollbar">
                {COLUMNS.map(column => (
                    <KanbanColumn
                        key={column.id}
                        column={column}
                        tasks={getTasksByStatus(column.id)}
                        projectId={project.id}
                        openTaskDetails={openTaskDetails}
                    />
                ))}
            </div>

            <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                        active: {
                            opacity: '0.5',
                        },
                    },
                }),
            }}>
                {activeTask ? (
                    <div className="w-[300px]">
                        <TaskCard task={activeTask} isOverlay />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

function KanbanColumn({ column, tasks, projectId, openTaskDetails }: {
    column: typeof COLUMNS[0];
    tasks: Task[];
    projectId: string;
    openTaskDetails: (task: Task, projectId: string) => void;
}) {
    return (
        <div className="flex flex-col w-[300px] shrink-0 gap-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", {
                        "bg-zinc-400": column.color === 'zinc',
                        "bg-green-500": column.color === 'green',
                        "bg-amber-500": column.color === 'amber',
                        "bg-red-500": column.color === 'red',
                        "bg-pink-500": column.color === 'pink',
                        "bg-indigo-500": column.color === 'indigo',
                    })} />
                    <h3 className="text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                        {column.title}
                    </h3>
                    <span className="text-[10px] font-bold bg-[var(--muted)] px-1.5 py-0.5 rounded-md text-[var(--muted-foreground)]">
                        {tasks.length}
                    </span>
                </div>
            </div>

            <div className="flex-1 bg-[var(--muted)]/20 rounded-[2rem] p-3 border border-transparent hover:border-[var(--border)] transition-all flex flex-col gap-3">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <SortableTaskCard key={task.id} task={task} projectId={projectId} openTaskDetails={openTaskDetails} />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="h-20 border-2 border-dashed border-[var(--border)] rounded-[1.5rem] flex items-center justify-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/30">Drop here</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function SortableTaskCard({ task, projectId, openTaskDetails }: {
    task: Task;
    projectId: string;
    openTaskDetails: (task: Task, projectId: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="h-[100px] rounded-[1.5rem] bg-[var(--muted)]/50 border border-dashed border-[var(--border)] opacity-50"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="group"
        >
            <TaskCard
                task={task}
                dragHandleProps={listeners}
                onClick={() => openTaskDetails(task, projectId)}
            />
        </div>
    );
}

function TaskCard({ task, dragHandleProps, isOverlay, onClick }: {
    task: Task;
    dragHandleProps?: any;
    isOverlay?: boolean;
    onClick?: () => void;
}) {
    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'urgent': return "text-red-500";
            case 'high': return "text-orange-500";
            case 'medium': return "text-indigo-500";
            case 'low': return "text-emerald-500";
            default: return "text-zinc-500";
        }
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-[var(--surface)] border border-[var(--border)] rounded-[1.5rem] p-4 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer",
                isOverlay && "shadow-2xl ring-2 ring-indigo-500/50 rotate-2",
                task.completed && "opacity-60"
            )}
        >
            <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        {task.completed ? <CheckCircle2 size={16} className="text-indigo-500" /> : <Circle size={16} className="text-[var(--muted-foreground)]" />}
                        <span className={cn(
                            "text-sm font-bold tracking-tight",
                            task.completed && "line-through text-[var(--muted-foreground)]"
                        )}>
                            {task.text}
                        </span>
                    </div>
                    <div {...dragHandleProps} className="p-1 cursor-grab active:cursor-grabbing text-[var(--muted-foreground)] hover:text-[var(--foreground)] opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical size={14} />
                    </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                        {format(new Date(task.dueDate || task.createdAt), 'MMM d')}
                    </span>
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        getPriorityStyles(task.priority || 'medium')
                    )}>
                        {task.priority || 'medium'}
                    </span>
                </div>
            </div>
        </div>
    );
}
