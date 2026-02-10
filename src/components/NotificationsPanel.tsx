"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCircle2, Info, AlertTriangle, Trash2, CheckCheck, AlertOctagon } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { useNotifications } from '@/context/NotificationContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function NotificationsPanel() {
    const { isNotificationsPanelOpen, closeNotificationsPanel } = useUI();
    const { notifications, markAllAsRead, markAsRead, deleteNotification, clearAll } = useNotifications();

    return (
        <AnimatePresence>
            {isNotificationsPanelOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                        onClick={closeNotificationsPanel}
                    />
                    <motion.div
                        initial={{ opacity: 0, x: 300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 300 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl flex flex-col"
                    >
                        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bell size={20} className="text-[var(--accent)]" />
                                <h2 className="text-lg font-black text-[var(--foreground)]">Notifications</h2>
                                {notifications.filter(n => !n.read).length > 0 && (
                                    <span className="bg-[var(--accent)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {notifications.filter(n => !n.read).length}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={clearAll}
                                    className="p-2 text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Clear all"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button
                                    onClick={closeNotificationsPanel}
                                    className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => !notification.read && markAsRead(notification.id)}
                                        className={cn(
                                            "p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md relative group",
                                            notification.read
                                                ? "bg-[var(--surface)] border-[var(--border)] opacity-60"
                                                : "bg-[var(--muted)]/30 border-[var(--accent)]/20"
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                {notification.type === 'success' && <CheckCircle2 size={16} className="text-green-500" />}
                                                {notification.type === 'info' && <Info size={16} className="text-blue-500" />}
                                                {notification.type === 'warning' && <AlertTriangle size={16} className="text-amber-500" />}
                                                {notification.type === 'error' && <AlertOctagon size={16} className="text-red-500" />}
                                            </div>
                                            <div className="flex-1 pr-6">
                                                <h4 className={cn(
                                                    "text-sm font-bold mb-1",
                                                    !notification.read ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
                                                )}>
                                                    {notification.title}
                                                </h4>
                                                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-2">
                                                    {notification.message}
                                                </p>
                                                <span className="text-[10px] font-bold text-[var(--muted-foreground)]/60 uppercase tracking-wider">
                                                    {format(new Date(notification.time), 'MMM d, h:mm a')}
                                                </span>
                                            </div>
                                            {!notification.read && (
                                                <div className="absolute right-4 top-4 w-2 h-2 rounded-full bg-[var(--accent)]" />
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notification.id);
                                                }}
                                                className="absolute right-4 bottom-4 p-1.5 text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Delete notification"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-[var(--muted-foreground)] opacity-50">
                                    <Bell size={48} className="mb-4 stroke-1" />
                                    <p className="text-sm font-medium">No notifications yet</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-[var(--border)] bg-[var(--muted)]/10">
                            <button
                                onClick={markAllAsRead}
                                className="w-full py-2.5 bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)] rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCheck size={14} />
                                Mark all as read
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
