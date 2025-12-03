'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Gift, Gavel, Wrench, ShieldCheck, Truck, TrendingUp, Shield, Heart, PlayCircle, ChevronLeft, ChevronRight, Camera, Facebook, Check, GanttChartSquare, Sparkles, AlertTriangle, FileText, Tv2, Home, Cloud, ArrowDown, CloudRain, Search, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import PublicLayout from '@/components/layouts/public-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import './landing-page.css';
import { MyArkLogo } from '@/components/onboarding/MyArkLogo';

const features = [
  {
    id: 'command-center',
    title: 'Your Asset Command Center.',
    description: 'MyARK is more than an inventory list. It\'s the operating system for everything you own, turning static possessions into dynamic, protected assets.',
    illustration: <CommandCenterIllustration />
  },
  {
    id: 'search-engine',
    title: 'A Search Engine For Your Home.',
    description: 'Stop searching, start finding. Instantly locate any item, from the remote control to your birth certificate, with a simple search.',
    illustration: <SearchEngineIllustration />
  },
  {
    id: 'ask-your-ark',
    title: 'Ask Your Ark. Anytime.',
    description: 'Integrate with Alexa and Google Home to find items, get reminders, or recall family stories with a simple voice command.',
    illustration: <AskYourArkIllustration />
  },
  {
    id: 'story',
    title: "More Than Stuff. It's Your Story.",
    description: "Don't let history be lost. Record video stories for your heirlooms and assign beneficiaries instantly. Ensure your legacy is preserved, not just your assets.",
    illustration: <StoryIllustration />
  },
   {
    id: 'certainty',
    title: "Certainty in the Chaos.",
    description: "Simulate floods, fires, or theft to see your financial risk in real-time. Ensure your insurance coverage is airtight before you need it.",
    illustration: <CertaintyIllustration />
  },
  {
    id: 'unlock-value',
    title: 'Unlock Hidden Value.',
    description: 'Turn clutter into cash. Let our AI write your sales ads for Facebook Marketplace, or host a private \'ARKive Auction\' to get the best price for your items.',
    illustration: <ValueIllustration />
  },
  {
    id: 'one-tap-claims',
    title: 'One-Tap Claims.',
    description: 'When disaster strikes, MyARK generates submission-ready warranty and insurance claim documents instantly. Get your payout faster, with zero stress.',
    illustration: <ClaimsIllustration />
  },
  {
    id: 'autopilot',
    title: 'Inventory on Autopilot.',
    description: 'MyARK automatically detects new purchases from your email and reminds you to scan items after shopping trips. Zero manual entry required.',
    illustration: <AutopilotIllustration />
  },
  {
    id: 'move-smarter',
    title: 'Move Smarter, Not Harder.',
    description: 'Planning a move or just spring cleaning? MyARK\'s AI suggests how to pack, what to declutter, and prints scannable QR labels for every box so you know what\'s where.',
    illustration: <MoveIllustration />
  },
];

