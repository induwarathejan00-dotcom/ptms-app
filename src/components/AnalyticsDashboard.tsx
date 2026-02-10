"use client";

import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Project, Task } from '@/context/ProjectContext';
import { cn } from '@/lib/utils';
import { TrendingUp, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface AnalyticsDashboardProps {
    projects: Project[];
    tasks: Record<string, Task[]>;
}

export default function AnalyticsDashboard({ projects, tasks }: AnalyticsDashboardProps) {
    const allTasks = Object.values(tasks).flat();
    const completedTasks = allTasks.filter(t => t.completed);
    const completionRate = allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;

    // Priority Data for Pie Chart
    const priorityData = [
        { name: 'Low', value: allTasks.filter(t => t.priority === 'low').length, color: '#10b981' },
        { name: 'Medium', value: allTasks.filter(t => t.priority === 'medium').length, color: '#6366f1' },
        { name: 'High', value: allTasks.filter(t => t.priority === 'high').length, color: '#f59e0b' },
        { name: 'Urgent', value: allTasks.filter(t => t.priority === 'urgent').length, color: '#ef4444' },
    ].filter(d => d.value > 0);

    // Status Data for Bar Chart (Projects)
    const statusData = [
        { name: 'On Track', count: projects.filter(p => p.status === 'on-track').length },
        { name: 'At Risk', count: projects.filter(p => p.status === 'at-risk').length },
        { name: 'Delayed', count: projects.filter(p => p.status === 'delayed').length },
        { name: 'On Hold', count: projects.filter(p => p.status === 'on-hold').length },
    ];

    // Helper for Task Distribution by Project
    const projectStats = projects.map(p => {
        const pTasks = tasks[p.id] || [];
        const completed = pTasks.filter(t => t.completed).length;
        return {
            name: p.name,
            total: pTasks.length,
            completed: completed,
            rate: pTasks.length > 0 ? (completed / pTasks.length) * 100 : 0
        };
    }).slice(0, 5); // Logic to show top 5 projects

    return (
        <div className="space-y-8 p-1">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    label="Total Tasks"
                    value={allTasks.length}
                    icon={TrendingUp}
                    color="indigo"
                    subValue={`${completedTasks.length} Completed`}
                />
                <StatCard
                    label="Completion Rate"
                    value={`${completionRate.toFixed(1)}%`}
                    icon={CheckCircle2}
                    color="emerald"
                    trend="+5.2%"
                />
                <StatCard
                    label="At Risk Tasks"
                    value={allTasks.filter(t => t.status === 'at-risk').length}
                    icon={AlertCircle}
                    color="amber"
                />
                <StatCard
                    label="Active Projects"
                    value={projects.length}
                    icon={Clock}
                    color="rose"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Priority Distribution - Pie Chart */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] p-8 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-8">Task Priority Split</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={priorityData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {priorityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--surface)',
                                        borderColor: 'var(--border)',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        {priorityData.map((d) => (
                            <div key={d.name} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Project Status - Bar Chart */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] p-8 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-8">Project Portfolio Health</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statusData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 'bold' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 'bold' }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
                                    contentStyle={{
                                        backgroundColor: 'var(--surface)',
                                        borderColor: 'var(--border)',
                                        borderRadius: '12px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Project Completion Velocity */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] p-8 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-8">Completion by Project</h3>
                <div className="space-y-6">
                    {projectStats.map((p) => (
                        <div key={p.name} className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-bold tracking-tight">{p.name}</span>
                                <span className="text-xs font-black text-indigo-500">{p.rate.toFixed(0)}%</span>
                            </div>
                            <div className="h-2 w-full bg-[var(--muted)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 transition-all duration-1000 ease-out"
                                    style={{ width: `${p.rate}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, subValue, trend }: any) {
    const colorMap: any = {
        indigo: 'bg-indigo-500/10 text-indigo-500',
        emerald: 'bg-emerald-500/10 text-emerald-500',
        amber: 'bg-amber-500/10 text-amber-500',
        rose: 'bg-rose-500/10 text-rose-500',
    };

    return (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl", colorMap[color])}>
                    <Icon size={20} />
                </div>
                {trend && (
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">{trend}</span>
                )}
            </div>
            <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">{label}</h4>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black tracking-tighter">{value}</span>
                    {subValue && <span className="text-[10px] font-bold text-[var(--muted-foreground)]">{subValue}</span>}
                </div>
            </div>
        </div>
    );
}
