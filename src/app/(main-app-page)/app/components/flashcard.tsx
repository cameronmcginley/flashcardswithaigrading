"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Edit,
  Trash,
  Check,
  X,
  Brain,
  Info,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface FlashcardProps {
  card: {
    id: string;
    question: string;
    answer: string;
    difficulty?: "beginner" | "adept" | "master";
  };
  onUpdate: (
    question: string,
    answer: string,
    difficulty?: "beginner" | "adept" | "master"
  ) => void;
  onDelete: () => void;
  resetGradingOnCardChange?: boolean;
  onAnswered?: () => void;
}

export default function Flashcard({
  card,
  onUpdate,
  onDelete,
  resetGradingOnCardChange = true,
  onAnswered,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [editingQuestion, setEditingQuestion] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState(false);
  const [tempQuestion, setTempQuestion] = useState(card.question);
  const [tempAnswer, setTempAnswer] = useState(card.answer);
  const [isGrading, setIsGrading] = useState(false);
  const [isGraded, setIsGraded] = useState(false);
  const [aiGrade, setAiGrade] = useState<{
    grade: number;
    response: string;
  } | null>(null);

  const resetGrading = () => {
    setIsGraded(false);
    setAiGrade(null);
    setIsGrading(false);
  };

  useEffect(() => {
    // Reset grading when card changes
    if (resetGradingOnCardChange) {
      resetGrading();
      setTempQuestion(card.question);
      setTempAnswer(card.answer);
    }
  }, [card.id, resetGradingOnCardChange]);

  // Separate effect to keep temp values in sync
  useEffect(() => {
    if (!editingQuestion) {
      setTempQuestion(card.question);
    }
    if (!editingAnswer) {
      setTempAnswer(card.answer);
    }
  }, [card.question, card.answer, editingQuestion, editingAnswer]);

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

  const handleFlip = () => {
    setIsFlipped(!isFlipped);

    // Notify parent that user has answered (viewed the answer)
    if (!isFlipped && onAnswered) {
      onAnswered();
    }
  };

  const handleGradeWithAI = () => {
    // Reset any previous grading first
    resetGrading();

    // Then start new grading process
    setIsGrading(true);

    // Simulate API call to grade the answer
    setTimeout(() => {
      // Mock AI response based on difficulty
      let baseScore;
      switch (card.difficulty) {
        case "master":
          baseScore = Math.floor(Math.random() * 20) + 60; // 60-79 for master
          break;
        case "adept":
          baseScore = Math.floor(Math.random() * 20) + 70; // 70-89 for adept
          break;
        case "beginner":
        default:
          baseScore = Math.floor(Math.random() * 20) + 75; // 75-94 for beginner
      }

      const mockGrade = {
        grade: baseScore,
        response:
          card.difficulty === "master"
            ? "Your answer covers some key points but lacks precision and depth. A more comprehensive explanation would include additional details and examples."
            : card.difficulty === "adept"
            ? "Your answer captures the main concept but lacks some important details. Consider reviewing the complete definition for a more comprehensive understanding."
            : "Good attempt! You've grasped the basic concept, though there's room to expand your understanding with more details.",
      };

      setAiGrade(mockGrade);
      setIsGraded(true);
      setIsGrading(false);

      toast.success("AI Grading Complete", {
        description: `Your answer has been graded. Score: ${mockGrade.grade}%`,
      });
    }, 1500);
  };

  const startEditingQuestion = () => {
    setTempQuestion(card.question);
    setEditingQuestion(true);
  };

  const startEditingAnswer = () => {
    setTempAnswer(card.answer);
    setEditingAnswer(true);
  };

  const startEditing = () => {
    if (isFlipped) {
      startEditingAnswer();
    } else {
      startEditingQuestion();
    }
  };

  const saveQuestion = () => {
    if (tempQuestion.trim()) {
      onUpdate(tempQuestion, card.answer);
      setEditingQuestion(false);
    }
  };

  const saveAnswer = () => {
    if (tempAnswer.trim()) {
      onUpdate(card.question, tempAnswer);
      setEditingAnswer(false);
    }
  };

  const cancelEditingQuestion = () => {
    setEditingQuestion(false);
    setTempQuestion(card.question);
  };

  const cancelEditingAnswer = () => {
    setEditingAnswer(false);
    setTempAnswer(card.answer);
  };

  // Function to get color based on grade percentage
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "bg-green-500";
    if (grade >= 80) return "bg-green-400";
    if (grade >= 70) return "bg-yellow-400";
    if (grade >= 60) return "bg-yellow-500";
    if (grade >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  // Function to get text color based on grade percentage
  const getGradeTextColor = (grade: number) => {
    if (grade >= 80) return "text-green-500";
    if (grade >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  // Function to copy feedback to clipboard and open ChatGPT
  const copyFeedbackAndOpenChatGPT = () => {
    if (!aiGrade) return;

    const feedbackText = `This is the feedback I got for an AI graded flashcard answer

Question: ${card.question}
Correct Answer: ${card.answer}
Your Answer: ${userAnswer || "(No answer provided)"}
AI Feedback: ${aiGrade.response}
Grade: ${aiGrade.grade}%

Can you help me understand this feedback better and suggest how I can improve my answer?`;

    // Copy to clipboard
    navigator.clipboard
      .writeText(feedbackText)
      .then(() => {
        toast.success("Feedback copied to clipboard");
        // Open ChatGPT in a new tab
        window.open("https://chat.openai.com", "_blank");
      })
      .catch((err) => {
        toast.error("Failed to copy feedback", {
          description: "Please try again or copy manually.",
        });
        console.error("Failed to copy feedback:", err);
      });
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Action buttons above the card - now icon only */}
      <div className="flex justify-end mb-2 gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 p-0">
              <Info className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Card Statistics</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="text-muted-foreground">Ease Factor:</div>
                <div>{cardStats.easeFactor}</div>

                <div className="text-muted-foreground">Interval:</div>
                <div>{cardStats.interval} days</div>

                <div className="text-muted-foreground">Reviews:</div>
                <div>{cardStats.reviews}</div>

                <div className="text-muted-foreground">Lapses:</div>
                <div>{cardStats.lapses}</div>

                <div className="text-muted-foreground">Last Reviewed:</div>
                <div>{cardStats.lastReviewed}</div>

                <div className="text-muted-foreground">Next Review:</div>
                <div>{cardStats.nextReview}</div>

                <div className="text-muted-foreground">Streak:</div>
                <div>{cardStats.streak}</div>

                <div className="text-muted-foreground">Average Time:</div>
                <div>{cardStats.averageTime}</div>
              </div>
              <div className="pt-2 text-xs text-muted-foreground">
                Based on the SM-2 spaced repetition algorithm
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 p-0"
          onClick={startEditing}
        >
          <Edit className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 p-0 text-red-500 hover:text-red-600"
          onClick={onDelete}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>

      <Card className="w-full shadow-lg">
        <CardContent className="p-6">
          {/* Add this right after the "Question"/"Answer" text at the top of the card */}
          <div className="text-sm font-medium text-muted-foreground mb-4 flex justify-between items-center">
            <span>{isFlipped ? "Answer" : "Question"}</span>
            {card.difficulty && (
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  card.difficulty === "beginner"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : card.difficulty === "adept"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                )}
              >
                {card.difficulty.charAt(0).toUpperCase() +
                  card.difficulty.slice(1)}
              </span>
            )}
          </div>

          {!isFlipped ? (
            <div className="mb-6">
              <div className="group relative">
                {editingQuestion ? (
                  <div className="space-y-2">
                    <div>
                      <Textarea
                        value={tempQuestion}
                        onChange={(e) => setTempQuestion(e.target.value)}
                        className="min-h-[150px] w-full"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveQuestion}>
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditingQuestion}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-lg font-medium mb-6 max-h-[200px] overflow-y-auto pr-1 prose">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {card.question}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Textarea
                    placeholder="Type your answer here..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="min-h-[150px] w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleFlip}>Flip</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="group relative">
                {editingAnswer ? (
                  <div className="space-y-2">
                    <div>
                      <Textarea
                        value={tempAnswer}
                        onChange={(e) => setTempAnswer(e.target.value)}
                        className="min-h-[150px] w-full"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveAnswer}>
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditingAnswer}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-lg font-medium mb-6 max-h-[200px] overflow-y-auto pr-1 prose">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {card.answer}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="p-4 bg-muted/20 rounded-lg mb-4 max-h-[150px] overflow-y-auto">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Your Answer:
                  </div>
                  <div>{userAnswer || "(No answer provided)"}</div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleFlip}>Back to Question</Button>
                  <Button
                    variant="outline"
                    onClick={isGraded ? resetGrading : handleGradeWithAI}
                    disabled={isGrading}
                    className="relative"
                  >
                    <Brain className="h-4 w-4 mr-1" />
                    {isGraded ? "Reset Grading" : "Grade with AI"}

                    {isGrading && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }}
                        />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Feedback Bubble */}
      <AnimatePresence>
        {isGraded && aiGrade && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-8"
          >
            <Card className="p-6 border-2 border-border bg-muted/20 relative">
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={resetGrading}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="absolute -top-3 left-10 w-6 h-6 bg-muted/20 border-t-2 border-l-2 border-border transform rotate-45"></div>
              <div className="flex items-start gap-4">
                <div className="bg-muted p-2 rounded-full">
                  <Brain className="h-6 w-6 text-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-lg">AI Feedback</h4>
                    <div className="text-lg font-bold">
                      <span className={getGradeTextColor(aiGrade.grade)}>
                        {aiGrade.grade}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-muted rounded-full mb-4 overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        getGradeColor(aiGrade.grade)
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${aiGrade.grade}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>

                  <p className="text-foreground mb-4">{aiGrade.response}</p>

                  {/* Ask ChatGPT Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5"
                    onClick={copyFeedbackAndOpenChatGPT}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Ask ChatGPT for Help</span>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
