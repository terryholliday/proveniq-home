'use client';

import { useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BrainCircuit, MessageSquare, Target } from 'lucide-react';
import Link from 'next/link';
import { trainingModules, TrainingModule } from '@/lib/training-data';
import { Quiz } from '@/components/training/Quiz';
import { Roleplay } from '@/components/training/Roleplay';

export default function ModulePage() {
  const params = useParams();
  const { id } = params;
  const module = trainingModules.find((m) => m.id === id);

  if (!module) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/training">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Modules
          </Link>
        </Button>
      </div>

      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">{module.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{module.description}</p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {module.content.map((section, index) => (
            <div key={index}>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">{section.heading}</h2>
              <div className="mt-2 text-muted-foreground prose prose-sm max-w-none">
                {section.body}
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-8 lg:col-span-1">
          {module.quiz && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit />
                  Knowledge Check
                </CardTitle>
                <CardDescription>Test your understanding of the key concepts.</CardDescription>
              </CardHeader>
              <CardContent>
                <Quiz questions={module.quiz.questions} moduleId={module.id} />
              </CardContent>
            </Card>
          )}

          {module.roleplay && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target />
                  Roleplay Scenario
                </CardTitle>
                <CardDescription>Practice what you've learned.</CardDescription>
              </CardHeader>
              <CardContent>
                <Roleplay scenario={module.roleplay.scenario} />
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
