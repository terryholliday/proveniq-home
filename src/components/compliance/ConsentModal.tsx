'use client';

import { useEffect, useState, useMemo } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFirestore } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { SEED_LEGAL_DOCS } from '@/lib/compliance-seed';
import { LegalDocument } from '@/lib/types';
import Link from 'next/link';

const STORAGE_KEY = 'myark_consent_version';

export function ConsentModal() {
    const [isOpen, setIsOpen] = useState(false);
    const firestore = useFirestore();

    // Fetch latest privacy policy
    const ref = useMemo(() => firestore ? doc(firestore, 'legal_docs', 'privacy') : null, [firestore]);
    const { data: privacyDoc } = useDoc<LegalDocument>(ref);

    const latestVersion = privacyDoc?.version || SEED_LEGAL_DOCS.find(d => d.id === 'privacy')?.version;

    useEffect(() => {
        if (!latestVersion) return;

        // Check local storage
        const consentedVersion = localStorage.getItem(STORAGE_KEY);

        // If mismatch, show modal
        if (consentedVersion !== latestVersion) {
            // Small delay to ensure client-side execution and avoid hydration issues
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [latestVersion]);

    const handleAccept = () => {
        if (latestVersion) {
            localStorage.setItem(STORAGE_KEY, latestVersion);
            setIsOpen(false);
        }
    };

    if (!latestVersion) return null;

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent className="max-h-[85vh] overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle>Update to Privacy Policy</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4">
                        <p>
                            We have updated our Privacy Policy to version <strong>{latestVersion}</strong>.
                            This update covers our migration to cloud storage and how we handle your data.
                        </p>
                        <p>
                            Please review the <Link href="/settings/legaldocs" className="text-indigo-600 underline" target="_blank">new policy</Link> to continue using MyARK.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={handleAccept}>
                        I Accept
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
