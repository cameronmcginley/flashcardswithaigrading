import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface QuizFormProps {
  quizId: string;
  questions: string[];
}

export default function QuizForm({ quizId, questions }: QuizFormProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<string[]>(
    new Array(questions.length).fill("")
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[index] = value;
      return newAnswers;
    });
  };

  const handleSubmit = async () => {
    if (answers.some((answer) => !answer.trim())) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/quiz/${quizId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit quiz");
      }

      await response.json();
      router.push(`/app/quiz/${quizId}/results`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {questions.map((question, index) => (
        <div key={index} className="space-y-4">
          <h3 className="text-lg font-semibold">
            Question {index + 1} of {questions.length}
          </h3>
          <p className="text-card-foreground">{question}</p>
          <Textarea
            value={answers[index]}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-[100px]"
          />
        </div>
      ))}
      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2"
        >
          {isSubmitting ? "Submitting..." : "Submit Quiz"}
        </Button>
      </div>
    </div>
  );
}
