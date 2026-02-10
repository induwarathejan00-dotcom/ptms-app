"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, Monitor, User, Shield, CreditCard, Bell } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

export default function SettingsModal() {
    const { isSettingsModalOpen, closeSettingsModal } = useUI();
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General', icon: Monitor },
        { id: 'account', label: 'Account', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'billing', label: 'Billing', icon: CreditCard },
    ];

    return (
        <AnimatePresence>
            {isSettingsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                        onClick={closeSettingsModal}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="w-full max-w-4xl bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col sm:flex-row max-h-[85vh]"
                    >
                        {/* Sidebar */}
                        <div className="w-full sm:w-64 bg-[var(--muted)]/30 border-b sm:border-b-0 sm:border-r border-[var(--border)] p-6 flex flex-col">
                            <h2 className="text-xl font-black text-[var(--foreground)] tracking-tight mb-6">Settings</h2>
                            <nav className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                                            activeTab === tab.id
                                                ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
                                                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50"
                                        )}
                                    >
                                        <tab.icon size={18} />
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-8 overflow-y-auto">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-bold text-[var(--foreground)]">
                                    {tabs.find(t => t.id === activeTab)?.label}
                                </h3>
                                <button
                                    onClick={closeSettingsModal}
                                    className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {activeTab === 'general' && (
                                <div className="space-y-8">
                                    <section className="space-y-4">
                                        <h4 className="text-sm font-black text-[var(--muted-foreground)] uppercase tracking-wider">Appearance</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <button
                                                onClick={() => theme !== 'light' && toggleTheme()}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 text-left transition-all",
                                                    theme === 'light'
                                                        ? "border-[var(--accent)] bg-[var(--accent)]/5"
                                                        : "border-[var(--border)] hover:border-[var(--border)]/80"
                                                )}
                                            >
                                                <Sun size={24} className="mb-3 text-amber-500" />
                                                <div className="font-bold text-sm">Light Mode</div>
                                            </button>
                                            <button
                                                onClick={() => theme !== 'dark' && toggleTheme()}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 text-left transition-all",
                                                    theme === 'dark'
                                                        ? "border-[var(--accent)] bg-[var(--accent)]/5"
                                                        : "border-[var(--border)] hover:border-[var(--border)]/80"
                                                )}
                                            >
                                                <Moon size={24} className="mb-3 text-purple-500" />
                                                <div className="font-bold text-sm">Dark Mode</div>
                                            </button>
                                            <button disabled className="p-4 rounded-xl border-2 border-[var(--border)] opacity-50 cursor-not-allowed text-left">
                                                <Monitor size={24} className="mb-3 text-blue-500" />
                                                <div className="font-bold text-sm">System</div>
                                            </button>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'account' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-6 p-6 border border-[var(--border)] rounded-2xl bg-[var(--muted)]/20">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                                            JD
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold">John Doe</h4>
                                            <p className="text-[var(--muted-foreground)]">john.doe@example.com</p>
                                            <button className="mt-2 text-xs font-bold text-[var(--accent)] hover:underline">
                                                Change Avatar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {['notifications', 'billing'].includes(activeTab) && (
                                <div className="text-center py-20">
                                    <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Shield size={24} className="text-[var(--muted-foreground)]" />
                                    </div>
                                    <h4 className="text-lg font-bold text-[var(--foreground)] mb-2">Coming Soon</h4>
                                    <p className="text-[var(--muted-foreground)] max-w-sm mx-auto">
                                        This section is currently under development. Check back later for updates.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
