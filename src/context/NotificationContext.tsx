"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useProjects } from './ProjectContext';
import { differenceInDays, isBefore, startOfDay } from 'date-fns';

export interface Notification {
    id: string;
    title: string;
    message: string;
    time: string; // ISO string
    type: 'success' | 'info' | 'warning' | 'error';
    read: boolean;
    relatedTaskId?: string;
    projectId?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    clearAll: () => void;
    addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { projects, tasks } = useProjects();

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const saved = localStorage.getItem('ptms_notifications');
        if (saved) {
            try {
                setNotifications(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse notifications", e);
            }
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('ptms_notifications', JSON.stringify(notifications));
    }, [notifications]);

    // Check for overdue tasks
    useEffect(() => {
        if (Object.keys(tasks).length === 0) return;

        const checkOverdueTasks = () => {
            const today = startOfDay(new Date());
            const newNotifications: Notification[] = [];

            Object.entries(tasks).forEach(([projectId, projectTasks]) => {
                const project = projects.find(p => p.id === projectId);
                if (!project) return;

                projectTasks.forEach(task => {
                    if (task.completed) return;

                    const taskDate = startOfDay(new Date(task.createdAt));

                    // If task is in the past (yesterday or earlier)
                    if (isBefore(taskDate, today)) {
                        const daysLate = differenceInDays(today, taskDate);
                        const notifId = `overdue-${task.id}`;

                        // Check if notification already exists
                        const exists = notifications.some(n => n.id === notifId);

                        // Or if it exists in the new batch we are building
                        const alreadyAdded = newNotifications.some(n => n.id === notifId);

                        if (!exists && !alreadyAdded) {
                            newNotifications.push({
                                id: notifId,
                                title: "Task Overdue",
                                message: `Task "${task.text}" in ${project.name} was due ${daysLate} day${daysLate > 1 ? 's' : ''} ago.`,
                                time: new Date().toISOString(),
                                type: 'warning',
                                read: false,
                                relatedTaskId: task.id,
                                projectId: project.id
                            });
                        }
                    }
                });
            });

            if (newNotifications.length > 0) {
                setNotifications(prev => [...newNotifications, ...prev]);
            }
        };

        // Run check immediately and then every minute (though usually only incomplete tasks chang or mount matters)
        checkOverdueTasks();

        // We rely on 'tasks' dependency to re-run this when a task is updated/added/completed
    }, [tasks, projects]); // eslint-disable-next-line react-hooks/exhaustive-deps

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const addNotification = (notification: Omit<Notification, 'id' | 'time' | 'read'>) => {
        const newNotif: Notification = {
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            time: new Date().toISOString(),
            read: false,
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            clearAll,
            addNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
