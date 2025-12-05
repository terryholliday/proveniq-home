import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AIConfidenceDisplayProps {
    confidenceScore: number; // 0-100
    explanation: string;
    factors: {
        brand: number;
        condition: number;
        age: number;
        materials: number;
        provenance: number;
        market: number;
    };
    valuationRange: {
        min: number;
        max: number;
        currency: string;
    };
}

export function AIConfidenceDisplay({
    confidenceScore,
    explanation,
    factors,
    valuationRange
}: AIConfidenceDisplayProps) {
    // Determine color based on confidence
    const getConfidenceColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <Card className="w-full mt-4 border-l-4 border-l-primary/50">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        AI Valuation Confidence
                    </CardTitle>
                    <Badge variant={confidenceScore >= 80 ? 'default' : 'secondary'}>
                        {confidenceScore}%
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {/* Confidence Bar */}
                <div className="mb-4">
                    <Progress value={confidenceScore} className="h-2" indicatorClassName={getConfidenceColor(confidenceScore)} />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                        Based on {Object.keys(factors).length} data points
                    </p>
                </div>

                {/* Valuation Range */}
                <div className="mb-4 p-3 bg-muted/50 rounded-lg text-center">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                        Estimated Value
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: valuationRange.currency }).format(valuationRange.min)}
                        {' - '}
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: valuationRange.currency }).format(valuationRange.max)}
                    </p>
                </div>

                {/* Explanation */}
                <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-1">Why this value?</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {explanation}
                    </p>
                </div>

                {/* Factors Grid */}
                <div>
                    <h4 className="text-sm font-semibold mb-2">Key Drivers</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {factors.brand > 0 && <Badge variant="outline" className="justify-center">Brand Premium</Badge>}
                        {factors.condition < 0 && <Badge variant="outline" className="justify-center text-destructive border-destructive/50">Condition Impact</Badge>}
                        {factors.provenance > 0 && <Badge variant="outline" className="justify-center bg-blue-50/50 text-blue-700 hover:bg-blue-50">Provenance Verified</Badge>}
                        {factors.age !== 0 && <Badge variant="outline" className="justify-center">Vintage Factor</Badge>}
                        {factors.market !== 0 && <Badge variant="outline" className="justify-center">Market Trend</Badge>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
