'use client';

import { useState, Suspense } from 'react';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Upload, Trash2, LogOut, Link as LinkIcon, Cloud, AlertTriangle, Mail, Facebook, Store, ShoppingBag, BookText } from "lucide-react";
import Link from "next/link";
import { TermsOfService, PrivacyPolicy, EULA, AIDisclosure } from './legaldocs';
import { useSearchParams } from 'next/navigation';

const SectionHeader = ({ icon, title }: { icon: React.ElementType, title: string }) => {
    const Icon = icon;
    return (
        <div className="flex items-center gap-2 mb-4">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        </div>
    );
};

const IntegrationCard = ({ icon, title, description }: { icon: React.ElementType, title: string, description: string }) => {
    const Icon = icon;
    return (
        <Card>
            <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                    <div>
                        <h3 className="font-semibold">{title}</h3>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                </div>
                <Button>Connect</Button>
            </CardContent>
        </Card>
    )
}

function SettingsContent() {
    const searchParams = useSearchParams();
    const docParam = searchParams.get('doc');
    const [legalView, setLegalView] = useState<'tos' | 'privacy' | 'eula' | 'ai' | null>(
        (docParam === 'tos' || docParam === 'privacy' || docParam === 'eula' || docParam === 'ai') ? docParam : null
    );

    const handleBack = () => setLegalView(null);

    if (legalView) {
        if (legalView === 'tos') return <TermsOfService onBack={handleBack} />;
        if (legalView === 'privacy') return <PrivacyPolicy onBack={handleBack} />;
        if (legalView === 'eula') return <EULA onBack={handleBack} />;
        if (legalView === 'ai') return <AIDisclosure onBack={handleBack} />;
    }

    return (
        <>
            <PageHeader
                title="Settings"
                description="Manage your data, preferences, and integrations."
            />
            <div className="grid gap-8 max-w-4xl mx-auto">
                <div>
                    <SectionHeader icon={LinkIcon} title="Integrations" />
                    <div className="grid gap-4">
                        <IntegrationCard icon={Mail} title="Gmail" description="Automatically import purchases from your inbox." />
                        <IntegrationCard icon={Mail} title="Outlook" description="Connect your Microsoft account for imports." />
                        <IntegrationCard icon={Facebook} title="Facebook" description="List items on Facebook Marketplace." />
                        <IntegrationCard icon={Store} title="Ebay" description="Manage your listings and sales on Ebay." />
                        <IntegrationCard icon={ShoppingBag} title="OfferUp" description="Post items for sale on OfferUp." />
                    </div>
                </div>

                <div>
                    <SectionHeader icon={Cloud} title="Data Management" />
                    <Card>
                        <CardHeader>
                            <CardTitle>Download or Restore Data</CardTitle>
                            <CardDescription>Download a backup of all your data or restore from a file. Backups are saved to your computer.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row gap-4">
                            <Button variant="outline" className="w-full justify-center">
                                <Download className="mr-2 h-4 w-4" />
                                Download Backup
                            </Button>
                            <Button variant="outline" className="w-full justify-center">
                                <Upload className="mr-2 h-4 w-4" />
                                Restore from File
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <SectionHeader icon={BookText} title="Legal" />
                    <Card>
                        <CardContent className="p-4 grid gap-2">
                            <Button variant="ghost" className="justify-start" onClick={() => setLegalView('tos')}>Terms of Service</Button>
                            <Button variant="ghost" className="justify-start" onClick={() => setLegalView('privacy')}>Privacy Policy</Button>
                            <Button variant="ghost" className="justify-start" onClick={() => setLegalView('eula')}>End User License Agreement</Button>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <SectionHeader icon={AlertTriangle} title="Danger Zone" />
                    <Alert variant="destructive" className="flex items-center justify-between">
                        <div>
                            <AlertTitle className="font-semibold">Clear All Data</AlertTitle>
                            <AlertDescription>
                                This will permanently delete your entire inventory, categories, and settings. This action cannot be undone.
                            </AlertDescription>
                        </div>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear All Data
                        </Button>
                    </Alert>
                </div>

                <div>
                    <SectionHeader icon={LogOut} title="Account Actions" />
                    <Card>
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Sign Out</h3>
                                <p className="text-sm text-muted-foreground">You will be returned to the login screen.</p>
                            </div>
                            <Link href="/login" passHref>
                                <Button variant="destructive">Sign Out</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Security Section */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        {/* Shield Icon inline */}
                        <svg className="h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        <h2 className="text-xl font-semibold tracking-tight">Security</h2>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Biometric Authentication</CardTitle>
                            <CardDescription>Use your face or fingerprint to sign in securely.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Supported on devices with FaceID, TouchID, or Hello.
                            </div>
                            <Button variant="outline" onClick={() => {
                                import('@/firebase/non-blocking-login').then(mod => {
                                    // We need to pass the current auth user here. 
                                    // Since we are in settings, we assume user is logged in.
                                    // For now just call the stub.
                                    // mod.registerPasskey(auth, user);
                                    alert("Passkey registration initiated (stub).");
                                });
                            }}>
                                Register Passkey
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <SettingsContent />
        </Suspense>
    );
}
