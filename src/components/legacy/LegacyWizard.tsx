'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, ChevronRight, ChevronLeft, FileText, Loader2 } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase/provider';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type WizardStep = 'intro' | 'state' | 'type' | 'details' | 'review' | 'success';

export function LegacyWizard() {
    const [step, setStep] = useState<WizardStep>('intro');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const firestore = useFirestore();
    const { user } = useUser();

    const [formData, setFormData] = useState({
        state: '',
        docType: '',
        fullName: '',
        beneficiary: '',
    });

    const updateData = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const nextStep = (next: WizardStep) => setStep(next);

    const handleGenerate = async () => {
        if (!user) {
            setError('You must be signed in to save documents.');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            await addDoc(collection(firestore, 'legacy_documents'), {
                userId: user.uid,
                ...formData,
                createdAt: serverTimestamp(),
                status: 'draft',
                version: 1
            });
            nextStep('success');
        } catch (err) {
            console.error('Error saving document:', err);
            setError('Failed to save document. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const renderIntro = () => (
        <Card className="border-dashed border-primary/50 bg-primary/5">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4 w-fit">
                    <FileText className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Create Your Legal Documents</CardTitle>
                <CardDescription>
                    Our wizard helps you draft a starting document in minutes.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                <Button onClick={() => nextStep('state')} size="lg">Start Free Draft</Button>
            </CardContent>
            <CardFooter className="justify-center text-xs text-muted-foreground">
                *State-specific templates available for FL, NY, CA, TX.
            </CardFooter>
        </Card>
    );

    const renderState = () => (
        <Card>
            <CardHeader>
                <CardTitle>Where do you live?</CardTitle>
                <CardDescription>Laws vary by state. We need this to select the right template.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Select Your State</Label>
                        <Select value={formData.state} onValueChange={(val) => updateData('state', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select State" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FL">Florida</SelectItem>
                                <SelectItem value="NY">New York</SelectItem>
                                <SelectItem value="CA">California</SelectItem>
                                <SelectItem value="TX">Texas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={() => nextStep('intro')}>Cancel</Button>
                <Button onClick={() => nextStep('type')} disabled={!formData.state}>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );

    const renderType = () => (
        <Card>
            <CardHeader>
                <CardTitle>What document do you need?</CardTitle>
                <CardDescription>Choose the type of legal protection you want to create.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4">
                    {[
                        { id: 'will', title: 'Last Will & Testament', desc: 'Distribute assets and appoint guardians.' },
                        { id: 'trust', title: 'Living Trust', desc: 'Manage assets and avoid probate.' },
                        { id: 'poa', title: 'Power of Attorney', desc: 'Appoint someone to make decisions for you.' },
                    ].map((type) => (
                        <div
                            key={type.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${formData.docType === type.id ? 'border-primary bg-primary/5' : 'hover:bg-slate-50'}`}
                            onClick={() => updateData('docType', type.id)}
                        >
                            <div className="font-semibold">{type.title}</div>
                            <div className="text-sm text-muted-foreground">{type.desc}</div>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={() => nextStep('state')}><ChevronLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button onClick={() => nextStep('details')} disabled={!formData.docType}>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );

    const renderDetails = () => (
        <Card>
            <CardHeader>
                <CardTitle>Basic Details</CardTitle>
                <CardDescription>We need a few details to populate your {formData.docType === 'will' ? 'Will' : 'Document'}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Your Full Legal Name</Label>
                    <Input
                        placeholder="e.g. John Doe"
                        value={formData.fullName}
                        onChange={(e) => updateData('fullName', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Primary Beneficiary</Label>
                    <Input
                        placeholder="e.g. Jane Doe"
                        value={formData.beneficiary}
                        onChange={(e) => updateData('beneficiary', e.target.value)}
                    />
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={() => nextStep('type')}><ChevronLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button onClick={() => nextStep('review')} disabled={!formData.fullName || !formData.beneficiary}>
                    Review <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );

    const renderReview = () => (
        <Card>
            <CardHeader>
                <CardTitle>Review & Generate</CardTitle>
                <CardDescription>Please verify your information before generating the draft.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">State:</span>
                        <span className="font-medium">{formData.state}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Document:</span>
                        <span className="font-medium uppercase">{formData.docType}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{formData.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Beneficiary:</span>
                        <span className="font-medium">{formData.beneficiary}</span>
                    </div>
                </div>
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                <div className="text-xs text-muted-foreground text-center">
                    By clicking Generate, you acknowledge that this is a draft and not a substitute for legal advice.
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={() => nextStep('details')} disabled={isSaving}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleGenerate} className="w-full ml-4" disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                        </>
                    ) : (
                        'Generate Document'
                    )}
                </Button>
            </CardFooter>
        </Card>
    );

    const renderSuccess = () => (
        <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
                <div className="mx-auto bg-green-100 p-4 rounded-full mb-4 w-fit">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-green-800">Draft Generated!</CardTitle>
                <CardDescription className="text-green-700">
                    Your {formData.docType} draft has been saved to your vault.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button className="w-full" variant="outline" onClick={() => {
                    setFormData({ state: '', docType: '', fullName: '', beneficiary: '' });
                    nextStep('intro');
                }}>
                    Create Another
                </Button>
            </CardContent>
        </Card>
    );

    switch (step) {
        case 'intro': return renderIntro();
        case 'state': return renderState();
        case 'type': return renderType();
        case 'details': return renderDetails();
        case 'review': return renderReview();
        case 'success': return renderSuccess();
        default: return renderIntro();
    }
}
