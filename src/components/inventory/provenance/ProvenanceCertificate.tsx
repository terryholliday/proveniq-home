'use client';

import { InventoryItem } from '@/lib/types';
import { ProvenanceEngine } from '@/ai/provenance_engine';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import QRCode from "react-qr-code";

interface ProvenanceCertificateProps {
    item: InventoryItem;
}

export function ProvenanceCertificate({ item }: ProvenanceCertificateProps) {
    const engine = useMemo(() => new ProvenanceEngine(), []);
    const summary = useMemo(() => engine.analyze(item), [item, engine]);
    const currentDate = new Date().toLocaleDateString();

    return (
        <div className="bg-white p-8 max-w-2xl mx-auto border-4 border-double border-gray-300 shadow-lg print:shadow-none print:border-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Certificate of Provenance</h1>
                <p className="text-sm text-gray-500 uppercase tracking-widest">MyARK Digital Registry</p>
            </div>

            <div className="flex gap-6 mb-8">
                {item.imageUrl && (
                    <div className="w-1/3">
                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-auto rounded-md border border-gray-200 object-cover"
                        />
                    </div>
                )}
                <div className="flex-1 space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{item.name}</h2>
                        <p className="text-gray-600 italic">{item.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="block text-gray-500 text-xs uppercase">Category</span>
                            <span className="font-medium">{item.category}</span>
                        </div>
                        {item.vin && (
                            <div>
                                <span className="block text-gray-500 text-xs uppercase">VIN / Serial</span>
                                <span className="font-medium">{item.vin}</span>
                            </div>
                        )}
                        <div>
                            <span className="block text-gray-500 text-xs uppercase">Registry ID</span>
                            <span className="font-mono text-xs">{item.id}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-bold border-b border-gray-200 pb-2 mb-4">Ownership History</h3>
                <div className="space-y-2">
                    {summary.timeline.filter(t => !t.gap).slice(0, 5).map((event, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600">{new Date(event.date).toLocaleDateString()}</span>
                            <span className="font-medium">{event.title}</span>
                            <span className="text-gray-500 truncate max-w-[200px]">{event.description}</span>
                        </div>
                    ))}
                    {summary.timeline.filter(t => !t.gap).length > 5 && (
                        <p className="text-xs text-gray-400 italic mt-2">...and {summary.timeline.length - 5} more events.</p>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-end border-t border-gray-200 pt-6 mt-8">
                <div>
                    <div className="mb-2">
                        <span className="text-xs text-gray-500 uppercase block">Confidence Score</span>
                        <span className="text-2xl font-bold text-gray-900">{summary.confidenceScore}/100</span>
                    </div>
                    <div className="text-xs text-gray-400">
                        Generated on {currentDate}
                    </div>
                </div>

                <div className="text-right">
                    <div className="mb-2 ml-auto">
                        <QRCode
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${item.id}`}
                            size={96}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 max-w-[200px]">
                        This certificate is a digital representation of records held in the MyARK secure registry.
                    </p>
                </div>
            </div>
        </div>
    );
}
