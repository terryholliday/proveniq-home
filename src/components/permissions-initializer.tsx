'use client';

import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useToast } from '@/hooks/use-toast';

export function PermissionsInitializer() {
    const { user } = useUser();
    const { userProfile, updateUserProfile } = useUserProfile(user);
    const { toast } = useToast();

    useEffect(() => {
        if (userProfile && updateUserProfile) {
            const requestPermissions = async () => {
                const permissionsToRequest: ('camera' | 'microphone' | 'location')[] = [];

                if (userProfile.permissions?.camera === 'prompt') {
                    permissionsToRequest.push('camera');
                }
                if (userProfile.permissions?.microphone === 'prompt') {
                    permissionsToRequest.push('microphone');
                }
                if (userProfile.permissions?.location === 'prompt') {
                    permissionsToRequest.push('location');
                }
                
                if (permissionsToRequest.length === 0) return;

                // For simplicity, we request them sequentially.
                // In a real app, you might want a more sophisticated UI flow.

                try {
                    if (permissionsToRequest.includes('camera') || permissionsToRequest.includes('microphone')) {
                        const stream = await navigator.mediaDevices.getUserMedia({ 
                            video: permissionsToRequest.includes('camera'), 
                            audio: permissionsToRequest.includes('microphone')
                        });
                        
                        if(permissionsToRequest.includes('camera')) await updateUserProfile({ 'permissions.camera': 'granted' });
                        if(permissionsToRequest.includes('microphone')) await updateUserProfile({ 'permissions.microphone': 'granted' });

                        // Important: Stop the tracks immediately to turn off camera/mic light
                        stream.getTracks().forEach(track => track.stop());
                    }
                } catch (err) {
                    if(permissionsToRequest.includes('camera')) await updateUserProfile({ 'permissions.camera': 'denied' });
                    if(permissionsToRequest.includes('microphone')) await updateUserProfile({ 'permissions.microphone': 'denied' });
                    toast({
                        variant: 'destructive',
                        title: 'Permissions Denied',
                        description: 'Camera or microphone access was denied. Some features may not work.',
                    });
                }
                
                try {
                    if (permissionsToRequest.includes('location')) {
                        await new Promise((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(
                                async (position) => {
                                    await updateUserProfile({ 'permissions.location': 'granted' });
                                    resolve(position);
                                },
                                async (error) => {
                                    await updateUserProfile({ 'permissions.location': 'denied' });
                                    reject(error);
                                }
                            );
                        });
                    }
                } catch (err) {
                    toast({
                        variant: 'destructive',
                        title: 'Location Access Denied',
                        description: 'Location access was denied. Some features may not work.',
                    });
                }
            };

            requestPermissions();
        }
    }, [userProfile, updateUserProfile, toast]);

    return null; // This component doesn't render anything
}
