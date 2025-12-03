'use client';

import { InventoryItem } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HandCoins, Calendar, Clock, User, Phone, Mail } from "lucide-react";

interface LendingInfoProps {
    item: InventoryItem;
    onUpdate: (updates: Partial<InventoryItem>) => void;
}

export function LendingInfo({ item }: LendingInfoProps) {
    const lentInfo = item.isLent || item.lent;
    if (!lentInfo) return null;

    const getReturnDateStatus = () => {
        if (!item.expectedReturnDate) return { text: 'No return date set', color: 'text-muted-foreground' };
        const today = new Date();
        const returnDate = new Date(item.expectedReturnDate);
        today.setHours(0,0,0,0);
        returnDate.setHours(0,0,0,0);

        const diffTime = returnDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)} day(s)`, color: 'text-destructive' };
        if (diffDays === 0) return { text: 'Due today', color: 'text-orange-500' };
        return { text: `Due in ${diffDays} day(s)`, color: 'text-muted-foreground' };
    };

    const returnStatus = getReturnDateStatus();

    return (
        <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                    <HandCoins /> Currently Lent Out
                </CardTitle>
                <CardDescription className="text-blue-800">
                    This item was lent to {item.lentTo} on {item.lentDate ? new Date(item.lentDate).toLocaleDateString() : 'N/A'}.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm text-blue-900">
                    {item.lentTo && <p className="flex items-center gap-2"><User size={16}/> <strong>Lent To:</strong> {item.lentTo}</p>}
                    {item.lentToEmail && <p className="flex items-center gap-2"><Mail size={16}/> <strong>Email:</strong> {item.lentToEmail}</p>}
                    {item.lentToPhone && <p className="flex items-center gap-2"><Phone size={16}/> <strong>Phone:</strong> {item.lentToPhone}</p>}
                    {item.expectedReturnDate && (
                        <div className={`flex items-center gap-2 font-semibold ${returnStatus.color}`}>
                            <Clock size={16}/> 
                            <span>{returnStatus.text} ({new Date(item.expectedReturnDate).toLocaleDateString()})</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )

}
