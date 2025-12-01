'use client';

import { useState } from 'react';
import { InventoryItem } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LendModalProps {
    item: InventoryItem;
    onClose: () => void;
    onUpdate: (updates: Partial<InventoryItem>) => void;
}

export function LendModal({ item, onClose, onUpdate }: LendModalProps) {
    const [lentTo, setLentTo] = useState('');
    const [lentToEmail, setLentToEmail] = useState('');
    const [lentToPhone, setLentToPhone] = useState('');
    const [lentDate, setLentDate] = useState(new Date().toISOString().split('T')[0]);
    const [returnDate, setReturnDate] = useState('');

    const handleConfirm = () => {
        onUpdate({
            isLent: true,
            lentTo,
            lentToEmail: lentToEmail || undefined,
            lentToPhone: lentToPhone || undefined,
            lentDate,
            expectedReturnDate: returnDate || undefined
        });
        onClose();
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Lend "{item.name}"</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="lent-to">Lent To (Name)</Label>
                        <Input id="lent-to" value={lentTo} onChange={e => setLentTo(e.target.value)} placeholder="e.g., Jane Doe" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="grid gap-2">
                            <Label htmlFor="lent-email">Contact Email</Label>
                            <Input id="lent-email" type="email" value={lentToEmail} onChange={e => setLentToEmail(e.target.value)} placeholder="jane@example.com" />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="lent-phone">Contact Phone</Label>
                            <Input id="lent-phone" type="tel" value={lentToPhone} onChange={e => setLentToPhone(e.target.value)} placeholder="(555) 123-4567" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="lent-date">Lent Date</Label>
                            <Input id="lent-date" type="date" value={lentDate} onChange={e => setLentDate(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="return-date">Expected Return Date</Label>
                            <Input id="return-date" type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={!lentTo}>Confirm Lend</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}