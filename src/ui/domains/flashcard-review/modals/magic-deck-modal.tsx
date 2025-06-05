import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { UICategory } from "../types";

interface MagicDeckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (categoryId: string, deckName: string, prompt: string) => void;
  categories: UICategory[];
}

const DEFAULT_PROMPT = `Generate 10 flashcards that are concise, practical, and highly relevant for learning and review.

Each flashcard should:
- Be phrased as a clear front with a specific answer
- Focus on practical knowledge and real-world application
- Have an answer that fits in 1-2 sentences or a small code snippet
- Be technical and actionable, not just theoretical
- Be suitable for spaced repetition learning

Topic focus:
- Core concepts and best practices
- Recent developments and modern approaches
- Practical techniques and common scenarios
- Key principles and patterns
- Common pitfalls and solutions

Make the cards challenging enough to be valuable for learning but clear enough to have unambiguous answers.`;

export const MagicDeckModal = ({
  open,
  onOpenChange,
  onGenerate,
  categories,
}: MagicDeckModalProps) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [deckName, setDeckName] = useState("");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form and set defaults when modal opens
  useEffect(() => {
    if (open) {
      const timestamp = new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
      setDeckName(`Generated Deck ${timestamp}`);
      setSelectedCategoryId("");
      setPrompt(DEFAULT_PROMPT);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategoryId && deckName.trim() && prompt.trim()) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/generate-deck", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            categoryId: selectedCategoryId,
            deckName: deckName.trim(),
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to generate deck");
        }

        const result = await response.json();
        onGenerate(selectedCategoryId, deckName.trim(), prompt.trim());
        onOpenChange(false);
        toast.success(
          `Deck generated successfully with ${result.cardCount} cards!`
        );
      } catch (error) {
        console.error("Error generating deck:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to generate deck. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Magic Deck</DialogTitle>
          <DialogDescription>
            Choose a category and customize your AI prompt to generate a new
            deck.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <Select
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="deckName" className="text-sm font-medium">
              Deck Name
            </label>
            <Input
              id="deckName"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="Enter deck name"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium">
              AI Prompt
            </label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt for the AI to generate cards..."
              className="h-32"
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={
                !selectedCategoryId ||
                !deckName.trim() ||
                !prompt.trim() ||
                isLoading
              }
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Deck"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
