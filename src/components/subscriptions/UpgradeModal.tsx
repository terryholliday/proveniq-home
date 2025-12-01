'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star } from "lucide-react";

interface UpgradeModalProps {
    feature: string;
    onClose: () => void;
}

const proFeatures = [
    "AI-Powered Value Insights & Market Trends",
    "Unlimited Item Entries",
    "Maintenance Schedules & Reminders",
    "Legacy & Inheritance Planning",
    "Advanced Reporting & Analytics",
    "Priority Support"
];

export default function UpgradeModal({ feature, onClose }: UpgradeModalProps) {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <Star className="h-8 w-8 text-yellow-500" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-2xl font-bold">Unlock Pro Feature</DialogTitle>
                    <DialogDescription className="text-center text-md text-muted-foreground">
                        The <strong>{feature}</strong> feature is part of our Pro plan. Upgrade your account to gain access and enhance your asset management capabilities.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="py-6">
                    <h3 className="font-semibold mb-3 text-center">The Pro Plan Includes:</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        {proFeatures.map((feat, i) => (
                            <li key={i} className="flex items-start">
                                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                                <span>{feat}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <DialogFooter className="flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                    <Button variant="outline" onClick={onClose} className="w-full md:w-auto">Maybe Later</Button>
                    <Button className="w-full md:w-auto bg-green-600 hover:bg-green-700">
                        Upgrade to Pro
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}