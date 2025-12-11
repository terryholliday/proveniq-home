'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { InventoryItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ProvenanceEngine } from '@/ai/provenance_engine';

export default function VerifyItemPage() {
    const params = useParams();
    const id = params?.id as string;
    const [item, setItem] = useState<InventoryItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [provenanceSummary, setProvenanceSummary] = useState<import('@/ai/provenance_engine').ProvenanceSummary | null>(null);

    useEffect(() => {
        async function fetchItem() {
            if (!id) return;
            try {
                const { firestore } = initializeFirebase();
                const docRef = doc(firestore, 'inventory', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as InventoryItem;
                    setItem(data);

                    // Run provenance analysis
                    const engine = new ProvenanceEngine();
                    const summary = engine.analyze(data);
                    setProvenanceSummary(summary);
                } else {
                    setError('Item not found or invalid verification link.');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to verify item. You may need to be logged in.');
            } finally {
                setLoading(false);
            }
        }

        fetchItem();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="flex h-screen items-center justify-center p-4">
                <Card className="max-w-md w-full border-red-200 bg-red-50">
                    <CardContent className="pt-6 text-center">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-red-700 mb-2">Verification Failed</h2>
                        <p className="text-red-600">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
                        <ShieldCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">MyARK Verified Item</h1>
                    <p className="text-gray-500 mt-2">Digital Registry Verification</p>
                </div>

                <Card className="overflow-hidden border-t-4 border-t-primary shadow-lg">
                    <div className="bg-slate-900 p-6 text-white">
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                            {item.imageUrl && (
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-32 h-32 object-cover rounded-lg border-2 border-white/20"
                                />
                            )}
                            <div className="text-center md:text-left">
                                <h2 className="text-2xl font-bold">{item.name}</h2>
                                <p className="text-slate-300 mt-1">{item.description}</p>
                                <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                                    <Badge variant="secondary" className="bg-slate-700 text-slate-100 hover:bg-slate-600">
                                        {item.category}
                                    </Badge>
                                    {item.vin && (
                                        <Badge variant="outline" className="text-slate-300 border-slate-600">
                                            SN: {item.vin}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <CardContent className="p-6">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                    Provenance Summary
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Confidence Score</span>
                                        <Badge className={
                                            (provenanceSummary?.confidenceScore ?? 0) > 70 ? 'bg-green-600' :
                                                (provenanceSummary?.confidenceScore ?? 0) > 40 ? 'bg-amber-500' : 'bg-red-500'
                                        }>
                                            {provenanceSummary?.confidenceScore ?? 0}/100
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Total Events</span>
                                        <span className="font-semibold">{item.provenance?.length || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Documented Years</span>
                                        <span className="font-semibold">
                                            {(provenanceSummary?.timeline?.length ?? 0) > 0 && provenanceSummary
                                                ? (new Date().getFullYear() - new Date(provenanceSummary.timeline[provenanceSummary.timeline.length - 1].date).getFullYear())
                                                : 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                    Latest Activity
                                </h3>
                                <div className="space-y-4 relative border-l-2 border-gray-100 ml-2">
                                    {provenanceSummary?.timeline.slice(0, 3).map((event, idx: number) => (
                                        <div key={idx} className="ml-4 relative">
                                            <div className="absolute -left-[21px] top-1 bg-white rounded-full border border-gray-200">
                                                {event.verified ?
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" /> :
                                                    <div className="h-4 w-4 rounded-full bg-gray-200" />
                                                }
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">{event.title}</p>
                                            <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t text-center text-xs text-gray-400">
                            Verified by MyARK Digital Registry • {new Date().getFullYear()}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
