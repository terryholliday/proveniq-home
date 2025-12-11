'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Check, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export interface AIAnalysisResult {
    name: string;
    category: string;
    description: string;
    estimatedValue?: number;
    condition?: string;
    brand?: string;
    model?: string;
    confidence: number;
}

interface ItemReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: ReviewedItemData) => void;
    imageUrl: string;
    aiAnalysis: AIAnalysisResult | null;
    isAnalyzing: boolean;
}

export interface ReviewedItemData {
    name: string;
    category: string;
    description: string;
    estimatedValue: number;
    condition: string;
    brand: string;
    model: string;
    imageUrl: string;
}

const CATEGORIES = [
    'Electronics',
    'Furniture',
    'Jewelry',
    'Art',
    'Collectibles',
    'Clothing',
    'Sports Equipment',
    'Musical Instruments',
    'Books & Media',
    'Kitchen & Dining',
    'Tools & Equipment',
    'Outdoor & Garden',
    'Toys & Games',
    'Vehicles',
    'Documents',
    'Other',
];

const CONDITIONS = [
    'New',
    'Like New',
    'Excellent',
    'Good',
    'Fair',
    'Poor',
];

export function ItemReviewModal({
    isOpen,
    onClose,
    onConfirm,
    imageUrl,
    aiAnalysis,
    isAnalyzing,
}: ItemReviewModalProps) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [estimatedValue, setEstimatedValue] = useState<number>(0);
    const [condition, setCondition] = useState('Good');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');

    // Populate fields when AI analysis completes
    useEffect(() => {
        if (aiAnalysis) {
            setName(aiAnalysis.name || '');
            setCategory(aiAnalysis.category || 'Other');
            setDescription(aiAnalysis.description || '');
            setEstimatedValue(aiAnalysis.estimatedValue || 0);
            setCondition(aiAnalysis.condition || 'Good');
            setBrand(aiAnalysis.brand || '');
            setModel(aiAnalysis.model || '');
        }
    }, [aiAnalysis]);

    const handleConfirm = () => {
        onConfirm({
            name,
            category,
            description,
            estimatedValue,
            condition,
            brand,
            model,
            imageUrl,
        });
    };

    const confidenceColor = aiAnalysis?.confidence 
        ? aiAnalysis.confidence >= 0.8 
            ? 'bg-green-100 text-green-800' 
            : aiAnalysis.confidence >= 0.5 
                ? 'bg-amber-100 text-amber-800' 
                : 'bg-red-100 text-red-800'
        : '';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Review Item Details
                    </DialogTitle>
                    <DialogDescription>
                        Our AI has analyzed your image. Review and edit the details below.
                    </DialogDescription>
                </DialogHeader>

                {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-lg font-medium">Analyzing your item...</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            This may take 5-10 seconds
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Image Preview & Confidence */}
                        <div className="flex gap-4">
                            <div className="relative w-32 h-32 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
                                {imageUrl && (
                                    <Image
                                        src={imageUrl}
                                        alt="Item preview"
                                        fill
                                        className="object-cover"
                                    />
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                {aiAnalysis && (
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={confidenceColor}>
                                            <Sparkles className="h-3 w-3 mr-1" />
                                            AI Confidence: {Math.round(aiAnalysis.confidence * 100)}%
                                        </Badge>
                                    </div>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Fields below have been auto-filled by AI. Feel free to make corrections.
                                </p>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Item Name *</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Vintage Rolex Watch"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="brand">Brand</Label>
                                <Input
                                    id="brand"
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    placeholder="e.g., Rolex, Apple, Sony"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="model">Model</Label>
                                <Input
                                    id="model"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    placeholder="e.g., Submariner, iPhone 15 Pro"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="condition">Condition</Label>
                                <Select value={condition} onValueChange={setCondition}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select condition" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CONDITIONS.map((cond) => (
                                            <SelectItem key={cond} value={cond}>
                                                {cond}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
                                <Input
                                    id="estimatedValue"
                                    type="number"
                                    min={0}
                                    value={estimatedValue || ''}
                                    onChange={(e) => setEstimatedValue(Number(e.target.value))}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add any additional details about this item..."
                                rows={3}
                            />
                        </div>

                        {/* AI Notice */}
                        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <p>
                                AI-generated details are estimates and may not be accurate. 
                                Always verify important information like value and authenticity.
                            </p>
                        </div>
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={isAnalyzing}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirm} 
                        disabled={isAnalyzing || !name.trim()}
                        className="gap-2"
                    >
                        <Check className="h-4 w-4" />
                        Prove It
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
