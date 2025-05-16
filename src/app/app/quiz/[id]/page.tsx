"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { type QuizResult, saveQuizResults } from "@/features/quiz/quiz";
import { supabase } from "@/lib/supabase/client";

interface QuizCard {
  id: string;
  front: string;
  back: string;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const [cards, setCards] = useState<QuizCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const fetchCards = async () => {
      const { data, error } = await supabase
        .from("cards")
        .select("id, front, back")
        .eq("deck_id", params.id)
        .order("created_at", { ascending: true });

      if (error) {
        toast.error("Failed to load quiz questions");
        return;
      }

      setCards(data || []);
    };

    fetchCards();
  }, [params.id]);

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error("Please enter an answer");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/quiz/${params.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: [userAnswer], // Send as array since API expects array of answers
        }),
      });

      if (!response.ok) throw new Error("Failed to grade answer");

      const result = await response.json();
      const feedback = result.feedback[0]; // Get first feedback since we're submitting one answer

      const quizResult: QuizResult = {
        questionNumber: currentIndex + 1,
        question: cards[currentIndex].front,
        correctAnswer: cards[currentIndex].back,
        userAnswer,
        grade: feedback.score * 10, // Convert 0-10 score to percentage
        feedback: feedback.feedback,
      };

      setResults([...results, quizResult]);

      if (currentIndex === cards.length - 1) {
        // Quiz complete
        await saveQuizResults(params.id as string, [...results, quizResult]);
        setIsComplete(true);
      } else {
        // Next question
        setCurrentIndex(currentIndex + 1);
        setUserAnswer("");
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.error("Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewResults = () => {
    router.push(`/app/quiz/${params.id}/results`);
  };

  if (cards.length === 0) {
    return <div>Loading quiz...</div>;
  }

  if (isComplete) {
    const averageGrade =
      results.reduce((sum, r) => sum + r.grade, 0) / results.length;

    return (
      <div className="container max-w-2xl py-8">
        <h1 className="text-2xl font-bold mb-4">Quiz Complete!</h1>
        <p className="text-lg mb-4">
          Your average score: {Math.round(averageGrade)}%
        </p>
        <Button onClick={handleViewResults}>View Detailed Results</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h2 className="text-lg font-medium text-muted-foreground">
          Question {currentIndex + 1} of {cards.length}
        </h2>
      </div>

      <Card className="p-6">
        <div className="prose dark:prose-invert max-w-none mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {cards[currentIndex].front}
          </h3>
        </div>

        <div className="space-y-4">
          <Textarea
            placeholder="Enter your answer..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            rows={4}
          />

          <Button
            className="w-full"
            onClick={handleSubmitAnswer}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Grading..." : "Submit Answer"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
