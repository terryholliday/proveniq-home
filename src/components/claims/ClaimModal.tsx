'use client';

import { useState } from 'react';
import { InventoryItem } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ClaimModalProps {
    items: InventoryItem[];
    claimType: 'warranty' | 'ho3' | 'auto';
    onClose: () => void;
}

const claimTypeDetails = {
    ho3: { title: "Homeowner's Insurance Claim", description: "File a claim against your homeowner's policy for the selected item(s)." },
    auto: { title: "Auto Insurance Claim", description: "File a claim against your auto insurance policy for the selected vehicle." },
    warranty: { title: "Warranty Claim", description: "File a warranty claim for the selected item." },
}

export default function ClaimModal({ items, claimType, onClose }: ClaimModalProps) {
    const { toast } = useToast();
    const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        console.log({
            claimType,
            itemIds: items.map(i => i.id),
            incidentDate,
            description,
        });
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
            title: "Claim Submitted",
            description: `Your ${claimTypeDetails[claimType].title} has been successfully filed.`,
        });
        setIsSubmitting(false);
        onClose();
    };
    
    const details = claimTypeDetails[claimType];

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{details.title}</DialogTitle>
                    <DialogDescription>{details.description}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Selected Item(s)</Label>
                             <div className="p-2 bg-muted rounded-md text-sm font-semibold">
                                {items.map(i => i.name).join(', ')}
                            </div>
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
            </DialogContent>
        </Dialog>
    );
}
