
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { mockInventory } from '@/lib/data';
import {
  Camera,
  Folder,
  Gift,
  Info,
  Plus,
  Shield,
  Truck,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { StatCard } from '@/components/dashboard/stat-card';
import { ItemCard } from '@/components/inventory/item-card';
import OnboardingTour from '@/components/onboarding/OnboardingTour';
import { useUser } from '@/firebase';

const DashboardActionCard = ({
  icon,
  title,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
}) => (
  <Link href={href}>
    <Card
      className="group flex h-full flex-col items-center justify-center p-6 text-center transition-all hover:bg-muted hover:shadow-md"
    >
      <div
        className="mb-3 rounded-full bg-secondary p-3"
      >
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
    </Card>
  </Link>
);

export default function DashboardPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [showTour, setShowTour] = useState(false);

  // Auth guard: Redirect unauthenticated users to login
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    // Only check tour completion after auth is confirmed
    if (user) {
      const tourCompleted = localStorage.getItem('myark_onboarding_tour_completed');
      if (tourCompleted !== 'true') {
        setShowTour(true);
      }
    }
  }, [user]);

  const handleTourComplete = () => {
    localStorage.setItem('myark_onboarding_tour_completed', 'true');
    setShowTour(false);
  };

  // Show loading state during auth check
  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render dashboard content if not authenticated (redirect in progress)
  if (!user) {
    return null;
  }

  const totalValue = mockInventory.reduce(
    (sum, item) => sum + (item.marketValue || 0) * item.quantity,
    0
  );
  const totalItems = mockInventory.reduce((sum, item) => sum + item.quantity, 0);
  const itemsOnLoan = mockInventory.filter((item) => !!item.lent).length;
  const totalLocations = new Set(mockInventory.map(item => item.location)).size;
  const recentlyAdded = [...mockInventory].sort((a, b) => new Date(b.addedDate || Date.now()).getTime() - new Date(a.addedDate || Date.now()).getTime()).slice(0, 3);


  const actions = [
    {
      icon: <Folder className="h-6 w-6 text-primary" />,
      title: 'Categories',
      href: '#',
    },
    {
      icon: <Truck className="h-6 w-6 text-primary" />,
      title: 'Move Planner',
      href: '/move-planner',
    },
    {
      icon: <Camera className="h-6 w-6 text-primary" />,
      title: 'Audit Room',
      href: '#',
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: 'Risk Sim',
      href: '#',
    },
    {
      icon: <Gift className="h-6 w-6 text-primary" />,
      title: 'Manage Legacy',
      href: '/legacy-planner',
    },
  ];

  return (
    <>
      <OnboardingTour show={showTour} onComplete={handleTourComplete} />
      <div className="mx-auto max-w-4xl">
        <Alert className="mb-8 border-primary bg-primary/10">
          <Info className="h-4 w-4" />
          <AlertTitle>Early Access Mode</AlertTitle>
          <AlertDescription>
            You have full access to all Proveniq Home Pro features until we officially go
            live. Enjoy!
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div id="dashboard-value" className="contents">
            <StatCard title="Total Value" value={`$${totalValue.toLocaleString()}`} icon="dollar-sign" />
          </div>
          <StatCard title="Total Items" value={totalItems} icon="archive" />
          <StatCard title="Items on Loan" value={itemsOnLoan} icon="heart-handshake" />
          <StatCard title="Locations" value={totalLocations} icon="map-pin" />
        </div>

        <div className="mb-8">
          <Link href="/inventory/add" passHref>
            <Card id="dashboard-add" className="group flex h-full flex-col items-center justify-center p-6 text-center transition-all hover:shadow-md bg-primary text-primary-foreground hover:bg-primary/90">
              <div className="mb-3 rounded-full bg-primary-foreground/20 p-3">
                <Plus className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold">Add Item</h3>
            </Card>
          </Link>
        </div>


        <div id="dashboard-quick-actions" className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {actions.map((action) => (
            <DashboardActionCard key={action.title} {...action} />
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Recently Added</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentlyAdded.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
