'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TrainingModule } from '@/lib/training-data';
import { ArrowRight } from 'lucide-react';

interface ModuleCardProps {
  module: TrainingModule;
}

export function ModuleCard({ module }: ModuleCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{module.title}</CardTitle>
          <Badge variant={module.level === 'Beginner' ? 'secondary' : 'default'}>{module.level}</Badge>
        </div>
        <CardDescription>{module.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow"></CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/training/module/${module.id}`}>
            Start Module <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
