
'use client';

import React, { useState } from 'react';
import { ArrowRight, Check, Truck, Zap, ShieldCheck, Gavel } from 'lucide-react';
import { MyArkLogo } from './MyArkLogo';

interface OnboardingTourProps {
  show: boolean;
  onComplete: () => void;
}

const steps = [
    {
      icon: <MyArkLogo size={48} className="text-primary" />,
      title: "Welcome to MyARK",
      content: "Your intelligent, AI-powered home inventory solution. Let's get you set up in seconds."
    },
    {
      icon: <Zap size={48} className="text-primary" />,
      title: "Frictionless Capture",
      content: "Scan items with your camera, or let MyARK do it for you. It finds purchases in your email and reminds you to scan after shopping trips."
    },
    {
      icon: <Truck size={48} className="text-orange-500" />,
      title: "Organize & Move",
      content: "Planning a move or decluttering? Use our AI Move Planner to pack efficiently and print QR labels for your boxes."
    },
    {
      icon: <Gavel size={48} className="text-purple-500" />,
      title: "Monetize & Declutter",
      content: "Turn unused items into cash. Let AI write your sales ads or host a private 'ArKive Auction' with minimum bids to get the best price."
    },
    {
      icon: <ShieldCheck size={48} className="text-green-500" />,
      title: "Protect & Claim",
      content: "When things go wrong, MyARK is your first responder. Instantly generate submission-ready warranty, P&C, and HO3 claims with one tap."
    }
  ];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ show, onComplete }) => {
  const [step, setStep] = useState(0);

  if (!show) return null;

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col text-center">
        <div className="p-8 pb-0 pt-10">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                {currentStep.icon}
            </div>
        </div>
        <div className="p-8 pt-6 flex-1 flex flex-col">
           <h2 className="text-2xl font-bold text-foreground">{currentStep.title}</h2>
           <p className="text-muted-foreground my-4 leading-relaxed flex-1">{currentStep.content}</p>
           
           <div className="mt-auto flex items-center justify-between">
              <div className="flex gap-2">
                 {steps.map((_, i) => (
                    <div key={i} className={`h-2 rounded-full transition-all ${step === i ? 'w-4 bg-primary' : 'w-2 bg-muted'}`} />
                 ))}
              </div>
              
              <button 
                onClick={handleNext}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
              >
                {step === steps.length - 1 ? "Get Started" : "Next"}
                {step === steps.length - 1 ? <Check size={18}/> : <ArrowRight size={18}/>}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
