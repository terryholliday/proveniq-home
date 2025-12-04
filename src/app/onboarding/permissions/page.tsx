
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { useUserProfile } from '@/hooks/use-user-profile';
import { ArrowRight, Camera, Check, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PermissionsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { updateUserProfile } = useUserProfile(user);
  const { toast } = useToast();

  const handleAllowAccess = async () => {
    if (!updateUserProfile) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      await updateUserProfile({
        'permissions.camera': 'granted',
        'permissions.microphone': 'granted',
      } as any);

      // Stop the tracks immediately to turn off camera/mic light
      stream.getTracks().forEach((track) => track.stop());

      toast({
        title: 'Permissions Granted',
        description: 'You can now use all of MyARK\'s smart features.',
      });
    } catch {
      await updateUserProfile({
        'permissions.camera': 'denied',
        'permissions.microphone': 'denied',
      } as any);
      toast({
        variant: 'destructive',
        title: 'Permissions Denied',
        description:
          'Camera or microphone access was denied. Some features may not work.',
      });
    } finally {
      router.push('/dashboard');
    }
  };

  const handleMaybeLater = () => {
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="mb-6 rounded-full bg-primary/10 p-4">
            <Camera className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-2xl font-bold">Enable Smart Features</h1>
          <p className="mt-2 text-muted-foreground">
            MyARK uses your camera and microphone to power its AI scanner, room
            audits, and legacy story recording.
          </p>

          <ul className="mt-6 space-y-3 text-left">
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-muted-foreground">
                Instantly identify items with our AI scanner.
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-muted-foreground">
                Record audio & video stories for heirlooms.
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-muted-foreground">
                Use Room Audit to find misplaced items.
              </span>
            </li>
          </ul>

          <Button onClick={handleAllowAccess} size="lg" className="mt-8 w-full">
            Allow Access
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <Button
            onClick={handleMaybeLater}
            variant="ghost"
            className="mt-2 w-full"
          >
            Maybe Later
          </Button>

          <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="h-3 w-3 flex-shrink-0 mt-0.5" />
            <p className="text-left">
              Your privacy is important. We only use these features when you
              activate them.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
