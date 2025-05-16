"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { type QuizResult, getQuizResults } from "@/features/quiz/quiz";

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [averageGrade, setAverageGrade] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await getQuizResults(params.quizId as string);
        setResults(data.results);
        setAverageGrade(data.average_grade);
      } catch {
        toast.error("Failed to load quiz results");
      }
    };

    fetchResults();
  }, [params.quizId]);

  const handleReturnToApp = () => {
    router.push("/app");
  };

  return (
    <div className="container max-w-3xl py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Quiz Results</h1>
        <Button onClick={handleReturnToApp}>Return to App</Button>
      </div>

      <div className="mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          <p className="text-lg">Final Score: {Math.round(averageGrade)}%</p>
          <p className="text-muted-foreground">
            Total Questions: {results.length}
          </p>
        </Card>
      </div>

      <div className="space-y-6">
        {results.map((result) => (
          <Card key={result.questionNumber} className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">
                Question {result.questionNumber}
              </h3>
              <p className="text-muted-foreground mb-4">{result.question}</p>
            </div>

            <div className="grid gap-4">
              <div>
                <p className="font-medium">Your Answer:</p>
                <p className="mt-1">{result.userAnswer}</p>
              </div>

              <div>
                <p className="font-medium">Correct Answer:</p>
                <p className="mt-1">{result.correctAnswer}</p>
              </div>

              <div>
                <p className="font-medium">Grade:</p>
                <p className="mt-1">{result.grade}%</p>
              </div>

              <div>
                <p className="font-medium">Feedback:</p>
                <p className="mt-1">{result.feedback}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
