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
import { TextInputWithLimit } from "@/components/text-input";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface Card {
  id: string;
  front: string;
  back: string;
}

interface CardDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: Card | null;
  onUpdate: (front: string, back: string) => void;
  onDelete: () => void;
}

export const CardDetailModal = ({
  open,
  onOpenChange,
  card,
  onUpdate,
  onDelete,
}: CardDetailModalProps) => {
  const [front, setFront] = useState(card?.front || "");
  const [back, setBack] = useState(card?.back || "");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (card) {
      setFront(card.front);
      setBack(card.back);
    }
  }, [card]);

  const handleSave = () => {
    if (front.trim() && back.trim()) {
      onUpdate(front, back);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (card) {
      setFront(card.front);
      setBack(card.back);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Card Details</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {isEditing ? (
            <>
              <TextInputWithLimit
                id="front"
                label="Front"
                value={front}
                onChange={setFront}
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
                maxLength={2000}
                placeholder="Enter back side..."
                multiline
                rows={4}
                required
                markdown={true}
              />
            </>
          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor="front">Front</Label>
                <div className="rounded-lg border p-3 bg-gray-50 prose">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {front}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="back">Back</Label>
                <div className="rounded-lg border p-3 bg-gray-50 prose">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {back}
                  </ReactMarkdown>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
