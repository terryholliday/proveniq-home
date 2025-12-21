'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { AppView } from '@/lib/types';
import { ProveniqLogo } from './onboarding/ProveniqLogo';
import { Camera, Sparkles, Shield, ArrowRight, ArrowLeft, AlertTriangle, Database, TrendingUp, Building2, X } from 'lucide-react';

interface PitchDeckSlideshowProps {
  onNavigate: (view: AppView) => void;
}

type Slide = {
  id: string;
  layout: 'cover' | 'split' | 'graphic' | 'grid' | 'stats';
  title: string;
  subtitle?: string;
  content?: string;
  color?: string;
  icon?: JSX.Element;
  bullets?: string[];
  Graphic?: React.FC;
  items?: { icon: JSX.Element; title: string; desc: string }[];
  stats?: { label: string; value: string }[];
};

const slides: Slide[] = [
  {
    id: 'cover',
    layout: 'cover',
    title: "PROVENIQ Home",
    subtitle: "The Operating System for Personal Assets",
    content: "Zero-friction inventory, real-time valuation, and automated legacy planning driven by Generative AI.",
    color: "bg-indigo-600"
  },
  {
    id: 'problem',
    layout: 'split',
    icon: <AlertTriangle size={48} className="text-red-500" />,
    title: "The Problem: The Friction Gap",
    bullets: [
      "60% of US homes are underinsured by an average of 20%.",
      "During claims (fire/theft), homeowners leave 30-50% of payout on the table due to lack of proof.",
      "Existing inventory apps fail because manual data entry is tedious and error-prone.",
      "Heirlooms and legacy items are lost to history without digital documentation."
    ]
  },
   {
    id: 'chaos',
    layout: 'graphic',
    title: "Certainty in the Chaos",
    Graphic: () => (
        <div className="relative w-64 h-64">
            {/* Bouncing Cloud with Rain */}
            <div className="absolute top-0 left-10 animate-bounce-slow">
                <div className="w-32 h-16 bg-gray-200 rounded-full"></div>
                <div className="w-24 h-12 bg-gray-300 rounded-full absolute -bottom-4 left-4"></div>
                 {/* Raindrops */}
                <div className="absolute top-12 left-8 w-1 h-4 bg-blue-400 rounded-full animate-fall" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-12 left-12 w-1 h-3 bg-blue-400 rounded-full animate-fall" style={{ animationDelay: '0.3s' }}></div>
                <div className="absolute top-12 left-16 w-1 h-4 bg-blue-400 rounded-full animate-fall" style={{ animationDelay: '0.1s' }}></div>
                 <div className="absolute top-12 left-20 w-1 h-3 bg-blue-400 rounded-full animate-fall" style={{ animationDelay: '0.4s' }}></div>
            </div>

            {/* Bouncing Cloud 2 */}
            <div className="absolute top-10 right-0 animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
                <div className="w-28 h-14 bg-gray-200 rounded-full"></div>
                <div className="w-20 h-10 bg-gray-300 rounded-full absolute -bottom-4 left-4"></div>
                 {/* Raindrops */}
                <div className="absolute top-10 left-8 w-1 h-3 bg-blue-400 rounded-full animate-fall" style={{ animationDelay: '0.6s' }}></div>
                <div className="absolute top-10 left-12 w-1 h-4 bg-blue-400 rounded-full animate-fall" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute top-10 left-16 w-1 h-3 bg-blue-400 rounded-full animate-fall" style={{ animationDelay: '0.7s' }}></div>
            </div>
            
            {/* Shield */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                <Shield size={80} className="text-green-500" strokeWidth={1.5}/>
            </div>
        </div>
    )
  },
  {
    id: 'solution',
    layout: 'split',
    icon: <Sparkles size={48} className="text-indigo-500" />,
    title: "The Solution: Zero-Click Inventory",
    bullets: [
      "Gemini 2.5 AI Vision: Identify make, model, and condition from a single photo.",
      "Real-Time Valuation: Auto-estimation of market value and depreciation.",
      "PROVENIQ ClaimsIQ™: Evidence-grade data structure ready for insurance claims.",
      "We turn a weekend chore into a 10-minute game."
    ]
  },
  {
    id: 'product',
    layout: 'grid',
    title: "Three Pillars of Protection",
    items: [
        { icon: <Camera className="text-indigo-500"/>, title: "Capture", desc: "Instant AI recognition & categorization." },
        { icon: <TrendingUp className="text-green-500"/>, title: "Value", desc: "Real-time market tracking & depreciation." },
        { icon: <Shield className="text-blue-500"/>, title: "Protect", desc: "Warranty alerts & 1-click insurance reports." }
    ]
  },
  {
    id: 'market',
    layout: 'split',
    icon: <Database size={48} className="text-purple-500" />,
    title: "Market Opportunity",
    bullets: [
      "Total Addressable Market (TAM): 140M Housing Units in USA.",
      "Serviceable Available Market (SAM): 85M Homeowners with Insurance.",
      "Target Audience: High-value homeowners, collectors, and estate planners.",
      "Adjacent Markets: SMB Asset Tracking, Moving & Relocation Services."
    ]
  },
  {
    id: 'business',
    layout: 'split',
    icon: <Building2 size={48} className="text-gray-700" />,
    title: "Business Model",
    bullets: [
      "B2C Subscription: Freemium model. Pro tier ($19.99/mo) unlocks AI valuation, legacy videos, and cloud backups.",
      "B2B API (PROVENIQ ClaimsIQ): Licensing data verification tools to Insurance Carriers and Warranty Providers.",
      "Transaction Fees: 15% fee on items sold via 'PROVENIQ Bids' marketplace."
    ]
  },
  {
    id: 'traction',
    layout: 'stats',
    title: "Traction & Roadmap",
    stats: [
        { label: "AI Accuracy", value: "99.2%" },
        { label: "Avg Scan Time", value: "< 2.5s" },
        { label: "Items/User", value: "145" }
    ],
    content: "Web App Live. Next: iOS Native App & Carrier API Pilot."
  },
  {
    id: 'ask',
    layout: 'cover',
    title: "Join Proveniq",
    subtitle: "Secure your peace of mind today.",
    content: "Ready to protect what matters most?",
    color: "bg-gray-900"
  }
];

const PitchDeckSlideshow: React.FC<PitchDeckSlideshowProps> = ({ onNavigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Keyboard navigation
  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => {
      if (prev < slides.length - 1) {
        return prev + 1;
      }
      onNavigate('login');
      return prev;
    });
  }, [onNavigate]);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  const slide = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in relative overflow-hidden">
        
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gray-200">
        <div className="h-full bg-indigo-600 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
      </div>
      
      <button onClick={() => onNavigate('landing')} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 z-10 bg-white/50 rounded-full md:bg-transparent">
          <X size={24} />
      </button>

      {/* Slide Container - Responsive Layout */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden relative flex flex-col md:aspect-[16/9] min-h-[85vh] md:min-h-0">
        
        {/* Render Slide Layouts */}
        {slide.layout === 'cover' && (
             <div className={`w-full h-full flex flex-col items-center justify-center text-center p-6 md:p-12 text-white ${slide.color}`}>
                 <div className="mb-6 md:mb-8 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                    <ProveniqLogo size={64} color="white" className="md:w-20 md:h-20" />
                 </div>
                 <h1 className="text-3xl md:text-7xl font-bold mb-4 tracking-tight">{slide.title}</h1>
                 <h2 className="text-xl md:text-3xl font-light opacity-90 mb-6 md:mb-8">{slide.subtitle}</h2>
                 <p className="max-w-2xl text-base md:text-lg opacity-80">{slide.content}</p>
                 {slide.id === 'ask' && (
                     <button onClick={() => onNavigate('login')} className="mt-8 md:mt-12 px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:scale-105 transition-transform">
                         Launch App
                     </button>
                 )}
             </div>
        )}

        {slide.layout === 'split' && (
            <div className="w-full h-full flex flex-col md:flex-row">
                <div className="w-full md:w-1/3 bg-gray-50 p-6 md:p-12 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-100 shrink-0">
                    <div className="p-4 md:p-6 bg-white rounded-3xl shadow-sm mb-4 md:mb-6">
                        {slide.icon}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{slide.title}</h2>
                </div>
                <div className="w-full md:w-2/3 p-6 md:p-12 flex items-center overflow-y-auto">
                    <ul className="space-y-4 md:space-y-6">
                        {slide.bullets?.map((bullet, i) => (
                            <li key={i} className="flex items-start gap-4 text-base md:text-xl text-gray-700">
                                <span className="mt-1 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold shrink-0">{i+1}</span>
                                <span>{bullet}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )}
        
        {slide.layout === 'graphic' && (
            <div className="w-full h-full p-6 md:p-12 flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-8">{slide.title}</h2>
                {slide.Graphic && <slide.Graphic />}
            </div>
        )}

        {slide.layout === 'grid' && (
            <div className="w-full h-full p-6 md:p-12 flex flex-col justify-center overflow-y-auto">
                <h2 className="text-2xl md:text-4xl font-bold text-gray-900 text-center mb-8 md:mb-16 shrink-0">{slide.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                    {slide.items?.map((item, i) => (
                        <div key={i} className="p-6 md:p-8 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 md:mb-6">
                                {React.cloneElement(item.icon, { size: 32 })}
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-sm md:text-base text-gray-600">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {slide.layout === 'stats' && (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 md:p-12 bg-indigo-900 text-white">
                 <h2 className="text-2xl md:text-4xl font-bold mb-8 md:mb-16 text-center">{slide.title}</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-16 w-full max-w-4xl">
                    {slide.stats?.map((stat, i) => (
                        <div key={i} className="text-center bg-indigo-800/50 p-4 rounded-xl md:bg-transparent md:p-0">
                            <p className="text-4xl md:text-6xl font-black mb-2 text-indigo-300">{stat.value}</p>
                            <p className="text-sm md:text-xl uppercase tracking-widest opacity-70">{stat.label}</p>
                        </div>
                    ))}
                </div>
                <p className="text-base md:text-lg opacity-80">{slide.content}</p>
            </div>
        )}

        {/* Navigation */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
          <button onClick={handlePrev} disabled={currentSlide === 0} className="p-3 bg-white/50 rounded-full hover:bg-white disabled:opacity-50 transition-all backdrop-blur-sm shadow-md">
            <ArrowLeft size={24} />
          </button>
          <button onClick={handleNext} className="p-3 bg-white/50 rounded-full hover:bg-white transition-all backdrop-blur-sm shadow-md">
            <ArrowRight size={24} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default PitchDeckSlideshow;