function CommandCenterIllustration() {
    const icons = [
        { icon: <Gift className="h-8 w-8 text-pink-500" />, name: 'Legacy' },
        { icon: <Gavel className="h-8 w-8 text-purple-500" />, name: 'Auctions' },
        { icon: <ShieldCheck className="h-8 w-8 text-green-500" />, name: 'Insure' },
        { icon: <TrendingUp className="h-8 w-8 text-blue-500" />, name: 'Value' },
        { icon: <Truck className="h-8 w-8 text-orange-500" />, name: 'Logistics' },
        { icon: <Wrench className="h-8 w-8 text-gray-700" />, name: 'Repair' },
    ];

    return (
        <div className="relative w-80 h-80 flex items-center justify-center">
            <div className="absolute w-full h-full animate-rotate">
                {icons.map((item, index) => {
                    const angle = (index / icons.length) * 360;
                    const x = 50 + 40 * Math.cos((angle - 90) * (Math.PI / 180));
                    const y = 50 + 40 * Math.sin((angle - 90) * (Math.PI / 180));
                    return (
                        <div key={item.name} className="absolute flex flex-col items-center" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
                            <div className="bg-white rounded-lg shadow-md p-3 flex flex-col items-center animate-rotate-reverse">
                                {item.icon}
                                <span className="text-xs mt-1">{item.name}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="bg-white rounded-full shadow-2xl p-4 pulse-grow">
                <MyArkLogo size={64} />
            </div>
        </div>
    );
}

function SearchEngineIllustration() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
      <div className="flex items-center border border-gray-200 rounded-lg p-3 mb-4">
        <Search className="h-5 w-5 text-gray-400 mr-3" />
        <p className="text-gray-800">Passport</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {['Living', 'Kitchen', 'Bedroom', 'Office'].map(tag => (
          <div key={tag} className="bg-primary/5 text-primary/80 rounded-md p-3 text-center text-sm font-medium">
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
}

function AskYourArkIllustration() {
  return (
    <div className="relative w-full max-w-sm h-64 flex items-center justify-center p-4">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Left Device */}
        <div className="z-10 absolute left-4 w-40 h-56 bg-gray-800 rounded-2xl flex flex-col items-center justify-center p-4 shadow-2xl transform -rotate-6">
          <div className="w-5 h-5 bg-blue-400 rounded-full mb-3 animate-pulse" />
          <p className="text-white text-sm text-center font-medium">"Alexa, ask MyARK where Grandma's bracelet is."</p>
        </div>

        {/* Right Device */}
        <div className="z-10 absolute right-4 w-40 h-56 bg-white rounded-2xl flex flex-col items-center justify-center p-4 shadow-2xl transform rotate-6">
          <div className="flex space-x-1.5 mb-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <div className="w-3 h-3 bg-yellow-400 rounded-full" />
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </div>
          <p className="text-gray-800 text-sm text-center font-medium">"Hey Google, what's my passport's current value?"</p>
        </div>
      </div>
    </div>
  );
}

function StoryIllustration() {
    const beneficiaryAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar-1');
    return (
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs">
            <div className="flex flex-col items-center">
                <div className="bg-pink-100 rounded-full p-4 mb-4">
                    <Heart className="h-8 w-8 text-pink-500" />
                </div>
                <h2 className="font-bold text-lg">Grandma's Bracelet</h2>
                <p className="text-sm text-muted-foreground mb-4">Acquired: 1978</p>
                <div className="bg-gray-50 rounded-lg p-3 w-full flex items-center gap-3 mb-3 border">
                    {beneficiaryAvatar && (
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={beneficiaryAvatar.imageUrl} alt="Sarah" />
                            <AvatarFallback>S</AvatarFallback>
                        </Avatar>
                    )}
                    <div>
                        <p className="text-xs text-muted-foreground text-left">BENEFICIARY</p>
                        <p className="font-semibold text-sm text-left">Sarah (Granddaughter)</p>
                    </div>
                </div>
                <Button variant="secondary" className="w-full bg-blue-50 hover:bg-blue-100 text-primary">
                    <PlayCircle className="mr-2 text-blue-500" /> LEGACY STORY
                </Button>
            </div>
        </div>
    );
}

function CertaintyIllustration() {
  return (
    <div className="relative w-full max-w-sm h-80 flex items-center justify-center">
      <div className="absolute -left-8 top-10 animate-bounce-slow">
        <CloudRain className="h-24 w-24 text-gray-300" />
      </div>
      <div className="relative flex items-center justify-center">
        <Shield className="h-48 w-48 text-gray-100" fill="currentColor" />
        <div className="absolute flex flex-col items-center justify-center">
          <Home className="h-20 w-20 text-primary" />
          <div className="absolute -right-3 -bottom-3 bg-green-500 rounded-full p-1 border-4 border-white">
            <Check className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
      <div className="absolute -right-8 top-10 animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
        <CloudRain className="h-24 w-24 text-gray-300" />
      </div>
    </div>
  );
}

function ValueIllustration() {
    return (
        <div className="flex items-center justify-center gap-4 md:gap-8 p-4">
            {/* Item Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 w-40 text-center">
                <div className="bg-gray-100 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Camera className="h-8 w-8 text-gray-400" />
                </div>
                <p className="font-bold text-sm">Vintage Camera</p>
                <p className="text-xs text-gray-500 mt-1">$150 Value</p>
            </div>

            <ArrowRight className="text-gray-300 h-6 w-6 shrink-0" />

            {/* Marketplace Card */}
            <div className="relative bg-white rounded-2xl shadow-lg p-4 w-64">
                <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md transform rotate-12">
                    SOLD!
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center">
                       <Facebook className="h-4 w-4 text-white" fill="white"/>
                    </div>
                    <p className="font-bold text-sm">Marketplace</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-2 text-xs text-gray-600 mb-3">
                    "Selling my classic film camera. Great condition, works perfectly..."
                </div>
                <div className="flex justify-between items-center">
                    <p className="font-bold text-blue-600 text-sm">$175 OBO</p>
                    <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                        <GanttChartSquare className="h-3 w-3" />
                        <span>Bids Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}


function ClaimsIllustration() {
    return (
        <div className="flex items-center justify-center gap-4 md:gap-8 p-4">
            {/* Damaged Item Card */}
            <div className="relative bg-white rounded-2xl shadow-lg p-6 w-40 text-center border-2 border-red-200">
                <div className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                    <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="bg-gray-100 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Tv2 className="h-8 w-8 text-gray-400" />
                </div>
                <p className="font-bold text-sm">Smart TV</p>
                <p className="text-xs text-red-600 mt-1">Screen Cracked</p>
            </div>

            <ArrowRight className="text-gray-300 h-6 w-6 shrink-0" />

            {/* Claim Filed Card */}
            <div className="relative bg-white rounded-2xl shadow-lg p-6 w-48 text-center border-2 border-green-200">
                <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                    <Check className="h-4 w-4" />
                </div>
                <div className="bg-gray-100 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <p className="font-bold text-sm">Claim Filed</p>
                <p className="text-xs text-gray-500 mt-1">Ref: W-1A2B3C</p>
            </div>
        </div>
    );
}

function AutopilotIllustration() {
    return (
        <div className="relative h-80 w-80 flex flex-col items-center justify-center gap-8">
            <svg width="120" height="180" viewBox="0 0 120 180" className="absolute" style={{top: "50%", left: "50%", transform: "translate(-50%, -50%)"}}>
                <path d="M60 40 v-20" stroke="#d1d5db" strokeWidth="2" strokeDasharray="4 4" className="animate-dash-in" />
                <path d="M60 140 v20" stroke="#d1d5db" strokeWidth="2" strokeDasharray="4 4" className="animate-dash-out" />
            </svg>
            <div className="z-10 flex items-center gap-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100 w-64">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                    <p className="font-bold">Purchase Found!</p>
                    <p className="text-sm text-gray-500">Sony Headphones - $349.99</p>
                </div>
            </div>
            <div className="z-10 bg-white rounded-full shadow-2xl p-4 pulse-grow">
                <MyArkLogo size={48} />
            </div>
            <div className="z-10 flex items-center gap-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100 w-64">
                <div className="p-2 bg-orange-100 rounded-lg">
                    <MapPin className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                    <p className="font-bold">Near Home Depot?</p>
                    <p className="text-sm text-gray-500">Don't forget to scan new items.</p>
                </div>
            </div>
        </div>
    );
}


function MoveIllustration() {
    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
            <h3 className="font-bold text-lg mb-3">Kitchen Box #3</h3>
            <div className="space-y-2">
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <span className="text-sm">Le Creuset Dutch Oven</span>
                    <span className="text-xs font-mono text-gray-400">...a4b1</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <span className="text-sm">Vitamix Blender</span>
                    <span className="text-xs font-mono text-gray-400">...c8d2</span>
                </div>
                 <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <span className="text-sm">Dinner Plate Set</span>
                    <span className="text-xs font-mono text-gray-400">...e3f4</span>
                </div>
            </div>
             <div className="mt-4 pt-4 border-t border-dashed flex items-center justify-center">
                <p className="text-sm text-gray-500">Scan QR to see all 24 items</p>
             </div>
        </div>
    );
}


export default function LandingPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('slide-in');
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);
  
  useEffect(() => {
    const interval = setInterval(() => {
        handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIndex]);

  const handleNext = () => {
    setSlideDirection('slide-out');
    setTimeout(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % features.length);
        setSlideDirection('slide-in');
    }, 500); 
  };

  const handlePrev = () => {
    setSlideDirection('slide-out');
    setTimeout(() => {
        setActiveIndex((prevIndex) => (prevIndex - 1 + features.length) % features.length);
        setSlideDirection('slide-in');
    }, 500);
  };

  const userAvatars = PlaceHolderImages.filter(img => ['user-avatar-1', 'user-avatar-2', 'user-avatar-3'].includes(img.id));
  
  if (isUserLoading || user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  const activeFeature = features[activeIndex] ?? features[0];

  return (
    <PublicLayout>
      <div className="flex flex-col items-center justify-center text-center py-20 px-4 overflow-hidden">
        <div className="relative w-full max-w-sm mx-auto mb-16 h-96 flex items-center justify-center">
          <div className={`${slideDirection} w-full flex items-center justify-center`}>
              {activeFeature.illustration}
          </div>
        </div>

        <div className="max-w-2xl relative">
          <Button onClick={handlePrev} variant="ghost" className="absolute -left-20 top-1/2 -translate-y-1/2"><ChevronLeft/></Button>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 h-24 flex items-center justify-center">
            {activeFeature.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-8 h-20">
            {activeFeature.description}
          </p>
          <Button onClick={handleNext} variant="ghost" className="absolute -right-20 top-1/2 -translate-y-1/2"><ChevronRight/></Button>

          <div className="flex justify-center gap-2 mb-8">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  activeIndex === index ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Link href="/signup" passHref>
            <Button size="lg" className="w-full sm:w-auto">
              Build Your Ark <ArrowRight className="ml-2" />
            </Button>
          </Link>

          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex -space-x-2">
              {userAvatars.map(avatar => (
                <Image
                  key={avatar.id}
                  src={avatar.imageUrl}
                  alt="Happy user"
                  width={32}
                  height={32}
                  className="rounded-full border-2 border-background"
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              Join 10,000+ happy users
            </span>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
