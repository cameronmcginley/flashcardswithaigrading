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
import { UIDeck } from "../types";
import { validateCards } from "../utils";

interface AddCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCard: (front: string, back: string, deckId: string) => void;
  onUpdateCard?: (cardId: string, front: string, back: string) => void;
  onAddMultipleCards?: (
    cards: Array<{ front: string; back: string }>,
    deckId: string
  ) => void;
  deckName?: string;
  availableDecks: UIDeck[];
  defaultDeckId?: string;
  editMode?: boolean;
  initialCard?: { id?: string; front: string; back: string };
}

export const AddCardModal = ({
  open,
  onOpenChange,
  onAddCard,
  onUpdateCard,
  onAddMultipleCards,
  deckName = "",
  availableDecks = [],
  defaultDeckId,
  editMode = false,
  initialCard,
}: AddCardModalProps) => {
  const [front, setFront] = useState(initialCard?.front || "");
  const [back, setBack] = useState(initialCard?.back || "");
  const [jsonContent, setJsonContent] = useState(
    JSON.stringify(
      [
        {
          front: initialCard?.front || "Example front?",
          back: initialCard?.back || "Example back.",
        },
      ],
      null,
      2
    )
  );
  const [activeTab, setActiveTab] = useState("form");
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");

  const [isFrontValid, setIsFrontValid] = useState(true);
  const [isBackValid, setIsBackValid] = useState(true);
  const [isJsonValid, setIsJsonValid] = useState(true);

  // Reset form when modal opens or initialCard changes
  useEffect(() => {
    if (open) {
      if (initialCard) {
        setFront(initialCard.front);
        setBack(initialCard.back);
        setJsonContent(
          JSON.stringify(
            [
              {
                front: initialCard.front,
                back: initialCard.back,
              },
            ],
            null,
            2
          )
        );
      }

      if (defaultDeckId) {
        setSelectedDeckId(defaultDeckId);
      } else if (availableDecks.length > 0) {
        setSelectedDeckId(availableDecks[0].id);
      }
    }
  }, [open, initialCard, defaultDeckId, availableDecks]);

  const handleSubmitForm = () => {
    if (!isFrontValid || !isBackValid) {
      toast.error("Validation Error", {
        description: "Please fix the validation errors before saving.",
      });
      return;
    }

    if (!editMode && !selectedDeckId) {
      toast.error("Validation Error", {
        description: "Please select a deck.",
      });
      return;
    }

    if (front.trim() && back.trim()) {
      if (editMode && initialCard?.id && onUpdateCard) {
        onUpdateCard(initialCard.id, front, back);
      } else {
        onAddCard(front, back, selectedDeckId);
      }
      resetForm();
    } else {
      toast.error("Validation Error", {
        description: "Front and back cannot be empty.",
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

    if (!editMode && !selectedDeckId) {
      toast.error("Validation Error", {
        description: "Please select a deck.",
      });
      return;
    }

    if (jsonContent) {
      // Validate JSON structure
      const parsed = JSON.parse(jsonContent);
      const validation = validateCards(parsed);
      if (!validation.isValid) {
        toast.error("Validation Error", {
          description: validation.error,
        });
        return;
      }

      const normalizedCards = validation.normalizedCards;

      if (editMode) {
        if (parsed.length > 1) {
          toast.error("Validation Error", {
            description: "Cannot edit multiple cards at once.",
          });
          return;
        }
        if (initialCard?.id && onUpdateCard) {
          const normalizedCard = normalizedCards![0];
          onUpdateCard(
            initialCard.id,
            normalizedCard.front,
            normalizedCard.back
          );
        }
      } else {
        // If we have a handler for multiple cards, use it
        if (onAddMultipleCards) {
          onAddMultipleCards(normalizedCards!, selectedDeckId);
          toast.success("Success", {
            description: `Added ${normalizedCards!.length} cards to the deck.`,
          });
        } else {
          // Otherwise, add just the first card
          if (normalizedCards!.length > 0) {
            const firstCard = normalizedCards![0];
            onAddCard(firstCard.front, firstCard.back, selectedDeckId);
            if (normalizedCards!.length > 1) {
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
      }
      resetForm();
    } else {
      toast.error("Validation Error", {
        description: "No JSON content provided.",
      });
    }
  };

  const resetForm = () => {
    if (!editMode) {
      setFront("");
      setBack("");
      setJsonContent(
        JSON.stringify(
          [
            {
              front: "Example front?",
              back: "Example back.",
            },
          ],
          null,
          2
        )
      );
    }
    onOpenChange(false);
  };

  // Group decks by category for better organization in the dropdown
  const groupedDecks = availableDecks.reduce((acc, deck) => {
    if (!acc[deck.categoryId]) {
      acc[deck.categoryId] = [];
    }
    acc[deck.categoryId].push(deck);
    return acc;
  }, {} as Record<string, UIDeck[]>);

  const title = editMode
    ? "Edit Card"
    : deckName
    ? `Add New Card to ${deckName}`
    : "Add New Card";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {!editMode && (
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
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>
          <TabsContent value="form" className="space-y-4 py-4">
            <TextInputWithLimit
              id="front"
              label="Front"
              value={front}
              onChange={setFront}
              onValidChange={setIsFrontValid}
              maxLength={2000}
              placeholder="Enter front side..."
              multiline
              rows={4}
              required
              markdown={true}
            />

            <TextInputWithLimit
              id="back"
              label="Back"
              value={back}
              onChange={setBack}
              onValidChange={setIsBackValid}
              maxLength={2000}
              placeholder="Enter back side..."
              multiline
              rows={4}
              required
              markdown={true}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitForm}>
                {editMode ? "Save Changes" : "Add Card"}
              </Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent value="json" className="space-y-4 py-4">
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="jsonContent" className="text-base">
                Card JSON
              </Label>
              {!editMode && (
                <div className="flex items-center text-xs text-gray-500">
                  <Info className="h-3.5 w-3.5 mr-1" />
                  <span>Supports multiple cards as an array</span>
                </div>
              )}
            </div>
            <JsonTextInput
              id="jsonContent"
              value={jsonContent}
              onChange={setJsonContent}
              onValidChange={setIsJsonValid}
              placeholder="Enter card JSON..."
              rows={8}
              helperText={
                editMode
                  ? "Edit your card in JSON format with front and back fields."
                  : "Enter your cards in JSON format with front and back fields. You can add multiple cards as an array."
              }
              required
              formatOnBlur
              markdown={true}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitJson}>
                {editMode
                  ? "Save Changes"
                  : `Add Card${activeTab === "json" ? "s" : ""}`}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
