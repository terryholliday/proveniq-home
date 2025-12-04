'use client';

import React, { ReactNode } from 'react';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Represents the state of async data fetching.
 */
export type DataState<T> =
    | { status: 'loading' }
    | { status: 'error'; error: Error | string }
    | { status: 'empty' }
    | { status: 'success'; data: T };

/**
 * Helper to create DataState objects
 */
export const DataState = {
    loading: <T,>(): DataState<T> => ({ status: 'loading' }),
    error: <T,>(error: Error | string): DataState<T> => ({ status: 'error', error }),
    empty: <T,>(): DataState<T> => ({ status: 'empty' }),
    success: <T,>(data: T): DataState<T> => ({ status: 'success', data }),
};

interface DataStateRendererProps<T> {
    state: DataState<T>;
    onRetry?: () => void;
    loadingMessage?: string;
    emptyMessage?: string;
    emptyIcon?: ReactNode;
    children: (data: T) => ReactNode;
}

/**
 * Renders appropriate UI based on data state (loading, error, empty, success).
 */
export function DataStateRenderer<T>({
    state,
    onRetry,
    loadingMessage = 'Loading...',
    emptyMessage = 'No items found',
    emptyIcon,
    children,
}: DataStateRendererProps<T>): ReactNode {
    switch (state.status) {
        case 'loading':
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-sm text-muted-foreground">{loadingMessage}</p>
                </div>
            );

        case 'error':
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-red-100 p-3 mb-4">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-md">
                        {typeof state.error === 'string'
                            ? state.error
                            : state.error.message || 'An unexpected error occurred'}
                    </p>
                    {onRetry && (
                        <Button onClick={onRetry} variant="outline" size="sm">
                            Try Again
                        </Button>
                    )}
                </div>
            );

        case 'empty':
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-gray-100 p-3 mb-4">
                        {emptyIcon || <Inbox className="h-6 w-6 text-gray-400" />}
                    </div>
                    <p className="text-muted-foreground">{emptyMessage}</p>
                </div>
            );

        case 'success':
            return <>{children(state.data)}</>;
    }
}

/**
 * Wrapper for async operations with standardized error handling
 */
export async function withDataState<T>(
    promise: Promise<T>,
    options?: {
        onSuccess?: (data: T) => void;
        onError?: (error: Error) => void;
    }
): Promise<DataState<T>> {
    try {
        const data = await promise;
        options?.onSuccess?.(data);

        // Check for empty arrays
        if (Array.isArray(data) && data.length === 0) {
            return DataState.empty<T>();
        }

        return DataState.success(data);
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        options?.onError?.(error);
        return DataState.error<T>(error);
    }
}
