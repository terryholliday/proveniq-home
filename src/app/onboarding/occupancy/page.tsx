'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { useUserProfile } from '@/hooks/use-user-profile';
import { ArrowRight, Home, Building2, Check, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OccupancyMode } from '@/lib/types';

export default function OccupancyModePage() {
  const router = useRouter();
  const { user } = useUser();
  const { updateUserProfile } = useUserProfile(user);
  const { toast } = useToast();
  const [selected, setSelected] = useState<OccupancyMode | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected || !updateUserProfile) return;
    
    setIsLoading(true);
    try {
      await updateUserProfile({ occupancyMode: selected });
      toast({
        title: 'Preference Saved',
        description: selected === 'owner' 
          ? 'Your inventory is set up for homeowners.'
          : 'Your inventory is set up for renters with landlord fixture tracking.',
      });
      router.push('/onboarding/permissions');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save preference. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <h1 className="text-2xl font-bold">Do you own or rent your home?</h1>
          <p className="mt-2 text-muted-foreground">
            This helps us customize your experience and track items correctly.
          </p>

          <div className="mt-8 grid w-full gap-4">
            {/* Owner Option */}
            <button
              onClick={() => setSelected('owner')}
              className={`relative flex items-start gap-4 rounded-lg border-2 p-4 text-left transition-all ${
                selected === 'owner'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className={`rounded-full p-2 ${selected === 'owner' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <Home className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">I Own My Home</h3>
                  {selected === 'owner' && <Check className="h-5 w-5 text-primary" />}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Everything in your home belongs to you. All items are tracked as personal property.
                </p>
              </div>
            </button>

            {/* Renter Option */}
            <button
              onClick={() => setSelected('renter')}
              className={`relative flex items-start gap-4 rounded-lg border-2 p-4 text-left transition-all ${
                selected === 'renter'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className={`rounded-full p-2 ${selected === 'renter' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <Building2 className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">I Rent My Home</h3>
                  {selected === 'renter' && <Check className="h-5 w-5 text-primary" />}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Distinguish between your belongings and landlord-provided fixtures like appliances.
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-500" />
                    Track move-in/move-out condition
                  </li>
                  <li className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-500" />
                    Report maintenance issues
                  </li>
                  <li className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-500" />
                    Connect with your landlord (optional)
                  </li>
                </ul>
              </div>
            </button>
          </div>

          <Button 
            onClick={handleContinue} 
            size="lg" 
            className="mt-8 w-full"
            disabled={!selected || isLoading}
          >
            {isLoading ? 'Saving...' : 'Continue'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="h-3 w-3 flex-shrink-0 mt-0.5" />
            <p className="text-left">
              You can change this anytime in Settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
