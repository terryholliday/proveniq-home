'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { UploadCloud, Camera, QrCode, Loader2, AlertCircle, CheckCircle2, Images } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFirebase, useUser } from '@/firebase/provider';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ItemReviewModal, AIAnalysisResult, ReviewedItemData } from '@/components/inventory/ItemReviewModal';

interface UploadProgress {
    fileName: string;
    status: 'pending' | 'uploading' | 'analyzing' | 'complete' | 'error';
    itemId?: string;
    error?: string;
}

interface PendingReview {
    imageUrl: string;
    aiAnalysis: AIAnalysisResult | null;
    file: File;
}

export default function AddItemPage() {
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useUser();
    const { firebaseApp, firestore } = useFirebase();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showMultiAlert, setShowMultiAlert] = useState(false);
    
    // Review modal state
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
    const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

    const getStorage = async () => {
        const { getStorage } = await import('firebase/storage');
        return getStorage(firebaseApp!);
    };

    // Mock AI analysis - in production this would call your AI endpoint
    const analyzeImage = async (imageUrl: string): Promise<AIAnalysisResult> => {
        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
        
        // Mock AI response - in production, call your vision AI API
        return {
            name: 'Detected Item',
            category: 'Electronics',
            description: 'AI-detected item. Please review and update the details.',
            estimatedValue: Math.floor(Math.random() * 500) + 50,
            condition: 'Good',
            brand: '',
            model: '',
            confidence: 0.75 + Math.random() * 0.2,
        };
    };

    const uploadAndAnalyze = async (file: File): Promise<PendingReview | null> => {
        if (!user) return null;

        try {
            // 1. Upload to Firebase Storage
            const storage = await getStorage();
            const storageRef = ref(storage, `users/${user.uid}/uploads/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // 2. Analyze with AI
            const aiAnalysis = await analyzeImage(downloadURL);

            return {
                imageUrl: downloadURL,
                aiAnalysis,
                file,
            };
        } catch (error) {
            console.error("Upload/analyze failed", error);
            return null;
        }
    };

    const saveItem = async (data: ReviewedItemData): Promise<string | null> => {
        if (!user || !firestore) return null;

        try {
            // 1. Get Core valuation (async, don't block save)
            let coreValuation = data.estimatedValue;
            try {
                const valResponse = await fetch('/api/core/valuation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: `temp-${Date.now()}`,
                        name: data.name,
                        category: data.category,
                        condition: data.condition?.toLowerCase() || 'good',
                        brand: data.brand,
                        model: data.model,
                        purchasePrice: data.estimatedValue,
                    }),
                });
                if (valResponse.ok) {
                    const valData = await valResponse.json();
                    coreValuation = valData.estimatedValue || data.estimatedValue;
                    console.log('[Core] Valuation received:', coreValuation);
                }
            } catch (e) {
                console.warn('[Core] Valuation unavailable, using AI estimate');
            }

            // 2. Save to Firestore
            const docRef = await addDoc(collection(firestore, 'items'), {
                userId: user.uid,
                name: data.name,
                description: data.description,
                imageUrl: data.imageUrl,
                category: data.category,
                condition: data.condition,
                brand: data.brand,
                model: data.model,
                marketValue: coreValuation,
                purchasePrice: data.estimatedValue,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                quantity: 1,
                tenantId: 'consumer',
                status: 'active'
            });

            // 3. Register with Core to get PAID (async, don't block UI)
            try {
                const regResponse = await fetch('/api/core/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.uid,
                        item: {
                            id: docRef.id,
                            name: data.name,
                            category: data.category,
                            estimatedValue: coreValuation,
                            condition: data.condition?.toLowerCase() || 'good',
                        },
                    }),
                });
                if (regResponse.ok) {
                    const regData = await regResponse.json();
                    if (regData.paid) {
                        // Update Firestore with PAID
                        await updateDoc(doc(firestore, 'items', docRef.id), {
                            paid: regData.paid,
                            coreRegisteredAt: new Date().toISOString(),
                        });
                        console.log('[Core] Asset registered with PAID:', regData.paid);
                    }
                }
            } catch (e) {
                console.warn('[Core] PAID registration unavailable');
            }

            return docRef.id;
        } catch (error) {
            console.error("Save failed", error);
            return null;
        }
    };

    const handleReviewConfirm = async (data: ReviewedItemData) => {
        const itemId = await saveItem(data);
        
        if (itemId) {
            // Check if there are more items to review
            if (currentReviewIndex < pendingReviews.length - 1) {
                setCurrentReviewIndex(prev => prev + 1);
                toast({ title: "Item Saved", description: `${currentReviewIndex + 1} of ${pendingReviews.length} items added.` });
            } else {
                // All items reviewed
                setShowReviewModal(false);
                setPendingReviews([]);
                setCurrentReviewIndex(0);
                
                if (pendingReviews.length === 1) {
                    toast({ title: "Item Added!", description: "Your item has been added to inventory." });
                    router.push(`/inventory/${itemId}`);
                } else {
                    toast({ title: `${pendingReviews.length} Items Added!`, description: "All items have been added to inventory." });
                    router.push('/inventory');
                }
            }
        } else {
            toast({ title: "Error", description: "Failed to save item.", variant: "destructive" });
        }
    };

    const handleReviewClose = () => {
        // If user closes mid-review, save remaining as drafts or discard
        setShowReviewModal(false);
        setPendingReviews([]);
        setCurrentReviewIndex(0);
        setIsUploading(false);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0 || !user || !firestore) return;

        const fileArray = Array.from(files);
        const isMultiple = fileArray.length > 1;

        // Show alert for multiple files
        if (isMultiple) {
            setShowMultiAlert(true);
        }

        // Initialize upload queue
        setUploadQueue(fileArray.map(f => ({
            fileName: f.name,
            status: 'pending'
        })));

        setIsUploading(true);
        const reviews: PendingReview[] = [];

        // Process files sequentially - upload and analyze
        for (let i = 0; i < fileArray.length; i++) {
            setCurrentIndex(i);
            setUploadQueue(prev => prev.map((p, idx) => 
                idx === i ? { ...p, status: 'uploading' } : p
            ));

            const review = await uploadAndAnalyze(fileArray[i]);
            
            if (review) {
                reviews.push(review);
                setUploadQueue(prev => prev.map((p, idx) => 
                    idx === i ? { ...p, status: 'complete' } : p
                ));
            } else {
                setUploadQueue(prev => prev.map((p, idx) => 
                    idx === i ? { ...p, status: 'error', error: 'Failed to process' } : p
                ));
            }
        }

        setIsUploading(false);
        setShowMultiAlert(false);

        // Open review modal with all processed items
        if (reviews.length > 0) {
            setPendingReviews(reviews);
            setCurrentReviewIndex(0);
            setShowReviewModal(true);
        } else {
            toast({ title: "Error", description: "No items could be processed.", variant: "destructive" });
        }
    };

    const currentReview = pendingReviews[currentReviewIndex];

    const completedCount = uploadQueue.filter(p => p.status === 'complete').length;
    const progressPercent = uploadQueue.length > 0 ? (completedCount / uploadQueue.length) * 100 : 0;

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
                        <div className="space-y-4">
                            {showMultiAlert && (
                                <Alert>
                                    <Images className="h-4 w-4" />
                                    <AlertTitle>Processing Multiple Items</AlertTitle>
                                    <AlertDescription>
                                        Each image is treated as a separate item. This may take <strong>5-10 seconds per item</strong> to upload and analyze.
                                    </AlertDescription>
                                </Alert>
                            )}
                            
                            <div className="bg-card rounded-lg border p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium">
                                        Processing {currentIndex + 1} of {uploadQueue.length} items
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {Math.round(progressPercent)}%
                                    </span>
                                </div>
                                <Progress value={progressPercent} className="mb-4" />
                                
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {uploadQueue.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-sm">
                                            {item.status === 'pending' && (
                                                <div className="w-4 h-4 rounded-full border-2 border-muted" />
                                            )}
                                            {item.status === 'uploading' && (
                                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                            )}
                                            {item.status === 'analyzing' && (
                                                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                                            )}
                                            {item.status === 'complete' && (
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            )}
                                            {item.status === 'error' && (
                                                <AlertCircle className="w-4 h-4 text-red-500" />
                                            )}
                                            <span className={item.status === 'complete' ? 'text-muted-foreground' : ''}>
                                                {item.fileName}
                                            </span>
                                            {item.status === 'uploading' && (
                                                <span className="text-xs text-blue-500">Uploading...</span>
                                            )}
                                            {item.status === 'analyzing' && (
                                                <span className="text-xs text-amber-500">Analyzing...</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                <p className="mb-2 text-sm font-semibold">Drag & drop images here</p>
                                <p className="text-sm text-muted-foreground">or <span className="text-primary font-semibold hover:underline">Browse files</span></p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    <Images className="inline w-3 h-3 mr-1" />
                                    Select multiple images for batch upload
                                </p>
                            </div>
                            <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/*" multiple />
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

            {/* Item Review Modal */}
            {currentReview && (
                <ItemReviewModal
                    isOpen={showReviewModal}
                    onClose={handleReviewClose}
                    onConfirm={handleReviewConfirm}
                    imageUrl={currentReview.imageUrl}
                    aiAnalysis={currentReview.aiAnalysis}
                    isAnalyzing={isAnalyzing}
                />
            )}

            {/* Multi-item review indicator */}
            {showReviewModal && pendingReviews.length > 1 && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50">
                    Reviewing item {currentReviewIndex + 1} of {pendingReviews.length}
                </div>
            )}
        </div>
    );
}
