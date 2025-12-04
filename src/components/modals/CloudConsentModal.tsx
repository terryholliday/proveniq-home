'use client';

import { useState } from 'react';
import { getFirestore, doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Cloud, Gavel } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConsentRecord } from '@/lib/types';

interface CloudConsentModalProps {
    isOpen: boolean;
    onConsentComplete: () => void;
}

export function CloudConsentModal({ isOpen, onConsentComplete }: CloudConsentModalProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const auth = getAuth();
    const db = getFirestore();

    const handleAccept = async () => {
        if (!auth.currentUser) return;
        setLoading(true);

        try {
            const consentRecord: ConsentRecord = {
                accepted: true,
                acceptedAt: Timestamp.now(),
                policyVersion: '2.0-cloud-migration', // Matches the seed file version
                // In a real edge function, we'd capture IP here. For client-side, we omit or capture via backend.
            };

            // Merge consent into user profile
            await setDoc(doc(db, 'users', auth.currentUser.uid), {
                consents: {
                    cloudStorage: consentRecord
                }
            }, { merge: true });

            toast({
                title: "Preferences Updated",
                description: "Thank you for accepting the new privacy terms.",
            });

            onConsentComplete();
        } catch (error) {
            console.error("Consent Error:", error);
            toast({
                title: "Error",
                description: "Could not save your consent. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen}>
            <DialogContent className="sm:max-w-[600px] [&>button]:hidden"> {/* Hides the close X button to make it blocking */}
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-indigo-700">
                        <ShieldCheck className="h-6 w-6" />
                        Important Update: Data Storage & Privacy
                    </DialogTitle>
                    <DialogDescription className="pt-4 space-y-4 text-slate-700">
                        <p>
                            To enable real-time auctions, disaster recovery, and multi-device access, MyARK is updating its infrastructure.
                        </p>

                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 space-y-3">
                            <div className="flex gap-3">
                                <Cloud className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                                <div className="text-sm">
                                    <strong>Cloud Synchronization:</strong> Your inventory items, photos, and documents are no longer stored solely on your device. They are synchronized to our secure Google Cloud Firestore database (US Region).
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Gavel className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                                <div className="text-sm">
                                    <strong>Auction Transactions:</strong> By participating in auctions, you acknowledge MyARK acts as a "Marketplace Facilitator" responsible for collecting Sales Tax on your behalf.
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            By clicking "I Agree", you consent to the transfer of your data to cloud servers and accept the updated <a href="#" className="underline text-indigo-600">Privacy Policy (v2.0)</a> and <a href="#" className="underline text-indigo-600">Terms of Service</a>.
                        </p>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-between items-center mt-4">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                        Acceptance is required to continue using MyARK.
                    </span>
                    <Button onClick={handleAccept} disabled={loading} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">
                        {loading ? "Processing..." : "I Agree to Cloud Storage"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
