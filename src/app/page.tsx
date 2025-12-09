'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import PublicLayout from '@/components/layouts/public-layout';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import './landing-page.css';
import dynamic from 'next/dynamic';

// Dynamic imports for illustrations
const CommandCenterIllustration = dynamic(() => import('@/components/landing/illustrations/CommandCenterIllustration').then(mod => mod.CommandCenterIllustration), {
  loading: () => <div className="w-80 h-80 bg-gray-50 rounded-full animate-pulse mx-auto" />,
  ssr: true // Prioritize this one for LCP
});

const SearchEngineIllustration = dynamic(() => import('@/components/landing/illustrations/SearchEngineIllustration').then(mod => mod.SearchEngineIllustration), {
  loading: () => <div className="w-full max-w-sm h-48 bg-gray-50 rounded-2xl animate-pulse mx-auto" />
});

const AskYourArkIllustration = dynamic(() => import('@/components/landing/illustrations/AskYourArkIllustration').then(mod => mod.AskYourArkIllustration), {
  loading: () => <div className="w-full max-w-sm h-64 bg-gray-50 rounded-2xl animate-pulse mx-auto" />
});

const StoryIllustration = dynamic(() => import('@/components/landing/illustrations/StoryIllustration').then(mod => mod.StoryIllustration), {
  loading: () => <div className="w-full max-w-xs h-80 bg-gray-50 rounded-2xl animate-pulse mx-auto" />
});

const CertaintyIllustration = dynamic(() => import('@/components/landing/illustrations/CertaintyIllustration').then(mod => mod.CertaintyIllustration), {
  loading: () => <div className="w-full max-w-sm h-80 bg-gray-50 rounded-2xl animate-pulse mx-auto" />
});

const ValueIllustration = dynamic(() => import('@/components/landing/illustrations/ValueIllustration').then(mod => mod.ValueIllustration), {
  loading: () => <div className="w-full h-40 bg-gray-50 rounded-2xl animate-pulse mx-auto" />
});

const ClaimsIllustration = dynamic(() => import('@/components/landing/illustrations/ClaimsIllustration').then(mod => mod.ClaimsIllustration), {
  loading: () => <div className="w-full h-40 bg-gray-50 rounded-2xl animate-pulse mx-auto" />
});

const AutopilotIllustration = dynamic(() => import('@/components/landing/illustrations/AutopilotIllustration').then(mod => mod.AutopilotIllustration), {
  loading: () => <div className="w-80 h-80 bg-gray-50 rounded-full animate-pulse mx-auto" />
});

const MoveIllustration = dynamic(() => import('@/components/landing/illustrations/MoveIllustration').then(mod => mod.MoveIllustration), {
  loading: () => <div className="w-80 h-64 bg-gray-50 rounded-2xl animate-pulse mx-auto" />
});

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


export default function LandingPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('slide-in');
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const transitionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTransitionTimeout = useCallback(() => {
    if (transitionTimeout.current) {
      clearTimeout(transitionTimeout.current);
      transitionTimeout.current = null;
    }
  }, []);

  const queueSlideChange = useCallback((delta: number) => {
    setSlideDirection('slide-out');
    clearTransitionTimeout();

    transitionTimeout.current = setTimeout(() => {
      setActiveIndex((prevIndex) => (prevIndex + delta + features.length) % features.length);
      setSlideDirection('slide-in');
      transitionTimeout.current = null;
    }, 500);
  }, [clearTransitionTimeout]);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleNext = useCallback(() => queueSlideChange(1), [queueSlideChange]);

  const handlePrev = useCallback(() => queueSlideChange(-1), [queueSlideChange]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => {
      clearInterval(interval);
      clearTransitionTimeout();
    };
  }, [handleNext, clearTransitionTimeout]);

  const userAvatars = PlaceHolderImages.filter(img => ['user-avatar-1', 'user-avatar-2', 'user-avatar-3'].includes(img.id));

  if (isUserLoading || user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  const activeFeature = features[activeIndex];

  if (!activeFeature) {
    return <div className="flex h-screen items-center justify-center">Feature not found.</div>;
  }

  return (
    <PublicLayout>
      <div className="flex flex-col items-center justify-center text-center py-20 px-4 overflow-hidden">
        <div className="relative w-full max-w-sm mx-auto mb-16 h-96 flex items-center justify-center">
          <div className={`${slideDirection} w-full flex items-center justify-center`}>
            {activeFeature.illustration}
          </div>
        </div>

        <div className="max-w-2xl relative">
          <Button onClick={handlePrev} variant="ghost" className="absolute -left-20 top-1/2 -translate-y-1/2"><ChevronLeft /></Button>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 h-24 flex items-center justify-center">
            {activeFeature.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-8 h-20">
            {activeFeature.description}
          </p>
          <Button onClick={handleNext} variant="ghost" className="absolute -right-20 top-1/2 -translate-y-1/2"><ChevronRight /></Button>

          <div className="flex justify-center gap-2 mb-8">
            {features.map((feature, index) => (
              <button
                key={feature.id}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${activeIndex === index ? 'bg-primary' : 'bg-gray-300'
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
                  className="rounded-full border-2 border-background object-cover aspect-square"
                  style={{ width: 32, height: 32 }}
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
