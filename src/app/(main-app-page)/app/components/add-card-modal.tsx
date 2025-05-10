"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextInputWithLimit } from "@/components/text-input";
import { JsonTextInput } from "@/components/json-text-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Info } from "lucide-react";

interface Deck {
  id: string;
  name: string;
  categoryName: string;
}

interface Card {
  question: string;
  answer: string;
}

interface AddCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCard: (question: string, answer: string, deckId: string) => void;
  onAddMultipleCards?: (
    cards: Array<{ question: string; answer: string }>,
    deckId: string
  ) => void;
  deckName?: string;
  availableDecks: Deck[];
  defaultDeckId?: string;
}

export default function AddCardModal({
  open,
  onOpenChange,
  onAddCard,
  onAddMultipleCards,
  deckName = "",
  availableDecks = [],
  defaultDeckId,
}: AddCardModalProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [jsonContent, setJsonContent] = useState(
    JSON.stringify(
      [
        {
          question: "Example question?",
          answer: "Example answer.",
        },
      ],
      null,
      2
    )
  );
  const [activeTab, setActiveTab] = useState("form");
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");

  const [isQuestionValid, setIsQuestionValid] = useState(true);
  const [isAnswerValid, setIsAnswerValid] = useState(true);
  const [isJsonValid, setIsJsonValid] = useState(true);

  // Set default deck when modal opens or defaultDeckId changes
  useEffect(() => {
    if (open) {
      if (defaultDeckId) {
        setSelectedDeckId(defaultDeckId);
      } else if (availableDecks.length > 0) {
        setSelectedDeckId(availableDecks[0].id);
      }
    }
  }, [open, defaultDeckId, availableDecks]);

  const handleSubmitForm = () => {
    if (!isQuestionValid || !isAnswerValid) {
      toast.error("Validation Error", {
        description: "Please fix the validation errors before saving.",
      });
      return;
    }

    if (!selectedDeckId) {
      toast.error("Validation Error", {
        description: "Please select a deck.",
      });
      return;
    }

    if (question.trim() && answer.trim()) {
      onAddCard(question, answer, selectedDeckId);
      resetForm();
    } else {
      toast.error("Validation Error", {
        description: "Question and answer cannot be empty.",
      });
    }
  };

  const handleSubmitJson = () => {
    if (!isJsonValid) {
      toast.error("Validation Error", {
        description: "Please fix the JSON format before saving.",
      });
      return;
    }

    if (!selectedDeckId) {
      toast.error("Validation Error", {
        description: "Please select a deck.",
      });
      return;
    }

    try {
      const parsed = JSON.parse(jsonContent);

      // Check if it's an array
      if (Array.isArray(parsed)) {
        // Validate each card in the array
        const isValid = parsed.every((card) => card.question && card.answer);
        if (!isValid) {
          toast.error("Validation Error", {
            description: "Each card must have 'question' and 'answer' fields.",
          });
          return;
        }

        // If we have a handler for multiple cards, use it
        if (onAddMultipleCards) {
          onAddMultipleCards(parsed, selectedDeckId);
          toast.success("Success", {
            description: `Added ${parsed.length} cards to the deck.`,
          });
        } else {
          // Otherwise, add just the first card
          if (parsed.length > 0) {
            const firstCard = parsed[0];
            onAddCard(firstCard.question, firstCard.answer, selectedDeckId);
            if (parsed.length > 1) {
              toast.warning("Warning", {
                description:
                  "Only the first card was added. Multiple card support is not enabled.",
              });
            }
          } else {
            toast.error("Validation Error", {
              description: "No cards found in the JSON array.",
            });
            return;
          }
        }
        resetForm();
      } else if (parsed.question && parsed.answer) {
        // Handle single object case for backward compatibility
        onAddCard(parsed.question, parsed.answer, selectedDeckId);
        resetForm();
      } else {
        toast.error("Validation Error", {
          description:
            "JSON must be an array of cards or a single card with 'question' and 'answer' fields.",
        });
      }
    } catch (error) {
      // This shouldn't happen since we validate JSON format
      toast.error("Error", {
        description: "Failed to parse JSON.",
      });
    }
  };

  const resetForm = () => {
    setQuestion("");
    setAnswer("");
    setJsonContent(
      JSON.stringify(
        [
          {
            question: "Example question?",
            answer: "Example answer.",
          },
        ],
        null,
        2
      )
    );
  };

  // Group decks by category for better organization in the dropdown
  const groupedDecks = availableDecks.reduce((acc, deck) => {
    if (!acc[deck.categoryName]) {
      acc[deck.categoryName] = [];
    }
    acc[deck.categoryName].push(deck);
    return acc;
  }, {} as Record<string, Deck[]>);

  const title = deckName ? `Add New Card to ${deckName}` : "Add New Card";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="deck-select" className="mb-2 block">
            Select Deck
          </Label>
          <Select value={selectedDeckId} onValueChange={setSelectedDeckId}>
            <SelectTrigger id="deck-select" className="w-full">
              <SelectValue placeholder="Select a deck" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(groupedDecks).map(([categoryName, decks]) => (
                <div key={categoryName}>
                  <div className="px-2 py-1.5 text-sm font-semibold text-gray-500">
                    {categoryName}
                  </div>
                  {decks.map((deck) => (
                    <SelectItem key={deck.id} value={deck.id}>
                      {deck.name}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>
          <TabsContent value="form" className="space-y-4 py-4">
            <TextInputWithLimit
              id="question"
              label="Question"
              value={question}
              onChange={setQuestion}
              onValidChange={setIsQuestionValid}
              maxLength={500}
              placeholder="Enter question..."
              multiline
              rows={4}
              required
              markdown={true} // Enable markdown for question
            />

            <TextInputWithLimit
              id="answer"
              label="Answer"
              value={answer}
              onChange={setAnswer}
              onValidChange={setIsAnswerValid}
              maxLength={1000}
              placeholder="Enter answer..."
              multiline
              rows={4}
              required
              markdown={true} // Enable markdown only for answer
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitForm}>Add Card</Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent value="json" className="space-y-4 py-4">
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="jsonContent" className="text-base">
                Card JSON
              </Label>
              <div className="flex items-center text-xs text-gray-500">
                <Info className="h-3.5 w-3.5 mr-1" />
                <span>Supports multiple cards as an array</span>
              </div>
            </div>
            <JsonTextInput
              id="jsonContent"
              value={jsonContent}
              onChange={setJsonContent}
              onValidChange={setIsJsonValid}
              placeholder="Enter card JSON..."
              rows={8}
              helperText="Enter your cards in JSON format with question and answer fields. You can add multiple cards as an array."
              required
              formatOnBlur
              markdown={true} // Keep markdown enabled for JSON view
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitJson}>
                Add Card{activeTab === "json" && "s"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
