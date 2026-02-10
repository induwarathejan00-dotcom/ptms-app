import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google"; // Changed import
import "./globals.css";
import { ProjectProvider } from "@/context/ProjectContext";
import { ThemeProvider } from '@/context/ThemeContext';
import { UIProvider } from '@/context/UIContext';
import { NotificationProvider } from '@/context/NotificationContext';
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ErrorBoundary from "@/components/ErrorBoundary";
import SettingsModal from "@/components/SettingsModal";
import NotificationsPanel from "@/components/NotificationsPanel";
import CommandPalette from "@/components/CommandPalette";
import TaskDetailsModal from "@/components/TaskDetailsModal"; // Added

const interTight = Inter_Tight({ // Configured Inter Tight
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PTMS | Project Task Management System",
  description: "Premium management for client websites",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${interTight.variable} antialiased bg-[var(--background)] text-[var(--foreground)] min-h-screen transition-colors duration-300`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <ThemeProvider>
            <UIProvider>
              <ProjectProvider>
                <NotificationProvider>
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1 flex flex-col min-h-screen">
                      <TopBar />
                      <main className="flex-1 pt-14 pl-64 transition-all duration-300">
                        {children}
                      </main>
                    </div>
                  </div>
                  <SettingsModal />
                  <NotificationsPanel />
                  <CommandPalette />
                  <TaskDetailsModal /> {/* Added */}
                </NotificationProvider>
              </ProjectProvider>
            </UIProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
