'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { UploadCloud, Camera, QrCode, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFirebase, useUser } from '@/firebase/provider';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function AddItemPage() {
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useUser();
    const { firebaseApp, firestore } = useFirebase();
    const [isUploading, setIsUploading] = useState(false);

    const getStorage = async () => {
        const { getStorage } = await import('firebase/storage');
        return getStorage(firebaseApp!);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user || !firestore) return;

        setIsUploading(true);
        try {
            // 1. Upload to Firebase Storage
            const storage = await getStorage();
            const storageRef = ref(storage, `users/${user.uid}/uploads/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // 2. Create Firestore Record
            const docRef = await addDoc(collection(firestore, 'items'), {
                userId: user.uid,
                name: file.name.split('.')[0] || 'New Item',
                description: 'Processing image...',
                imageUrl: downloadURL,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                category: 'Uncategorized',
                quantity: 1,
                tenantId: 'consumer',
                status: 'draft'
            });

            toast({ title: "Image Uploaded", description: "Analyzing item..." });
            router.push(`/inventory/${docRef.id}`);

        } catch (error: any) {
            console.error("Upload failed", error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="mx-auto w-full max-w-lg">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold">Add New Item</h1>
                    <Link href="/inventory" passHref>
                        <Button variant="ghost" size="icon"><span className="text-xl">×</span></Button>
                    </Link>
                </div>
                <div className="space-y-6">
                    {isUploading ? (
                        <div className="flex flex-col items-center justify-center h-52 bg-card rounded-lg border">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <p>Uploading and analyzing...</p>
                        </div>
                    ) : (
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                <p className="mb-2 text-sm font-semibold">Drag & drop images here</p>
                                <p className="text-sm text-muted-foreground">or <span className="text-primary font-semibold hover:underline">Browse files</span></p>
                            </div>
                            <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                        </label>
                    )}

                    <div className="relative flex items-center">
                        <div className="flex-grow border-t border-border"></div>
                        <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase">OR</span>
                        <div className="flex-grow border-t border-border"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="h-20 flex-col gap-2">
                            <Camera className="h-6 w-6" />
                            <span>Use Camera</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex-col gap-2">
                            <QrCode className="h-6 w-6" />
                            <span>Scan QR Code</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
