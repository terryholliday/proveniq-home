'use client';

import { useState } from 'react';
import { InventoryItem, ProvenanceEvent, ProvenanceEventType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Link as LinkIcon } from 'lucide-react';
import { analyzeDocument } from '@/ai/document_intelligence';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { useToast } from '@/components/ui/use-toast';

interface AddProvenanceFormProps {
    item: InventoryItem;
    onSuccess: () => void;
}

export function AddProvenanceForm({ item, onSuccess }: AddProvenanceFormProps) {
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState<Partial<ProvenanceEvent>>({
        type: 'other',
        date: new Date().toISOString().split('T')[0],
        description: '',
        documentUrl: ''
    });

    const handleAnalyze = async () => {
        if (!formData.documentUrl) return;

        setAnalyzing(true);
        try {
            const result = await analyzeDocument(formData.documentUrl);
            setFormData(prev => ({
                ...prev,
                date: result.date ? result.date.split('T')[0] : prev.date,
                type: result.type || prev.type,
                cost: result.cost || prev.cost,
                provider: result.provider || prev.provider,
                description: result.description || prev.description
            }));
            toast({
                title: "Document Analyzed",
                description: `Extracted data with ${Math.round(result.confidence * 100)}% confidence.`,
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Analysis Failed",
                description: "Could not analyze the document.",
                variant: "destructive"
            });
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const newEvent: ProvenanceEvent = {
                id: crypto.randomUUID(),
                date: formData.date!,
                type: formData.type as ProvenanceEventType,
                description: formData.description || '',
                provider: formData.provider,
                cost: formData.cost,
                documentUrl: formData.documentUrl,
                verified: false // User added events are unverified by default until checked
            };

            const { firestore } = initializeFirebase();
            const itemRef = doc(firestore, 'inventory', item.id);

            await updateDoc(itemRef, {
                provenance: arrayUnion(newEvent)
            });

            toast({
                title: "Event Added",
                description: "Provenance record has been updated.",
            });
            onSuccess();
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to save provenance event.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="type">Event Type</Label>
                    <Select
                        value={formData.type}
                        onValueChange={(val) => setFormData({ ...formData, type: val as ProvenanceEventType })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="acquisition">Acquisition</SelectItem>
                            <SelectItem value="ownership_change">Ownership Change</SelectItem>
                            <SelectItem value="appraisal">Appraisal</SelectItem>
                            <SelectItem value="repair">Repair / Service</SelectItem>
                            <SelectItem value="restoration">Restoration</SelectItem>
                            <SelectItem value="cleaning">Cleaning</SelectItem>
                            <SelectItem value="market_valuation">Market Valuation</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="docUrl">Document URL (Optional)</Label>
                <div className="flex gap-2">
                    <Input
                        id="docUrl"
                        placeholder="https://..."
                        value={formData.documentUrl}
                        onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                    />
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAnalyze}
                        disabled={!formData.documentUrl || analyzing}
                    >
                        {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-purple-500" />}
                        <span className="sr-only">Analyze</span>
                    </Button>
                </div>
                <p className="text-xs text-gray-500">
                    Paste a URL to a receipt, certificate, or invoice. AI will attempt to extract details.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="provider">Provider / Source</Label>
                <Input
                    id="provider"
                    placeholder="e.g. Sotheby's, Local Jeweler"
                    value={formData.provider || ''}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="cost">Cost / Value</Label>
                    <Input
                        id="cost"
                        type="number"
                        placeholder="0.00"
                        value={formData.cost || ''}
                        onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    placeholder="Details about this event..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                />
            </div>

            <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Record
                </Button>
            </div>
        </form>
    );
}
