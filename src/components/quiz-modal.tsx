import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Deck {
  id: string;
  name: string;
  cardCount: number;
}

interface Category {
  id: string;
  name: string;
  decks: Deck[];
}

interface GenerateQuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
}

export default function GenerateQuizModal({
  open,
  onOpenChange,
  categories,
}: GenerateQuizModalProps) {
  const router = useRouter();
  const [selectedDecks, setSelectedDecks] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState("5");
  const [isLoading, setIsLoading] = useState(false);

  // Flatten all decks from categories
  const allDecks = categories.flatMap((category) =>
    category.decks.map((deck) => ({
      ...deck,
      categoryName: category.name,
    }))
  );

  const handleDeckToggle = (deckId: string) => {
    setSelectedDecks((prev) =>
      prev.includes(deckId)
        ? prev.filter((id) => id !== deckId)
        : [...prev, deckId]
    );
  };

  const handleStartQuiz = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deckIds: selectedDecks,
          numQuestions: parseInt(questionCount),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }

      const data = await response.json();
      onOpenChange(false);
      router.push(`/app/quiz/${data.quizId}`);
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Failed to generate quiz. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start a Quiz</DialogTitle>
          <DialogDescription>
            Select one or more decks and set the number of questions for your
            quiz.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Select Decks</Label>
            <ScrollArea className="h-[200px] border rounded-md p-2">
              <div className="grid gap-2">
                {allDecks.map((deck) => (
                  <div key={deck.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={deck.id}
                      checked={selectedDecks.includes(deck.id)}
                      onCheckedChange={() => handleDeckToggle(deck.id)}
                    />
                    <Label htmlFor={deck.id} className="text-sm font-normal">
                      {deck.name} ({deck.cardCount} cards)
                      <span className="text-xs text-muted-foreground ml-2">
                        {deck.categoryName}
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="questionCount">Number of Questions</Label>
            <Input
              id="questionCount"
              type="number"
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
              min="1"
              max="50"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleStartQuiz}
            disabled={selectedDecks.length === 0 || !questionCount || isLoading}
          >
            {isLoading ? "Generating..." : "Start Quiz"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
