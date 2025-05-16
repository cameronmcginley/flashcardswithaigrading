"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { generateQuizDeck } from "@/features/quiz/quiz";
import { useRouter } from "next/navigation";

interface QuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decks: Array<{ id: string; name: string }>;
}

export function QuizModal({ open, onOpenChange, decks }: QuizModalProps) {
  const [selectedDecks, setSelectedDecks] = useState<string[]>([]);
  const [numQuestions, setNumQuestions] = useState("10");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStartQuiz = async () => {
    if (selectedDecks.length === 0) {
      toast.error("Please select at least one deck");
      return;
    }

    const questions = parseInt(numQuestions);
    if (isNaN(questions) || questions < 1) {
      toast.error("Please enter a valid number of questions");
      return;
    }

    setIsLoading(true);
    try {
      const quizDeck = await generateQuizDeck(selectedDecks, questions);
      onOpenChange(false);
      router.push(`/app/quiz/${quizDeck.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate quiz"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Quiz</DialogTitle>
          <DialogDescription>
            Create a quiz from your existing flashcard decks
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="decks">Select Decks</Label>
            <Select
              onValueChange={(value) => setSelectedDecks([value])}
              value={selectedDecks[0]}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a deck" />
              </SelectTrigger>
              <SelectContent>
                {decks.map((deck) => (
                  <SelectItem key={deck.id} value={deck.id}>
                    {deck.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="questions">Number of Questions</Label>
            <Input
              id="questions"
              type="number"
              min="1"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleStartQuiz} disabled={isLoading}>
            {isLoading ? "Generating..." : "Start Quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
