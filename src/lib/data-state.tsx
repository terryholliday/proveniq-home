import React from 'react';

export function DataState<T>({
    data,
    loading,
    error,
    empty,
    render,
    renderLoading,
    renderError,
    renderEmpty,
}: {
    data?: T;
    loading?: boolean;
    error?: Error;
    empty?: boolean;
    render: (data: T) => React.ReactNode;
    renderLoading?: () => React.ReactNode;
    renderError?: (error: Error) => React.ReactNode;
    renderEmpty?: () => React.ReactNode;
}) {
    if (loading) {
        return renderLoading ? <>{renderLoading()}</> : <div>Loading...</div>;
    }

    if (error) {
        return renderError ? <>{renderError(error)}</> : <div>Error: {error.message}</div>;
    }

    if (empty || !data) {
        return renderEmpty ? <>{renderEmpty()}</> : <div>No data available.</div>;
    }

    return <>{render(data)}</>;
}
