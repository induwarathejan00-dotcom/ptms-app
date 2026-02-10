"use client";

import React, { useState, useEffect, useRef } from "react";
import { useProjects, Project } from "@/context/ProjectContext";
import { useUI } from "@/context/UIContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ListTodo, Plus, X, Trash2, Image as ImageIcon, Upload, LayoutGrid, Search } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import ProjectLogo from "@/components/ProjectLogo";

export default function Dashboard() {
  const { projects, tasks, addProject, deleteProject } = useProjects();
  const { isProjectModalOpen, closeProjectModal, openProjectModal } = useUI();
  const [isManualLogo, setIsManualLogo] = useState(false);
  const [filter, setFilter] = useState('All Projects');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({
    name: '',
    url: '',
    audience: '',
    status: 'on-track',
    priority: 'medium',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    logoUrl: '',
  });

  const getStats = (id: string) => {
    const projectTasks = tasks[id] || [];
    const completed = projectTasks.filter(t => t.completed).length;
    const total = projectTasks.length;
    return { completed, total };
  };

  useEffect(() => {
    if (newProject.url && !isManualLogo && (!newProject.logoUrl || newProject.logoUrl.includes('logo.clearbit.com'))) {
      try {
        const url = new URL(newProject.url);
        const domain = url.hostname.replace('www.', '');
        if (domain) {
          setNewProject(prev => ({
            ...prev,
            logoUrl: `https://logo.clearbit.com/${domain}`
          }));
        }
      } catch (e) {
        // Invalid URL, ignore
      }
    }
  }, [newProject.url, isManualLogo]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProject(prev => ({ ...prev, logoUrl: reader.result as string }));
        setIsManualLogo(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.name) {
      addProject(newProject);
      setNewProject({
        name: '',
        url: '',
        audience: '',
        status: 'on-track',
        priority: 'medium',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        logoUrl: '',
      });
      setIsManualLogo(false);
      closeProjectModal();
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'All Projects') return true;
    if (filter === 'On Track') return project.status === 'on-track';
    if (filter === 'At Risk') return project.status === 'at-risk';
    if (filter === 'Delayed') return project.status === 'delayed';
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Dashboard</h1>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage your projects and tasks efficiently</p>
            </div>
            <button
              onClick={openProjectModal}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white rounded-lg font-semibold text-sm transition-all shadow-lg shadow-[var(--accent)]/20 active:scale-95"
            >
              <Plus size={18} />
              <span>New Project</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--accent)]/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center">
                  <LayoutGrid size={20} className="text-[var(--accent)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] font-semibold uppercase tracking-wider">Total Projects</p>
                  <p className="text-2xl font-bold text-[var(--foreground)] mt-0.5">{projects.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--success)]/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--success)]/10 rounded-lg flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-[var(--success)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] font-semibold uppercase tracking-wider">Completed Tasks</p>
                  <p className="text-2xl font-bold text-[var(--foreground)] mt-0.5">
                    {Object.values(tasks).reduce((acc, projectTasks) =>
                      acc + projectTasks.filter(t => t.completed).length, 0
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--info)]/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--info)]/10 rounded-lg flex items-center justify-center">
                  <ListTodo size={20} className="text-[var(--info)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] font-semibold uppercase tracking-wider">Active Tasks</p>
                  <p className="text-2xl font-bold text-[var(--foreground)] mt-0.5">
                    {Object.values(tasks).reduce((acc, projectTasks) =>
                      acc + projectTasks.filter(t => !t.completed).length, 0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Projects Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--foreground)]">Projects</h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-xs bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-all"
            >
              <option>All Projects</option>
              <option>On Track</option>
              <option>At Risk</option>
              <option>Delayed</option>
            </select>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-[var(--surface)] border border-[var(--border)] border-dashed rounded-xl">
              <div className="w-16 h-16 bg-[var(--muted)]/50 rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="text-[var(--muted-foreground)] opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">No projects found</h3>
              <p className="text-sm text-[var(--muted-foreground)] max-w-xs text-center mb-6">
                {projects.length === 0
                  ? "Get started by creating your first project workspace."
                  : `No projects found matching "${filter}". Try changing the filter.`}
              </p>
              {projects.length === 0 && (
                <button
                  onClick={openProjectModal}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white rounded-lg font-semibold text-sm transition-all shadow-lg shadow-[var(--accent)]/20 active:scale-95"
                >
                  <Plus size={16} />
                  <span>Create New Project</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, index) => {
                  const { completed, total } = getStats(project.id);
                  return (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: index * 0.03 }}
                      className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--accent)]/40 transition-all group relative overflow-hidden flex flex-col hover:shadow-lg"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <ProjectLogo
                            logoUrl={project.logoUrl}
                            name={project.name}
                            isCompleted={total > 0 && completed === total}
                            className="w-10 h-10 rounded-lg flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate">
                              {project.name}
                            </h3>
                            <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">{project.url.replace('https://', '')}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (confirm(`Are you sure you want to delete ${project.name}?`)) {
                              deleteProject(project.id);
                            }
                          }}
                          className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-all active:scale-90 opacity-0 group-hover:opacity-100 flex-shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--info)]" />
                          <span className="text-[var(--muted-foreground)] font-medium">{total} tasks</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                          <span className="text-[var(--muted-foreground)] font-medium">{completed} done</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-[var(--muted-foreground)] font-medium">Progress</span>
                          <span className="text-xs text-[var(--foreground)] font-bold">{total > 0 ? Math.round((completed / total) * 100) : 0}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className={cn(
                              "h-full rounded-full transition-colors",
                              total > 0 && completed === total ? "bg-[var(--success)]" : "bg-[var(--accent)]"
                            )}
                          />
                        </div>
                      </div>

                      {/* Action button */}
                      <Link href={`/project/${project.id}`} className="mt-auto">
                        <button className="w-full py-2.5 bg-[var(--muted)] hover:bg-[var(--accent)] hover:text-white text-[var(--foreground)] rounded-lg font-semibold text-sm transition-all active:scale-[0.98] group/btn">
                          <span className="group-hover/btn:hidden">View Project</span>
                          <span className="hidden group-hover/btn:inline">Open Workspace →</span>
                        </button>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        <AnimatePresence>
          {isProjectModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeProjectModal}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl transition-all duration-500"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-[var(--foreground)]">Add New Project</h2>
                  <button onClick={closeProjectModal} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--muted-foreground)] mb-2">Project Name</label>
                      <input
                        autoFocus required type="text"
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        placeholder="e.g. FY Sales Planning"
                        className="w-full bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-indigo-500 transition-all font-medium placeholder:text-[var(--muted-foreground)]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--muted-foreground)] mb-2">Website URL</label>
                      <input
                        required type="url"
                        value={newProject.url}
                        onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
                        placeholder="e.g. https://example.com"
                        className="w-full bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-indigo-500 transition-all font-medium placeholder:text-[var(--muted-foreground)]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--muted-foreground)] mb-2">Target Audience</label>
                      <input
                        type="text"
                        value={newProject.audience}
                        onChange={(e) => setNewProject({ ...newProject, audience: e.target.value })}
                        placeholder="e.g. Global, Singapore..."
                        className="w-full bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-indigo-500 transition-all font-medium placeholder:text-[var(--muted-foreground)]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--muted-foreground)] mb-2">Project Branding (Logo)</label>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <input
                            type="url"
                            value={newProject.logoUrl}
                            onChange={(e) => {
                              setNewProject({ ...newProject, logoUrl: e.target.value });
                              setIsManualLogo(true);
                            }}
                            placeholder="Paste image URL..."
                            className="w-full bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-indigo-500 transition-all font-medium placeholder:text-[var(--muted-foreground)]/30 text-sm"
                          />
                          {newProject.logoUrl && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg overflow-hidden border border-[var(--border)] bg-white p-1">
                              <img src={newProject.logoUrl} alt="Preview" className="w-full h-full object-contain" />
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleLogoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--muted-foreground)] hover:text-indigo-500 hover:border-indigo-500 transition-all flex items-center gap-2 font-bold text-xs shrink-0 active:scale-95"
                        >
                          <Upload size={16} />
                          Upload
                        </button>
                      </div>
                      <p className="text-[10px] text-[var(--muted-foreground)] mt-2 italic">Tip: Paste a URL or upload a file. Auto-logo fills based on the Website URL.</p>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 mt-4 active:scale-95"
                  >
                    Create Project
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
