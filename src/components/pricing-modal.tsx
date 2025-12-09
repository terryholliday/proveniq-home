import React, { useState } from 'react';
import { User, SubscriptionTier } from '@/lib/types';
import { updateUser } from '@/services/mockAuthService';
import { Check, Star, Crown, Zap, X, ShieldCheck, CreditCard, ChevronLeft, Loader2 } from 'lucide-react';
import { getEffectiveTier } from '@/lib/subscription-service';

interface PricingModalProps {
    currentUser: User;
    onClose: () => void;
    onUpgradeSuccess: () => void;
    targetFeature?: string;
}

interface PlanDetails {
    id: SubscriptionTier;
    name: string;
    priceStr: string;
    period: string;
    features: string[];
    colorClass: string;
    icon: React.ReactNode;
    isPopular?: boolean;
    contractNote?: string;
}

const PricingModal: React.FC<PricingModalProps> = ({ currentUser, onClose, onUpgradeSuccess, targetFeature }) => {
    const effectiveTier = getEffectiveTier(currentUser);
    const [step, setStep] = useState<'selection' | 'checkout'>('selection');
    const [selectedPlan, setSelectedPlan] = useState<PlanDetails | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Mock Form State
    const [cardNum, setCardNum] = useState('');
    const [exp, setExp] = useState('');
    const [cvc, setCvc] = useState('');

    const plans: PlanDetails[] = [
        {
            id: 'free',
            name: "MyARK Free",
            priceStr: "$0",
            period: "Forever",
            icon: <Star size={24} className="text-gray-400" />,
            colorClass: "bg-white",
            features: ["Up to 50 Items", "Basic AI Scanning", "Local Storage", "1 Beneficiary"]
        },
        {
            id: 'plus',
            name: "MyARK Premium",
            priceStr: "$9.99",
            period: "/mo",
            icon: <Zap size={24} className="text-indigo-500" fill="currentColor" />,
            colorClass: "bg-indigo-50 border-indigo-200",
            isPopular: true,
            features: ["Unlimited Items", "AI Sales Ad Writer", "AI Move Planner with QR Labels", "Legacy Video Story Recording", "PDF & CSV Insurance Reports", "Unlimited Beneficiaries"]
        },
        {
            id: 'pro',
            name: "MyARK Pro",
            priceStr: "$19.99",
            period: "/mo",
            icon: <Crown size={24} className="text-amber-500" fill="currentColor" />,
            colorClass: "bg-amber-50 border-amber-200",
            features: ["Everything in Premium", "ARKive Auctions Platform (15% commission)", "AI Risk Assessment & Disaster Sim", "Automated HO3 & Warranty Claims", "Advanced Market Valuation & Trends", "Email Purchase Importer", "AR Item Finder"]
        }
    ];

    const handleSelectPlan = (plan: PlanDetails) => {
        if (plan.id === 'free') {
            processUpgrade(plan.id);
        } else {
            setSelectedPlan(plan);
            setStep('checkout');
        }
    };

    const processUpgrade = async (tier: SubscriptionTier) => {
        setIsProcessing(true);
        // Simulate Network Request
        await new Promise(resolve => setTimeout(resolve, 2000));

        const updatedUser = {
            ...currentUser,
            tier,
            subscriptionStatus: 'active' as const,
            trialEndDate: undefined
        };
        updateUser(updatedUser);
        onUpgradeSuccess();
        setIsProcessing(false);
    };

    const PlanCard: React.FC<{ plan: PlanDetails }> = ({ plan }) => {
        const isCurrent = effectiveTier === plan.id;
        const isTrialingThis = currentUser.subscriptionStatus === 'trial' && plan.id === 'pro';

        return (
            <div className={`relative p-6 rounded-2xl border-2 flex flex-col h-full transition-all ${isCurrent ? 'border-gray-300 bg-gray-50 opacity-90' : 'border-gray-100 hover:border-indigo-300 hover:shadow-lg'} ${plan.id === 'plus' ? 'border-indigo-100' : ''} ${plan.id === 'pro' ? 'border-amber-100' : ''}`}>
                {plan.isPopular && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        MOST POPULAR
                    </div>
                )}
                {isTrialingThis && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        TRIAL ACTIVE
                    </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-white shadow-sm border border-gray-100`}>
                        {plan.icon}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{plan.name}</h3>
                    </div>
                </div>

                <div className="mb-6">
                    <span className="text-3xl font-extrabold text-gray-900">{plan.priceStr}</span>
                    <span className="text-gray-500 text-xs font-medium block">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <Check size={16} className={`shrink-0 mt-0.5 text-green-600`} />
                            <span>{f}</span>
                        </li>
                    ))}
                </ul>

                <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isCurrent && !isTrialingThis}
                    className={`w-full py-3 rounded-xl font-bold transition-all text-sm ${isCurrent && !isTrialingThis
                            ? 'bg-gray-200 text-gray-500 cursor-default'
                            : plan.id === 'pro'
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-200'
                                : plan.id === 'plus'
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200'
                                    : 'bg-gray-800 text-white hover:bg-gray-900'
                        }`}
                >
                    {isTrialingThis ? 'Confirm Annual Plan' : (isCurrent ? 'Current Plan' : `Choose ${plan.name}`)}
                </button>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">

                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-2">
                        {step === 'checkout' && (
                            <button onClick={() => setStep('selection')} className="mr-2 p-1 hover:bg-gray-200 rounded-full transition-colors">
                                <ChevronLeft size={24} className="text-gray-600" />
                            </button>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{step === 'checkout' ? 'Secure Checkout' : 'Unlock Full Potential'}</h2>
                            {targetFeature && step === 'selection' && (
                                <p className="text-indigo-600 font-medium text-sm flex items-center gap-1 mt-1">
                                    <Zap size={14} fill="currentColor" /> {targetFeature} requires an upgrade
                                </p>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50">
                    {step === 'selection' ? (
                        <div className="p-6">
                            <div className="grid md:grid-cols-3 gap-4 mb-6">
                                {plans.map(plan => <PlanCard plan={plan} key={plan.id} />)}
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-600 flex items-start gap-3 shadow-sm">
                                <ShieldCheck size={20} className="shrink-0 mt-0.5 text-green-600" />
                                <div>
                                    <p className="font-bold text-gray-800">Secure & Transparent Pricing</p>
                                    <p>
                                        All new accounts start with a 14-day free trial of MyARK Pro.
                                        Payments are processed securely. No hidden fees.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 max-w-2xl mx-auto">
                            {selectedPlan && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className={`p-6 border-b border-gray-100 ${selectedPlan.colorClass}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{selectedPlan.name} Subscription</h3>
                                                <p className="text-gray-500 text-sm mt-1">{selectedPlan.contractNote || "Billed Monthly"}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-gray-900">{selectedPlan.priceStr}</p>
                                                <p className="text-xs text-gray-500">{selectedPlan.period}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Card Number</label>
                                                <div className="relative">
                                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <input type="text" value={cardNum} onChange={e => setCardNum(e.target.value)} placeholder="0000 0000 0000 0000" className="w-full pl-10 p-3 border border-gray-300 rounded-lg text-gray-900" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Expiry</label>
                                                    <input type="text" value={exp} onChange={e => setExp(e.target.value)} placeholder="MM/YY" className="w-full p-3 border border-gray-300 rounded-lg text-gray-900" />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">CVC</label>
                                                    <input type="text" value={cvc} onChange={e => setCvc(e.target.value)} placeholder="123" className="w-full p-3 border border-gray-300 rounded-lg text-gray-900" />
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => processUpgrade(selectedPlan.id)}
                                            disabled={isProcessing}
                                            className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                        >
                                            {isProcessing ? <Loader2 className="animate-spin" /> : 'Confirm Payment'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PricingModal;
