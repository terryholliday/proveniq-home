'use client';

import { useState } from 'react';
import { InventoryItem, User } from '@/lib/types';
import { checkPermission, PERMISSIONS } from '@/lib/subscription-service';
import { reevaluateValue, checkMarketValue } from '@/lib/ai-service';
import { Section } from './Section';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowDownRight, ArrowUpRight, LineChart, Loader2, Sparkles, Tag, TrendingUp } from 'lucide-react';

interface SalesToolsProps {
  item: InventoryItem;
  user: User;
  onUpdate: (updates: Partial<InventoryItem>) => void;
  onUpgradeReq: (feature: string) => void;
}

export function SalesTools({ item, user, onUpdate, onUpgradeReq }: SalesToolsProps) {
  const [isReevaluating, setIsReevaluating] = useState(false);
  const [isCheckingMarket, setIsCheckingMarket] = useState(false);
  const hasPermission = checkPermission(user, PERMISSIONS.SALES_ADS);

  const handleReevaluate = async () => {
    if (!hasPermission) { onUpgradeReq('AI Value Insights'); return; }
    setIsReevaluating(true);
    try {
      const result = await reevaluateValue(item.name, item.description, item.condition, item.currentValue, item.purchasePrice);
      if (result && typeof result.newValue === 'number' && result.newValue > 0) {
        onUpdate({ currentValue: result.newValue, valueSource: 'ai-reevaluation' });
      }
    } finally {
      setIsReevaluating(false);
    }
  };

  const handleMarketCheck = async () => {
    if (!hasPermission) { onUpgradeReq('Market Monitor'); return; }
    setIsCheckingMarket(true);
    try {
      const result = await checkMarketValue(item);
      onUpdate({ ...result, lastMarketCheck: new Date().toISOString() });
    } finally {
      setIsCheckingMarket(false);
    }
  };

  const TrendIcon = item.marketTrend === 'up' ? ArrowUpRight : ArrowDownRight;
  const trendColor = item.marketTrend === 'up' ? 'text-green-600' : 'text-red-600';

  if (!hasPermission && !item.currentValue) return null;

  return (
    <Section title="Value & Market Tools" icon={<TrendingUp className="h-5 w-5"/>}>
        {!hasPermission && <Badge variant="secondary" className="mb-2">PRO FEATURE</Badge>}
        <div className="bg-muted/50 p-4 rounded-lg border">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                <div className="flex-1">
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Current Estimated Value</p>
                    <p className="text-3xl font-bold text-primary">${(item.currentValue || item.purchasePrice || 0).toLocaleString()}</p>
                    {item.lastMarketCheck && (
                        <p className="text-xs text-muted-foreground mt-1">Last checked: {new Date(item.lastMarketCheck).toLocaleDateString()}</p>
                    )}
                </div>
                {item.marketTrend && item.marketTrendPercentage !== undefined && (
                     <div className={`flex items-center gap-2 p-2 rounded-md bg-background`}>
                        <TrendIcon size={24} className={trendColor} />
                        <div>
                            <p className={`text-lg font-bold ${trendColor}`}>{item.marketTrendPercentage.toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground font-semibold">Market Trend</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                <Button onClick={handleReevaluate} disabled={isReevaluating || !hasPermission}>
                    {isReevaluating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                    AI Re-evaluate
                </Button>
                <Button onClick={handleMarketCheck} disabled={isCheckingMarket || !hasPermission} variant="outline">
                    {isCheckingMarket ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <LineChart className="mr-2 h-4 w-4"/>}
                    Check Market
                </Button>
            </div>
        </div>

        {item.comparableSales && item.comparableSales.length > 0 && (
            <div className="mt-4">
                <h4 className="font-semibold text-sm mb-2">Recent Comparable Sales</h4>
                <div className="space-y-2">
                    {item.comparableSales.map((comp, i) => (
                        <a key={i} href={comp.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg hover:bg-muted/60 transition-colors">
                            <div className="w-12 h-12 bg-background rounded-md overflow-hidden flex-shrink-0">
                                <img src={comp.imageUrl} alt={comp.title} className="w-full h-full object-cover"/>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground truncate">{comp.title}</p>
                                <p className="text-xs text-muted-foreground">{comp.source} - {new Date(comp.date).toLocaleDateString()}</p>
                            </div>
                            <p className="font-bold text-foreground text-sm">${comp.price.toLocaleString()}</p>
                        </a>
                    ))}
                </div>
            </div>
        )}

    </Section>
  )
}
