"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

interface Category {
  id: string;
  name: string;
}

interface AddDeckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddDeck: (name: string) => void;
  categoryId: string | null;
  categoryName: string;
  categories: Category[];
  onCategoryChange: (categoryId: string) => void;
}

export default function AddDeckModal({
  open,
  onOpenChange,
  onAddDeck,
  categoryId,
  categoryName,
  categories,
  onCategoryChange,
}: AddDeckModalProps) {
  const [deckName, setDeckName] = useState("");
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

  const [isDeckNameValid, setIsDeckNameValid] = useState(true);
  const [isJsonValid, setIsJsonValid] = useState(true);

  const handleSubmit = () => {
    if (!isDeckNameValid || !isJsonValid) {
      toast.error("Validation Error", {
        description: "Please fix the validation errors before saving.",
      });
      return;
    }

    if (!categoryId) {
      toast.error("Validation Error", {
        description: "Please select a category.",
      });
      return;
    }

    if (deckName.trim()) {
      try {
        // Validate JSON structure
        const parsed = JSON.parse(jsonContent);
        if (!Array.isArray(parsed)) {
          toast.error("Validation Error", {
            description: "JSON must be an array of cards.",
          });
          return;
        }

        // Check if each card has question and answer
        const isValid = parsed.every((card) => card.question && card.answer);
        if (!isValid) {
          toast.error("Validation Error", {
            description: "Each card must have 'question' and 'answer' fields.",
          });
          return;
        }

        onAddDeck(deckName);
        setDeckName("");
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
      } catch (error) {
        // This shouldn't happen since we validate JSON format
        toast.error("Error", {
          description: "Failed to parse JSON.",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Deck</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="category-select">Category</Label>
            <Select
              value={categoryId || ""}
              onValueChange={(value) => onCategoryChange(value)}
            >
              <SelectTrigger id="category-select">
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

          <TextInputWithLimit
            id="deckName"
            label="Deck Name"
            value={deckName}
            onChange={setDeckName}
            onValidChange={setIsDeckNameValid}
            maxLength={50}
            placeholder="Enter deck name..."
            required
          />

          <JsonTextInput
            id="jsonContent"
            label="Cards (JSON Format)"
            value={jsonContent}
            onChange={setJsonContent}
            onValidChange={setIsJsonValid}
            placeholder="Enter cards JSON..."
            rows={10}
            helperText="Enter your cards in JSON format. Each card should have a question and answer field."
            formatOnBlur
            markdown={true}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Deck</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
