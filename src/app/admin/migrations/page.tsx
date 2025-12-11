'use client';

import { useState } from 'react';
import { migrateProvenanceData } from '@/lib/migrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function MigrationsPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ updatedCount: number; skippedCount: number; errors: string[] } | null>(null);

    const handleMigration = async () => {
        setLoading(true);
        try {
            const res = await migrateProvenanceData();
            setResult(res);
        } catch (error) {
            console.error('Migration failed:', error);
            setResult({ updatedCount: 0, skippedCount: 0, errors: ['Migration failed unexpectedly.'] });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>System Migrations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border p-4 rounded-md">
                        <h3 className="font-semibold mb-2">Provenance Data Population</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            This migration will iterate through all inventory items. If an item has no provenance history,
                            it will create a default &quot;Acquisition&quot; event based on the purchase date or added date.
                        </p>

                        <Button onClick={handleMigration} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Run Provenance Migration
                        </Button>
                    </div>

                    {result && (
                        <Alert variant={result.errors.length > 0 ? "destructive" : "default"}>
                            <AlertTitle>Migration Complete</AlertTitle>
                            <AlertDescription>
                                <div className="mt-2 space-y-1">
                                    <p>Updated Items: {result.updatedCount}</p>
                                    <p>Skipped Items: {result.skippedCount}</p>
                                    {result.errors.length > 0 && (
                                        <div className="mt-2">
                                            <p className="font-semibold">Errors:</p>
                                            <ul className="list-disc list-inside text-xs">
                                                {result.errors.map((err, i) => (
                                                    <li key={i}>{err}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
