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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextInputWithLimit } from "@/components/text-input";
import { toast } from "sonner";
import { Trash, Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CardDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: {
    id: string;
    question: string;
    answer: string;
  };
  onUpdate: (question: string, answer: string) => void;
  onDelete: () => void;
}

export default function CardDetailModal({
  open,
  onOpenChange,
  card,
  onUpdate,
  onDelete,
}: CardDetailModalProps) {
  const [question, setQuestion] = useState(card.question);
  const [answer, setAnswer] = useState(card.answer);
  const [activeTab, setActiveTab] = useState("question");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isQuestionValid, setIsQuestionValid] = useState(true);
  const [isAnswerValid, setIsAnswerValid] = useState(true);

  // Mock card statistics - in a real app, these would come from your spaced repetition algorithm
  const cardStats = {
    easeFactor: 2.5,
    interval: 15,
    reviews: 8,
    lapses: 2,
    lastReviewed: "2023-05-08",
    nextReview: "2023-05-23",
    streak: 3,
    averageTime: "45s",
  };

  const handleSave = () => {
    if (!isQuestionValid || !isAnswerValid) {
      toast.error("Validation Error", {
        description: "Please fix the validation errors before saving.",
      });
      return;
    }

    if (question.trim() && answer.trim()) {
      onUpdate(question, answer);
      onOpenChange(false);
    } else {
      toast.error("Validation Error", {
        description: "Question and answer cannot be empty.",
      });
    }
  };

  const handleDelete = () => {
    onDelete();
    setIsDeleteDialogOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between pr-8">
            <DialogTitle>Card Details</DialogTitle>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Info className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Card Statistics</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="text-gray-500">Ease Factor:</div>
                      <div>{cardStats.easeFactor}</div>

                      <div className="text-gray-500">Interval:</div>
                      <div>{cardStats.interval} days</div>

                      <div className="text-gray-500">Reviews:</div>
                      <div>{cardStats.reviews}</div>

                      <div className="text-gray-500">Lapses:</div>
                      <div>{cardStats.lapses}</div>

                      <div className="text-gray-500">Last Reviewed:</div>
                      <div>{cardStats.lastReviewed}</div>

                      <div className="text-gray-500">Next Review:</div>
                      <div>{cardStats.nextReview}</div>

                      <div className="text-gray-500">Streak:</div>
                      <div>{cardStats.streak}</div>

                      <div className="text-gray-500">Average Time:</div>
                      <div>{cardStats.averageTime}</div>
                    </div>
                    <div className="pt-2 text-xs text-gray-500">
                      Based on the SM-2 spaced repetition algorithm
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="question">Question</TabsTrigger>
              <TabsTrigger value="answer">Answer</TabsTrigger>
            </TabsList>
            <TabsContent value="question" className="space-y-4 py-4">
              <TextInputWithLimit
                id="question"
                label="Question"
                value={question}
                onChange={setQuestion}
                onValidChange={setIsQuestionValid}
                maxLength={500}
                placeholder="Enter question..."
                multiline
                rows={8}
                required
                markdown={true} // Enable markdown for question
                className="resize-y"
              />
            </TabsContent>
            <TabsContent value="answer" className="space-y-4 py-4">
              <TextInputWithLimit
                id="answer"
                label="Answer"
                value={answer}
                onChange={setAnswer}
                onValidChange={setIsAnswerValid}
                maxLength={1000}
                placeholder="Enter answer..."
                multiline
                rows={8}
                required
                markdown={true} // Enable markdown for answer
                className="resize-y"
              />
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this card? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
