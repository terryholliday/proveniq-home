'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { UploadCloud, Camera, QrCode } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddItemPage() {
    const { toast } = useToast();
    const router = useRouter();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            toast({
                title: "File Selected",
                description: `${file.name} is ready to be scanned.`,
            });
            // In a real implementation, you would proceed to the scanning/details page
            // For now, let's just show a toast.
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="mx-auto w-full max-w-lg">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold">Add New Item</h1>
                    <Link href="/inventory" passHref>
                        <Button variant="ghost" size="icon" aria-label="Close">
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        </Button>
                    </Link>
                </div>

                <div className="space-y-6">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-foreground font-semibold">Drag & drop images here</p>
                            <p className="text-sm text-muted-foreground">or <span className="text-primary font-semibold hover:underline">Browse files</span></p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                    </label>

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
