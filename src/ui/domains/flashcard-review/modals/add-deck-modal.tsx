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
import { validateCards } from "../utils";

interface Category {
  id: string;
  name: string;
}

interface AddDeckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddDeck: (name: string, deckId: string, jsonContent?: string) => void;
  categoryId: string | null;
  categories: Category[];
  onCategoryChange: (categoryId: string) => void;
}

export const AddDeckModal = ({
  open,
  onOpenChange,
  onAddDeck,
  categoryId,
  categories,
  onCategoryChange,
}: AddDeckModalProps) => {
  const [deckName, setDeckName] = useState("");
  const [jsonContent, setJsonContent] = useState(
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeckNameValid, setIsDeckNameValid] = useState(true);
  const [isJsonValid, setIsJsonValid] = useState(true);

  const handleSubmit = async () => {
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

    const trimmedDeckName = deckName.trim();
    if (trimmedDeckName) {
      try {
        setIsSubmitting(true);

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
        }

        // Pass to parent component to handle the actual creation
        await onAddDeck(trimmedDeckName, "", jsonContent);

        // Reset form but keep the category selected
        setDeckName("");
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
      } catch (error) {
        console.error("Error in modal validation:", error);
        toast.error("Validation Error", {
          description: "Invalid JSON format or structure.",
        });
      } finally {
        setIsSubmitting(false);
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
              <SelectTrigger id="category-select" className="w-full">
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
            maxLength={100}
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
            helperText="Enter your cards in JSON format. Each card should have a front and answer field."
            formatOnBlur
            markdown={true}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Add Deck"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
