'use client';

import { useState } from 'react';
import { InventoryItem } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { submitInsuranceClaim, ClaimType } from '@/services/claimsiqService';
import { useUser } from '@/firebase/provider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ClaimModalProps {
    items: InventoryItem[];
    claimType: 'warranty' | 'ho3' | 'auto';
    onClose: () => void;
}

const claimTypeDetails = {
    ho3: { title: "Homeowner's Insurance Claim", description: "File a claim against your homeowner's policy for the selected item(s).", apiType: 'INSURANCE' as ClaimType },
    auto: { title: "Auto Insurance Claim", description: "File a claim against your auto insurance policy for the selected vehicle.", apiType: 'INSURANCE' as ClaimType },
    warranty: { title: "Warranty Claim", description: "File a warranty claim for the selected item.", apiType: 'WARRANTY' as ClaimType },
}

export default function ClaimModal({ items, claimType, onClose }: ClaimModalProps) {
    const { toast } = useToast();
    const { user } = useUser();
    const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{ success: boolean; claimId?: string; error?: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitResult(null);

        const details = claimTypeDetails[claimType];
        
        // Calculate total value
        const totalValueCents = items.reduce((sum, item) => {
            const value = item.marketValue || item.purchasePrice || 0;
            return sum + Math.round(value * 100);
        }, 0);

        // Collect evidence hashes from item images
        const evidenceHashes = items
            .flatMap(item => item.imageHashes || [])
            .filter(Boolean);

        try {
            // 1. Pre-screen for fraud via Core (non-blocking warning)
            let fraudWarning: string | null = null;
            try {
                const fraudResponse = await fetch('/api/core/fraud-screen', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user?.uid || 'anonymous',
                        item: {
                            id: items[0].id,
                            category: items[0].category,
                            estimatedValue: totalValueCents / 100,
                            purchasePrice: items[0].purchasePrice,
                            purchaseDate: items[0].purchaseDate,
                            hasReceipt: !!items[0].receiptUrl,
                            images: items[0].images || (items[0].imageUrl ? [items[0].imageUrl] : []),
                        },
                        claimType: 'insurance',
                    }),
                });
                if (fraudResponse.ok) {
                    const fraudData = await fraudResponse.json();
                    console.log('[Core] Fraud pre-screen:', fraudData.result?.riskLevel);
                    if (fraudData.result?.riskLevel === 'HIGH' || fraudData.result?.riskLevel === 'CRITICAL') {
                        fraudWarning = `Claim flagged for review (Risk: ${fraudData.result.riskLevel})`;
                    }
                }
            } catch (e) {
                console.warn('[Core] Fraud pre-screening unavailable');
            }

            // 2. Try to submit to ClaimsIQ service
            const result = await submitInsuranceClaim({
                itemId: items[0].id,
                itemName: items.map(i => i.name).join(', '),
                walletId: user?.uid || 'anonymous',
                claimType: details.apiType,
                description: description,
                estimatedValueCents: totalValueCents,
                evidenceHashes: evidenceHashes,
                purchaseDate: items[0].purchaseDate,
                purchaseReceiptHash: items[0].receiptUrl ? 'receipt-on-file' : undefined,
            }, user?.uid || 'anonymous-token');

            if (result.success) {
                setSubmitResult({ success: true, claimId: result.claimId });
                toast({
                    title: "Claim Submitted",
                    description: `Claim ${result.claimId} has been filed successfully.`,
                });
            } else {
                // Service unavailable - save locally for later sync
                const localClaimId = `LOCAL-${Date.now()}`;
                const pendingClaims = JSON.parse(localStorage.getItem('proveniq_pending_claims') || '[]');
                pendingClaims.push({
                    id: localClaimId,
                    claimType,
                    items: items.map(i => ({ id: i.id, name: i.name, value: i.marketValue || i.purchasePrice })),
                    incidentDate,
                    description,
                    totalValueCents,
                    createdAt: new Date().toISOString(),
                    status: 'pending_sync'
                });
                localStorage.setItem('proveniq_pending_claims', JSON.stringify(pendingClaims));
                
                setSubmitResult({ success: true, claimId: localClaimId });
                toast({
                    title: "Claim Saved Locally",
                    description: "ClaimsIQ service unavailable. Your claim has been saved and will sync when the service is available.",
                });
            }
        } catch (error) {
            console.error('[ClaimModal] Error:', error);
            setSubmitResult({ success: false, error: String(error) });
            toast({
                title: "Error",
                description: "Failed to submit claim. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const details = claimTypeDetails[claimType];

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{details.title}</DialogTitle>
                    <DialogDescription>{details.description}</DialogDescription>
                </DialogHeader>
                
                {submitResult?.success ? (
                    <div className="py-6">
                        <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                <strong>Claim Submitted Successfully!</strong><br />
                                Claim ID: <code className="bg-green-100 px-1 rounded">{submitResult.claimId}</code>
                                <p className="mt-2 text-sm">You will be notified when there are updates to your claim.</p>
                            </AlertDescription>
                        </Alert>
                        <DialogFooter className="mt-4">
                            <Button onClick={onClose}>Close</Button>
                        </DialogFooter>
                    </div>
                ) : submitResult?.error ? (
                    <div className="py-6">
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Submission Failed</strong><br />
                                {submitResult.error}
                            </AlertDescription>
                        </Alert>
                        <DialogFooter className="mt-4">
                            <Button variant="outline" onClick={() => setSubmitResult(null)}>Try Again</Button>
                            <Button onClick={onClose}>Close</Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Selected Item(s)</Label>
                                <div className="p-2 bg-muted rounded-md text-sm font-semibold">
                                    {items.map(i => i.name).join(', ')}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Total Value: ${items.reduce((sum, i) => sum + (i.marketValue || i.purchasePrice || 0), 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="incident-date">Date of Incident</Label>
                                <Input
                                    id="incident-date"
                                    type="date"
                                    value={incidentDate}
                                    onChange={(e) => setIncidentDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description of Incident</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={`Describe what happened to the ${items.length > 1 ? 'items' : 'item'}...`}
                                    required
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting || !description}>
                                {isSubmitting ? "Submitting..." : "Submit Claim"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
