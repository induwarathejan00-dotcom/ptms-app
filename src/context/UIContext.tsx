"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task } from './ProjectContext'; // Import Task

type ViewMode = 'grid' | 'list' | 'board';

interface UIContextType {
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    isProjectModalOpen: boolean;
    openProjectModal: () => void;
    closeProjectModal: () => void;

    isSettingsModalOpen: boolean;
    openSettingsModal: () => void;
    closeSettingsModal: () => void;

    isNotificationsPanelOpen: boolean;
    openNotificationsPanel: () => void;
    closeNotificationsPanel: () => void;

    isSearchOpen: boolean;
    openSearch: () => void;
    closeSearch: () => void;

    selectedTask: { task: Task, projectId: string } | null;
    openTaskDetails: (task: Task, projectId: string) => void;
    closeTaskDetails: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<{ task: Task, projectId: string } | null>(null); // Fixed type

    // Initialize from localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const storedSidebar = localStorage.getItem('sidebarCollapsed');
        if (storedSidebar) setSidebarCollapsed(JSON.parse(storedSidebar));

        const storedViewMode = localStorage.getItem('viewMode');
        if (storedViewMode) setViewMode(storedViewMode as ViewMode);
    }, []);

    const toggleSidebar = () => {
        setSidebarCollapsed(prev => {
            const newState = !prev;
            localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
            return newState;
        });
    };

    const handleSetViewMode = (mode: ViewMode) => {
        setViewMode(mode);
        localStorage.setItem('viewMode', mode);
    };

    const openProjectModal = () => setIsProjectModalOpen(true);
    const closeProjectModal = () => setIsProjectModalOpen(false);

    const openSettingsModal = () => setIsSettingsModalOpen(true);
    const closeSettingsModal = () => setIsSettingsModalOpen(false);

    const openNotificationsPanel = () => setIsNotificationsPanelOpen(true);
    const closeNotificationsPanel = () => setIsNotificationsPanelOpen(false);

    const openSearch = () => setIsSearchOpen(true);
    const closeSearch = () => setIsSearchOpen(false);

    const openTaskDetails = (task: Task, projectId: string) => setSelectedTask({ task, projectId }); // Update signature
    const closeTaskDetails = () => setSelectedTask(null);

    return (
        <UIContext.Provider value={{
            sidebarCollapsed,
            toggleSidebar,
            viewMode,
            setViewMode: handleSetViewMode,
            isProjectModalOpen,
            openProjectModal,
            closeProjectModal,
            isSettingsModalOpen,
            openSettingsModal,
            closeSettingsModal,
            isNotificationsPanelOpen,
            openNotificationsPanel,
            closeNotificationsPanel,
            isSearchOpen,
            openSearch,
            closeSearch,
            selectedTask,
            openTaskDetails,
            closeTaskDetails
        }}>
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
}
