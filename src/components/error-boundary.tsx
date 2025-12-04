'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Top-level error boundary for catching React errors.
 * Provides a graceful fallback UI when components crash.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Log error to console (safe, no PII)
        console.error('[ErrorBoundary] Caught error:', {
            message: error.message,
            stack: error.stack?.slice(0, 500), // Truncate for safety
            componentStack: errorInfo.componentStack?.slice(0, 500),
        });

        // Call optional error handler
        this.props.onError?.(error, errorInfo);
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Return custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
                    <div className="rounded-full bg-red-100 p-4 mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-gray-600 mb-6 max-w-md">
                        We encountered an unexpected error. Please try refreshing the page or return to the dashboard.
                    </p>
                    <div className="flex gap-3">
                        <Button onClick={this.handleReset} variant="outline">
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                        <Link href="/dashboard">
                            <Button>
                                <Home className="mr-2 h-4 w-4" />
                                Go to Dashboard
                            </Button>
                        </Link>
                    </div>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details className="mt-6 text-left w-full max-w-lg">
                            <summary className="cursor-pointer text-sm text-gray-500">
                                Error Details (Development Only)
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto">
                                {this.state.error.message}
                                {'\n\n'}
                                {this.state.error.stack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Route-level error boundary with simpler fallback.
 * Use this to wrap individual pages/routes.
 */
export function RouteErrorBoundary({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary
            fallback={
                <div className="flex min-h-[300px] flex-col items-center justify-center p-6">
                    <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Page Error</h3>
                    <p className="text-gray-500 text-sm mb-4">This section failed to load.</p>
                    <Button onClick={() => window.location.reload()} size="sm">
                        Reload Page
                    </Button>
                </div>
            }
        >
            {children}
        </ErrorBoundary>
    );
}

/**
 * Component-level error boundary for non-critical UI sections.
 * Silently degrades to empty state.
 */
export function SilentErrorBoundary({
    children,
    fallback = null
}: {
    children: ReactNode;
    fallback?: ReactNode;
}) {
    return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
}
