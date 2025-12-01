
'use client';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export function useUserProfile(user: User | null) {
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading, error } = useDoc(userDocRef);

    const createUserProfile = async (user: User) => {
        if (!firestore) return;
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            const { uid, email, displayName, photoURL, providerData } = user;
            const [firstName, lastName] = displayName?.split(' ') || ['', ''];
            
            await setDoc(userDocRef, {
                id: uid,
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
                }
            });
        }
    };

    const updateUserProfile = async (data: any) => {
        if (!userDocRef) return;
        await setDoc(userDocRef, data, { merge: true });
    };

    return { userProfile, isLoading, error, createUserProfile, updateUserProfile };
}
