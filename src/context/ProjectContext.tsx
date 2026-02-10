"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Subtask {
    id: string;
    text: string;
    completed: boolean;
}

export interface Task {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    status?: 'on-track' | 'at-risk' | 'delayed' | 'on-hold' | 'not-started';
    description?: string; // Added
    subtasks?: Subtask[]; // Added
    tags?: string[]; // Added
    dueDate?: string; // Added
}

export interface Project {
    id: string;
    name: string;
    url: string;
    audience: string;
    isFavorite?: boolean;
    status: 'not-started' | 'on-track' | 'at-risk' | 'delayed' | 'on-hold';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    startDate: string;
    endDate: string;
    logoUrl?: string;
}

interface ProjectContextType {
    projects: Project[];
    tasks: Record<string, Task[]>;
    addTask: (projectId: string, text: string, dueDate?: string, priority?: Task['priority'], status?: Task['status']) => void;
    updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
    addProject: (project: Omit<Project, 'id'>) => void;
    updateProject: (projectId: string, updates: Partial<Project>) => void;
    deleteProject: (id: string) => void;
    toggleTask: (projectId: string, taskId: string) => void;
    deleteTask: (projectId: string, taskId: string) => void;
    getTasksByMonth: (projectId: string, month: string) => Task[];
    toggleProjectFavorite: (id: string) => void;
    addSubtask: (projectId: string, taskId: string, text: string) => void;
    toggleSubtask: (projectId: string, taskId: string, subtaskId: string) => void;
    deleteSubtask: (projectId: string, taskId: string, subtaskId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const INITIAL_PROJECTS: Project[] = [];

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
    const [tasks, setTasks] = useState<Record<string, Task[]>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/projects');
                const data = await res.json();

                if (!Array.isArray(data)) return;

                const loadedProjects: Project[] = data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    url: p.url,
                    audience: p.audience,
                    isFavorite: p.isFavorite,
                    status: p.status,
                    priority: p.priority,
                    startDate: p.startDate,
                    endDate: p.endDate,
                    logoUrl: p.logoUrl,
                }));

                const loadedTasks: Record<string, Task[]> = {};
                data.forEach((p: any) => {
                    loadedTasks[p.id] = p.tasks.map((t: any) => ({
                        ...t,
                        tags: t.tags.map((tag: any) => tag.text),
                    }));
                });

                setProjects(loadedProjects);
                setTasks(loadedTasks);
            } catch (error) {
                console.error('Failed to load data from API:', error);
            }
        };
        fetchData();
    }, []);

    const addProject = async (project: Omit<Project, 'id'>) => {
        const id = project.name.toLowerCase().replace(/\s+/g, '-');
        const exists = projects.find(p => p.id === id);
        const finalId = exists ? `${id}-${Date.now()}` : id;

        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...project, id: finalId }),
            });
            const newProject = await res.json();
            setProjects(prev => [...prev, newProject]);
        } catch (error) {
            console.error('Failed to add project:', error);
        }
    };

    const updateProject = async (projectId: string, updates: Partial<Project>) => {
        // Optimistic update
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));

        try {
            await fetch(`/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
        } catch (error) {
            console.error('Failed to update project:', error);
        }
    };

    const deleteProject = async (id: string) => {
        // Optimistic update
        setProjects(prev => prev.filter(p => p.id !== id));
        setTasks(prev => {
            const newTasks = { ...prev };
            delete newTasks[id];
            return newTasks;
        });

        try {
            await fetch(`/api/projects/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Failed to delete project:', error);
        }
    };

    const toggleProjectFavorite = (id: string) => {
        const project = projects.find(p => p.id === id);
        if (project) {
            updateProject(id, { isFavorite: !project.isFavorite });
        }
    };

    const addTask = async (projectId: string, text: string, dueDate?: string, priority: Task['priority'] = 'medium', status: Task['status'] = 'on-track') => {
        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    text,
                    priority,
                    status,
                    dueDate: dueDate || null,
                }),
            });
            const newTask = await res.json();
            const flattenedTask: Task = {
                ...newTask,
                tags: newTask.tags.map((tag: any) => tag.text),
            };
            setTasks(prev => ({
                ...prev,
                [projectId]: [...(prev[projectId] || []), flattenedTask],
            }));
        } catch (error) {
            console.error('Failed to add task:', error);
        }
    };

    const updateTask = async (projectId: string, taskId: string, updates: Partial<Task>) => {
        // Optimistic update
        setTasks(prev => ({
            ...prev,
            [projectId]: prev[projectId].map(t =>
                t.id === taskId ? { ...t, ...updates } : t
            ),
        }));

        try {
            await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const toggleTask = (projectId: string, taskId: string) => {
        const task = tasks[projectId]?.find(t => t.id === taskId);
        if (task) {
            updateTask(projectId, taskId, { completed: !task.completed });
        }
    };

    const deleteTask = async (projectId: string, taskId: string) => {
        // Optimistic update
        setTasks(prev => ({
            ...prev,
            [projectId]: prev[projectId].filter(t => t.id !== taskId),
        }));

        try {
            await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const getTasksByMonth = (projectId: string, month: string) => {
        const projectTasks = tasks[projectId] || [];
        return projectTasks.filter(t => {
            const date = new Date(t.createdAt);
            const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            return monthStr === month;
        });
    };

    const addSubtask = async (projectId: string, taskId: string, text: string) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });
            const newSubtask = await res.json();

            setTasks(prev => {
                const projectTasks = prev[projectId] || [];
                return {
                    ...prev,
                    [projectId]: projectTasks.map(t => {
                        if (t.id === taskId) {
                            return { ...t, subtasks: [...(t.subtasks || []), newSubtask] };
                        }
                        return t;
                    })
                };
            });
        } catch (error) {
            console.error('Failed to add subtask:', error);
        }
    };

    const toggleSubtask = async (projectId: string, taskId: string, subtaskId: string) => {
        const task = tasks[projectId]?.find(t => t.id === taskId);
        const subtask = task?.subtasks?.find(st => st.id === subtaskId);
        if (!subtask) return;

        // Optimistic update
        setTasks(prev => {
            const projectTasks = prev[projectId] || [];
            return {
                ...prev,
                [projectId]: projectTasks.map(t => {
                    if (t.id === taskId) {
                        return {
                            ...t,
                            subtasks: (t.subtasks || []).map(st =>
                                st.id === subtaskId ? { ...st, completed: !st.completed } : st
                            )
                        };
                    }
                    return t;
                })
            };
        });

        try {
            await fetch(`/api/subtasks/${subtaskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !subtask.completed }),
            });
        } catch (error) {
            console.error('Failed to toggle subtask:', error);
        }
    };

    const deleteSubtask = async (projectId: string, taskId: string, subtaskId: string) => {
        // Optimistic update
        setTasks(prev => {
            const projectTasks = prev[projectId] || [];
            return {
                ...prev,
                [projectId]: projectTasks.map(t => {
                    if (t.id === taskId) {
                        return {
                            ...t,
                            subtasks: (t.subtasks || []).filter(st => st.id !== subtaskId)
                        };
                    }
                    return t;
                })
            };
        });

        try {
            await fetch(`/api/subtasks/${subtaskId}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Failed to delete subtask:', error);
        }
    };

    return (
        <ProjectContext.Provider value={{
            projects,
            tasks,
            addTask,
            updateTask,
            addProject,
            updateProject,
            deleteProject,
            toggleTask,
            deleteTask,
            getTasksByMonth,
            toggleProjectFavorite,
            addSubtask,
            toggleSubtask,
            deleteSubtask
        }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProjects() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProjects must be used within a ProjectProvider');
    }
    return context;
}
