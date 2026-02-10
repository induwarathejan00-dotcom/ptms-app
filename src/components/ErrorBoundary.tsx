"use client";

import React from 'react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-8">
                    <div className="max-w-md w-full bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-10 text-center shadow-2xl">
                        <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-black text-[var(--foreground)] mb-3 tracking-tight">
                            Something Went Wrong
                        </h1>
                        <p className="text-[var(--muted-foreground)] mb-8 font-medium">
                            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
                        </p>
                        {this.state.error && (
                            <details className="text-left mb-6 bg-[var(--muted)]/50 rounded-xl p-4 border border-[var(--border)]">
                                <summary className="cursor-pointer text-sm font-bold text-[var(--muted-foreground)] mb-2">
                                    Error Details
                                </summary>
                                <code className="text-xs text-red-400 font-mono block overflow-auto">
                                    {this.state.error.toString()}
                                </code>
                            </details>
                        )}
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: undefined });
                                window.location.href = '/';
                            }}
                            className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
