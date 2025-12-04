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
        if (!user || !firestore) return;

        const unsubscribe = onSnapshot(doc(firestore, 'users', user.uid), (snapshot) => {
            const data = snapshot.data();
            // Check if consent is missing or false
            const hasConsented = data?.consents?.cloudStorage?.accepted;
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
