'use client';
import { PageHeader } from '@/components/page-header';
import { ModuleCard } from '@/components/training/ModuleCard';
import { trainingModules } from '@/lib/training-data';
import { useTrainingAccess } from '@/hooks/use-training-access';
import { RestrictedAccess } from '@/components/training/RestrictedAccess';

export default function TrainingPage() {
  const { hasAccess, isLoading } = useTrainingAccess();

  if (isLoading) {
    return <div className="flex h-full items-center justify-center">Loading Access...</div>;
  }

  if (!hasAccess) {
    return <RestrictedAccess />;
  }

  return (
    <>
      <PageHeader
        title="Platform Training"
        description="Internal resources for the PROVENIQ Home sales and support teams."
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {trainingModules.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>
    </>
  );
}
