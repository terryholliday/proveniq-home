'use client';
import { useTrainingAccess } from '@/hooks/use-training-access';
import { RestrictedAccess } from './RestrictedAccess';
import { Button } from '../ui/button';
import { Bell } from 'lucide-react';
import { UserNav } from '../user-nav';
import { PageHeader } from '../page-header';
import { MyArkLogo } from '../onboarding/MyArkLogo';

export default function TrainingLayout({ children }: { children: React.ReactNode }) {
  const { hasAccess, isLoading } = useTrainingAccess();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
          <div className="flex items-center gap-2">
            <MyArkLogo size={32} />
            <span className="text-lg font-semibold text-primary">MyARK Training</span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <RestrictedAccess />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-2">
          <MyArkLogo size={32} />
          <span className="text-lg font-semibold text-primary">MyARK Training</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
          <UserNav />
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
