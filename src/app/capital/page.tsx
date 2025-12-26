'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/firebase/provider';
import { mockInventory } from '@/lib/data';
import { InventoryItem } from '@/lib/types';
import { 
  checkLoanEligibility, 
  requestLoanOffer, 
  getActiveLoans,
  LoanEligibility,
  LoanOffer,
  ActiveLoan 
} from '@/services/capital-integration';
import { 
  Banknote, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ArrowRight,
  Info,
  Wallet
} from 'lucide-react';

export default function CapitalLendingPage() {
  const { user } = useUser();
  const { toast } = useToast();
  
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [requestedAmount, setRequestedAmount] = useState<number>(0);
  const [eligibility, setEligibility] = useState<LoanEligibility | null>(null);
  const [offer, setOffer] = useState<LoanOffer | null>(null);
  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [step, setStep] = useState<'select' | 'eligibility' | 'offer'>('select');

  // Filter eligible assets (must have value and images)
  const eligibleAssets = mockInventory.filter(item => 
    (item.marketValue || item.purchasePrice) && 
    (item.imageUrl || (item.additionalImages && item.additionalImages.length > 0))
  );

  const selectedItems = eligibleAssets.filter(a => selectedAssets.includes(a.id));
  const totalCollateralValue = selectedItems.reduce((sum, a) => sum + (a.marketValue || a.purchasePrice || 0), 0);

  useEffect(() => {
    // Load active loans on mount
    if (user) {
      user.getIdToken().then(token => {
        getActiveLoans(token).then(setActiveLoans);
      });
    }
  }, [user]);

  const handleAssetToggle = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
    setEligibility(null);
    setOffer(null);
  };

  const handleCheckEligibility = async () => {
    if (selectedAssets.length === 0 || !user) return;
    
    setIsChecking(true);
    try {
      const token = await user.getIdToken();
      const result = await checkLoanEligibility(selectedItems, requestedAmount || totalCollateralValue * 0.5, token);
      setEligibility(result);
      setStep('eligibility');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to check eligibility', variant: 'destructive' });
    } finally {
      setIsChecking(false);
    }
  };

  const handleRequestOffer = async () => {
    if (!eligibility?.eligible || !user) return;
    
    setIsRequesting(true);
    try {
      const token = await user.getIdToken();
      const amount = requestedAmount || eligibility.maxLoanAmount;
      const result = await requestLoanOffer(selectedItems, amount, 12, token);
      if (result) {
        setOffer(result);
        setStep('offer');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to get loan offer', variant: 'destructive' });
    } finally {
      setIsRequesting(false);
    }
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <>
      <PageHeader
        title="Asset-Backed Lending"
        description="Unlock the value of your verified assets with PROVENIQ Capital"
      />

      <div className="grid gap-6 max-w-4xl">
        {/* Active Loans Section */}
        {activeLoans.length > 0 && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                Active Loans
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeLoans.map(loan => (
                <div key={loan.loanId} className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <div>
                    <p className="font-semibold">{formatCurrency(loan.remainingBalance)} remaining</p>
                    <p className="text-sm text-muted-foreground">Next payment: {new Date(loan.nextPaymentDate).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={loan.status === 'current' ? 'default' : 'destructive'}>
                    {loan.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Step 1: Select Assets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
              Select Collateral Assets
            </CardTitle>
            <CardDescription>
              Choose verified assets to use as loan collateral. Higher provenance scores unlock better rates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 max-h-[400px] overflow-y-auto">
              {eligibleAssets.length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No eligible assets found. Assets must have photos and a value to be used as collateral.
                  </AlertDescription>
                </Alert>
              ) : (
                eligibleAssets.map(asset => (
                  <div 
                    key={asset.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedAssets.includes(asset.id) 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleAssetToggle(asset.id)}
                  >
                    <Checkbox 
                      checked={selectedAssets.includes(asset.id)}
                      onCheckedChange={() => handleAssetToggle(asset.id)}
                    />
                    {asset.imageUrl && (
                      <img src={asset.imageUrl} alt={asset.name} className="w-12 h-12 rounded object-cover" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{asset.name}</p>
                      <p className="text-sm text-muted-foreground">{asset.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(asset.marketValue || asset.purchasePrice || 0)}</p>
                      {asset.provenanceScore && (
                        <Badge variant={asset.provenanceScore >= 70 ? 'default' : 'secondary'} className="text-xs">
                          {asset.provenanceScore}% verified
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {selectedAssets.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-muted-foreground">{selectedAssets.length} assets selected</span>
                  <span className="font-bold text-lg">{formatCurrency(totalCollateralValue)} total value</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label>Requested Loan Amount (optional)</Label>
                    <Input
                      type="number"
                      placeholder={`Max ~${formatCurrency(totalCollateralValue * 0.5)}`}
                      value={requestedAmount || ''}
                      onChange={(e) => setRequestedAmount(Number(e.target.value))}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Leave blank for maximum eligible amount</p>
                  </div>
                  
                  <Button 
                    onClick={handleCheckEligibility} 
                    disabled={isChecking}
                    className="w-full"
                  >
                    {isChecking ? 'Checking...' : 'Check Eligibility'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Eligibility Results */}
        {eligibility && (
          <Card className={eligibility.eligible ? 'border-green-200' : 'border-red-200'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
                Eligibility Results
                {eligibility.eligible ? (
                  <Badge className="bg-green-100 text-green-800 ml-2"><CheckCircle className="w-3 h-3 mr-1" /> Eligible</Badge>
                ) : (
                  <Badge variant="destructive" className="ml-2"><AlertTriangle className="w-3 h-3 mr-1" /> Not Eligible</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Banknote className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{formatCurrency(eligibility.maxLoanAmount)}</p>
                  <p className="text-sm text-muted-foreground">Max Loan Amount</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{formatPercent(eligibility.estimatedRate)}</p>
                  <p className="text-sm text-muted-foreground">Est. APR</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{formatPercent(eligibility.ltv)}</p>
                  <p className="text-sm text-muted-foreground">Loan-to-Value</p>
                </div>
              </div>

              {eligibility.reasons.length > 0 && (
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc pl-4 space-y-1">
                      {eligibility.reasons.map((reason, i) => <li key={i}>{reason}</li>)}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {eligibility.requiredCovenants.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">Required Covenants:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {eligibility.requiredCovenants.map((covenant, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {covenant}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {eligibility.eligible && (
                <Button onClick={handleRequestOffer} disabled={isRequesting} className="w-full">
                  {isRequesting ? 'Generating Offer...' : 'Get Loan Offer'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Loan Offer */}
        {offer && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
                Your Loan Offer
                <Badge className="ml-2"><Clock className="w-3 h-3 mr-1" /> Expires in 24h</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 mb-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground">Loan Amount</p>
                  <p className="text-4xl font-bold text-primary">{formatCurrency(offer.principal)}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{formatPercent(offer.apr)}</p>
                    <p className="text-xs text-muted-foreground">APR</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{offer.term} mo</p>
                    <p className="text-xs text-muted-foreground">Term</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(offer.monthlyPayment)}</p>
                    <p className="text-xs text-muted-foreground">Monthly</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Interest</span>
                  <span>{formatCurrency(offer.totalInterest)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total Repayment</span>
                  <span>{formatCurrency(offer.totalRepayment)}</span>
                </div>
              </div>

              <Alert className="mb-4">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your assets remain in your possession. PROVENIQ monitors custody via Ledger events.
                  Loan terms are enforced through smart covenants.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setOffer(null)}>
                  Decline
                </Button>
                <Button className="flex-1" onClick={() => {
                  toast({ title: 'Coming Soon', description: 'Loan acceptance will be available when Capital launches.' });
                }}>
                  Accept Offer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
