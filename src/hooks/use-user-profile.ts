
'use client';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from '@/lib/types';

export function useUserProfile(user?: User | null) {
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading, error } = useDoc<UserProfile>(userDocRef);

    const createUserProfile = async (user: User, overrides?: Partial<UserProfile>) => {
        if (!firestore) return;
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            const { uid, email, displayName, photoURL, providerData } = user;
            const [firstName, lastName] = displayName?.split(' ') || ['', ''];

            await setDoc(userDocRef, {
                id: uid,
                uid: uid, // Required for Firestore security rules
                email,
                firstName,
                lastName,
                profilePicture: photoURL,
                oauthProvider: providerData[0]?.providerId || 'password',
                oauthId: providerData[0]?.uid || uid,
                permissions: {
                    camera: 'prompt',
                    microphone: 'prompt',
                    location: 'prompt',
                },
                ...overrides,
            });
        } else if (overrides && Object.keys(overrides).length > 0) {
            await setDoc(userDocRef, overrides, { merge: true });
        }
    };

    const updateUserProfile = async (data: Partial<UserProfile>) => {
        if (!userDocRef) return;
        await setDoc(userDocRef, data, { merge: true });
    };

    return { userProfile, isLoading, error, createUserProfile, updateUserProfile };
}
