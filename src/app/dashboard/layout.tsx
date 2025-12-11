'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layouts/app-layout';
import { CloudConsentModal } from '@/components/modals/CloudConsentModal';
import { useUser, useFirestore } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [checkedConsent, setCheckedConsent] = useState(false);

    useEffect(() => {
        // E2E Test Hook: Mock User and Firestore Snapshot
        const windowWithMock = window as Window & { __MOCK_USER__?: unknown; __MOCK_CONSENT_STATE__?: { accepted?: boolean } };
        if (typeof window !== 'undefined' && windowWithMock.__MOCK_USER__) {
            const mockConsent = windowWithMock.__MOCK_CONSENT_STATE__;
            const hasConsented = mockConsent?.accepted;
            setShowConsentModal(!hasConsented);
            setCheckedConsent(true);
            return;
        }

        if (!user || !firestore) return;

        const unsubscribe = onSnapshot(doc(firestore, 'users', user.uid), (snapshot) => {
            const data = snapshot.data();
            // Check if consent is missing or false
            let hasConsented = data?.consents?.cloudStorage?.accepted;

            // E2E Test Hook: Allow overriding consent state for testing without Firestore
            const windowMock = window as Window & { __MOCK_CONSENT_STATE__?: { accepted?: boolean } };
            if (typeof window !== 'undefined' && windowMock.__MOCK_CONSENT_STATE__) {
                hasConsented = windowMock.__MOCK_CONSENT_STATE__.accepted;
            }
            setShowConsentModal(!hasConsented);
            setCheckedConsent(true);
        });

        return () => unsubscribe();
    }, [user, firestore]);

    return (
        <>
            <AppLayout>{children}</AppLayout>
            {checkedConsent && showConsentModal && (
                <CloudConsentModal
                    isOpen={true}
                    onConsentComplete={() => setShowConsentModal(false)}
                />
            )}
        </>
    );
}
