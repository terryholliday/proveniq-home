'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface QuizProps {
  questions: QuizQuestion[];
  moduleId: string;
}

export function Quiz({ questions, moduleId }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const savedScore = localStorage.getItem(`trainingScores:${moduleId}`);
    if (savedScore) {
      setScore(parseInt(savedScore, 10));
    }
  }, [moduleId]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    if (selectedOption === currentQuestion.correctIndex) {
      const newScore = score + 1;
      setScore(newScore);
      localStorage.setItem(`trainingScores:${moduleId}`, newScore.toString());
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
    localStorage.removeItem(`trainingScores:${moduleId}`);
  };

  if (isFinished) {
    return (
      <div className="text-center">
        <h3 className="font-semibold">Quiz Completed!</h3>
        <p className="text-muted-foreground mt-2">
          You answered {score} out of {questions.length} questions correctly.
        </p>
        <Button onClick={handleRestart} className="mt-4">
          Retake Quiz
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">
        Question {currentQuestionIndex + 1} of {questions.length}
      </p>
      <p className="font-semibold">{currentQuestion.question}</p>

      <RadioGroup
        value={selectedOption?.toString()}
        onValueChange={(value) => setSelectedOption(parseInt(value, 10))}
        disabled={isAnswered}
        className="space-y-2"
      >
        {currentQuestion.options.map((option, index) => {
          const isCorrect = index === currentQuestion.correctIndex;
          const isSelected = index === selectedOption;
          const feedbackClass =
            isAnswered && isSelected
              ? isCorrect
                ? 'border-green-500 bg-green-500/10'
                : 'border-red-500 bg-red-500/10'
              : '';
          const indicator =
            isAnswered && isSelected ? (
              isCorrect ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )
            ) : null;

          return (
            <Label
              key={option}
              htmlFor={`${currentQuestion.id}-${index}`}
              className={cn('flex items-center space-x-3 rounded-md border p-3 transition-colors', feedbackClass, {
                'cursor-pointer hover:bg-muted/50': !isAnswered,
              })}
            >
              <RadioGroupItem value={index.toString()} id={`${currentQuestion.id}-${index}`} />
              <span>{option}</span>
              <div className="ml-auto pl-2">{indicator}</div>
            </Label>
          );
        })}
      </RadioGroup>

      {isAnswered && currentQuestion.explanation && (
        <div className="rounded-md border bg-secondary/50 p-3 text-sm text-muted-foreground">
          <p>{currentQuestion.explanation}</p>
        </div>
      )}

      <Button onClick={isAnswered ? handleNext : handleAnswer} disabled={selectedOption === null} className="w-full">
        {isAnswered ? 'Next' : 'Submit'}
      </Button>
    </div>
  );
}
