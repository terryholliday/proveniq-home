'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { evaluateSalesResponse, type EvaluateSalesResponseOutput } from '@/ai/flows/evaluate-sales-response';
import { Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface RoleplayProps {
  scenario: string;
}

export function Roleplay({ scenario }: RoleplayProps) {
  const [response, setResponse] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluateSalesResponseOutput | null>(null);
  const [isEvaluating, startEvaluating] = useTransition();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!response.trim()) {
      toast({
        variant: 'destructive',
        title: 'Empty Response',
        description: 'Please enter your response to the scenario.',
      });
      return;
    }
    setEvaluation(null);
    startEvaluating(async () => {
      try {
        const result = await evaluateSalesResponse({ scenario, response });
        setEvaluation(result);
      } catch (error) {
        console.error('Failed to evaluate response:', error);
        toast({
          variant: 'destructive',
          title: 'Evaluation Failed',
          description: 'There was an error evaluating your response. Please try again.',
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-muted-foreground">{scenario}</p>
      <Textarea
        placeholder="Type your response here..."
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        rows={5}
        disabled={isEvaluating}
      />
      <Button onClick={handleSubmit} disabled={isEvaluating} className="w-full">
        {isEvaluating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Evaluating...
          </>
        ) : (
          'Evaluate Response'
        )}
      </Button>

      {evaluation && (
        <Card className="mt-4 bg-secondary/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold flex items-center">
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                AI Feedback
              </h4>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-2xl font-bold text-primary">{evaluation.score}/10</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{evaluation.feedback}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
