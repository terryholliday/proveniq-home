"use client";

/**
 * CoreAssetWidgets
 * 
 * Displays asset widgets from Proveniq Core.
 * NO direct DB access - all data flows through Core.
 * UI renders widgets declaratively - no business logic inference.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";

// =============================================================================
// TYPES
// =============================================================================

type AssetView = "OPS" | "PROPERTIES" | "HOME" | "BIDS";

interface Widget {
    widget_type: string;
    priority: number;
    data: Record<string, unknown>;
}

interface UniversalAssetProfile {
    schema_version: string;
    requested_view: AssetView;
    identity: {
        paid: string;
        name: string;
        description?: string;
        category: string;
        subcategory?: string;
        brand?: string;
        model?: string;
        serial_number?: string;
        anchor_id?: string;
    };
    ownership: {
        current_owner_id: string;
        ownership_type: string;
        acquired_at?: string;
        acquisition_method?: string;
    };
    integrity: {
        provenance_score: number;
        integrity_verified: boolean;
        last_verified_at: string | null;
        event_count: number;
        anchor_sealed?: boolean;
    };
    widgets: Widget[];
    profile_generated_at: string;
    cache_ttl_seconds?: number;
}

// =============================================================================
// CORE CLIENT
// =============================================================================

const CORE_API_URL = process.env.NEXT_PUBLIC_CORE_API_URL || "http://localhost:8000";

async function fetchAssetProfile(
    assetId: string,
    view: AssetView = "HOME"
): Promise<UniversalAssetProfile> {
    const response = await fetch(
        `${CORE_API_URL}/core/asset/${encodeURIComponent(assetId)}?view=${view}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("ASSET_NOT_FOUND");
        }
        throw new Error(`CORE_ERROR: ${response.status}`);
    }

    return response.json();
}

// =============================================================================
// HOOK
// =============================================================================

export function useCoreAsset(assetId: string | null, view: AssetView = "HOME") {
    const [data, setData] = useState<UniversalAssetProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mountedRef = useRef(true);

    const fetchData = useCallback(async () => {
        if (!assetId) {
            setData(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const profile = await fetchAssetProfile(assetId, view);
            if (mountedRef.current) {
                setData(profile);
            }
        } catch (err) {
            if (mountedRef.current) {
                setError(err instanceof Error ? err.message : "Unknown error");
            }
        } finally {
            if (mountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [assetId, view]);

    useEffect(() => {
        mountedRef.current = true;
        fetchData();
        return () => {
            mountedRef.current = false;
        };
    }, [fetchData]);

    return { data, isLoading, error, refetch: fetchData };
}

// =============================================================================
// WIDGET COMPONENTS
// =============================================================================

function CustodyStatusWidget({ data }: { data: Record<string, unknown> }) {
    const stateColors: Record<string, string> = {
        HOME: "bg-green-100 text-green-700",
        IN_TRANSIT: "bg-blue-100 text-blue-700",
        VAULT: "bg-purple-100 text-purple-700",
        AUCTION: "bg-orange-100 text-orange-700",
        SOLD: "bg-gray-100 text-gray-700",
        CLAIMED: "bg-red-100 text-red-700",
    };

    const state = data.current_state as string;
    const colorClass = stateColors[state] || "bg-gray-100 text-gray-700";

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Custody Status
            </h4>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${colorClass}`}>
                <span className="font-semibold">{state?.replace("_", " ")}</span>
            </div>
            {data.last_transition_at && (
                <p className="text-xs text-gray-400 mt-2">
                    Since {new Date(data.last_transition_at as string).toLocaleDateString()}
                </p>
            )}
        </div>
    );
}

function ValuationWidget({ data }: { data: Record<string, unknown> }) {
    const confidenceColors: Record<string, string> = {
        HIGH: "text-green-600",
        MEDIUM: "text-yellow-600",
        LOW: "text-red-600",
    };

    const currentValue = (data.current_value_cents as number) / 100;
    const confidence = data.confidence_level as string;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Valuation
            </h4>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${currentValue.toLocaleString()}
            </p>
            <div className="flex items-center gap-2 mt-2">
                <span className={`text-sm ${confidenceColors[confidence] || "text-gray-500"}`}>
                    {confidence} Confidence
                </span>
                <span className="text-xs text-gray-400">
                    via {data.valuation_source as string}
                </span>
            </div>
            {(data.bias_flags as string[])?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {(data.bias_flags as string[]).map((flag, i) => (
                        <span key={i} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                            {flag.replace(/_/g, " ")}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

function RiskBadgeWidget({ data }: { data: Record<string, unknown> }) {
    const riskColors: Record<string, string> = {
        LOW: "bg-green-500",
        MEDIUM: "bg-yellow-500",
        HIGH: "bg-orange-500",
        CRITICAL: "bg-red-500",
    };

    const score = data.fraud_score as number;
    const level = data.risk_level as string;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Risk Score
            </h4>
            <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                        <circle
                            className="text-gray-200 dark:text-gray-700"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            cx="18"
                            cy="18"
                            r="15.9"
                        />
                        <circle
                            className={riskColors[level]?.replace("bg-", "text-") || "text-gray-400"}
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            fill="none"
                            cx="18"
                            cy="18"
                            r="15.9"
                            strokeDasharray={`${score}, 100`}
                        />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                        {score}
                    </span>
                </div>
                <div>
                    <span className={`px-2 py-1 rounded text-xs font-medium text-white ${riskColors[level]}`}>
                        {level}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                        {(data.signals as Array<unknown>)?.length || 0} signals
                    </p>
                </div>
            </div>
        </div>
    );
}

function ProvenanceTimelineWidget({ data }: { data: Record<string, unknown> }) {
    const events = (data.events as Array<Record<string, unknown>>) || [];
    const totalEvents = data.total_events as number;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Provenance Timeline
                </h4>
                <span className="text-xs text-gray-400">{totalEvents} events</span>
            </div>
            {events.length > 0 ? (
                <div className="space-y-2">
                    {events.slice(0, 5).map((event, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                            <div className="flex-1">
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {(event.event_type as string)?.replace(/_/g, " ")}
                                </span>
                                <span className="text-gray-400 ml-2 text-xs">
                                    {new Date(event.occurred_at as string).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-400">No events recorded</p>
            )}
        </div>
    );
}

function ServiceTimelineWidget({ data }: { data: Record<string, unknown> }) {
    const records = (data.records as Array<Record<string, unknown>>) || [];
    const totalCost = (data.total_service_cost_cents as number) / 100;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Service History
                </h4>
                <span className="text-sm font-medium">${totalCost.toLocaleString()}</span>
            </div>
            {records.length > 0 ? (
                <div className="space-y-2">
                    {records.slice(0, 3).map((record, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">
                                {record.service_type as string}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                                record.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                            }`}>
                                {record.status as string}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-400">No service records</p>
            )}
        </div>
    );
}

// =============================================================================
// WIDGET RENDERER
// =============================================================================

function WidgetRenderer({ widgets }: { widgets: Widget[] }) {
    const sortedWidgets = [...widgets].sort((a, b) => a.priority - b.priority);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedWidgets.map((widget, index) => {
                const key = `${widget.widget_type}-${index}`;

                switch (widget.widget_type) {
                    case "CUSTODY_STATUS":
                        return <CustodyStatusWidget key={key} data={widget.data} />;
                    case "VALUATION_SUMMARY":
                        return <ValuationWidget key={key} data={widget.data} />;
                    case "RISK_BADGE":
                        return <RiskBadgeWidget key={key} data={widget.data} />;
                    case "PROVENANCE_TIMELINE":
                        return <ProvenanceTimelineWidget key={key} data={widget.data} />;
                    case "SERVICE_TIMELINE":
                        return <ServiceTimelineWidget key={key} data={widget.data} />;
                    default:
                        if (process.env.NODE_ENV === "development") {
                            return (
                                <div key={key} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-sm text-yellow-700">
                                        Unknown widget: {widget.widget_type}
                                    </p>
                                </div>
                            );
                        }
                        return null;
                }
            })}
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface CoreAssetWidgetsProps {
    assetId: string;
    className?: string;
    showHeader?: boolean;
}

export function CoreAssetWidgets({ 
    assetId, 
    className = "",
    showHeader = true,
}: CoreAssetWidgetsProps) {
    const { data: profile, isLoading, error, refetch } = useCoreAsset(assetId, "HOME");

    if (isLoading) {
        return (
            <div className={`animate-pulse space-y-4 ${className}`}>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-50 dark:bg-red-900/20 rounded-lg p-4 ${className}`}>
                <p className="text-red-600 dark:text-red-400 font-medium">
                    {error === "ASSET_NOT_FOUND" ? "Asset not found in Core" : "Failed to load from Core"}
                </p>
                <button
                    onClick={() => refetch()}
                    className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!profile || profile.widgets.length === 0) {
        return null;
    }

    return (
        <div className={className}>
            {showHeader && (
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Core Insights
                    </h3>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                        profile.integrity.provenance_score >= 80
                            ? "bg-green-100 text-green-700"
                            : profile.integrity.provenance_score >= 50
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                    }`}>
                        {profile.integrity.provenance_score}% Verified
                    </div>
                </div>
            )}
            
            <WidgetRenderer widgets={profile.widgets} />
        </div>
    );
}
