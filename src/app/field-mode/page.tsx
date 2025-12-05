import React from 'react';

/**
 * Field Mode Interface
 * Designed for Insurance Adjusters / Restoration Pros on tablets.
 * Features: Large touch targets, High Contrast, Offline Indicators.
 */
export default function FieldModePage() {
    return (
        <div className="min-h-screen bg-zinc-900 text-white p-4">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-yellow-500">MyARK Field Ops</h1>
                <div className="bg-green-600 px-3 py-1 rounded-full text-xs font-mono">
                    ONLINE (SYNCED)
                </div>
            </header>

            <div className="grid grid-cols-2 gap-4">
                <button className="bg-blue-600 h-40 rounded-xl flex flex-col items-center justify-center space-y-2 active:bg-blue-700 transition">
                    <span className="text-4xl">📷</span>
                    <span className="font-bold text-lg">Quick Capture</span>
                </button>

                <button className="bg-zinc-800 h-40 rounded-xl flex flex-col items-center justify-center space-y-2 active:bg-zinc-700 transition">
                    <span className="text-4xl">🎤</span>
                    <span className="font-bold text-lg">Voice Note</span>
                </button>

                <button className="bg-zinc-800 h-40 rounded-xl flex flex-col items-center justify-center space-y-2 active:bg-zinc-700 transition">
                    <span className="text-4xl">📄</span>
                    <span className="font-bold text-lg">Scan Doc</span>
                </button>

                <button className="bg-zinc-800 h-40 rounded-xl flex flex-col items-center justify-center space-y-2 active:bg-zinc-700 transition">
                    <span className="text-4xl">📤</span>
                    <span className="font-bold text-lg">Sync Job</span>
                </button>
            </div>

            <div className="mt-8 border-t border-zinc-700 pt-4">
                <h2 className="text-sm uppercase text-zinc-400 mb-2">Active Job</h2>
                <div className="bg-zinc-800 p-4 rounded-lg">
                    <p className="font-bold text-lg">Smith Residence - Fire Loss</p>
                    <p className="text-zinc-400">123 Maple Ave, Springfield</p>
                    <p className="text-sm mt-2 text-blue-400">14 Items Scanned • 2 Pending Review</p>
                </div>
            </div>
        </div>
    );
}
