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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { MarkdownContent } from "@/components/markdown-content";
import { scoreCard } from "@/features/cards/sorting";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FlashcardProps {
  card: {
    id: string;
    question: string;
    answer: string;
    ease?: number;
    review_count?: number;
    correct_count?: number;
    partial_correct_count?: number;
    incorrect_count?: number;
    last_reviewed?: Date | string | null;
  };
  onUpdate: (question: string, answer: string) => void;
  onDelete: () => void;
  resetGradingOnCardChange?: boolean;
  onAnswered?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onCorrect?: () => void;
  onPartiallyCorrect?: () => void;
  onWrong?: () => void;
  allCards?: Array<{
    id: string;
    question: string;
    ease: number;
    review_count: number;
    last_reviewed: Date | string | null;
  }>;
}

export default function Flashcard({
  card,
  onUpdate,
  onDelete,
  resetGradingOnCardChange = true,
  onAnswered,
  onPrevious,
  onNext,
  onCorrect,
  onPartiallyCorrect,
  onWrong,
  allCards,
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

  // Calculate card statistics from real data
  const getCardStats = () => {
    // Use only actual collected data
    const easeFactor = card.ease ?? 2.5;
    const reviews = card.review_count ?? 0;
    const correct = card.correct_count ?? 0;
    const partial = card.partial_correct_count ?? 0;
    const incorrect = card.incorrect_count ?? 0;

    // Format dates
    let lastReviewed = "Never";
    if (card.last_reviewed) {
      const date =
        typeof card.last_reviewed === "string"
          ? new Date(card.last_reviewed)
          : card.last_reviewed;

      lastReviewed = date ? date.toLocaleDateString() : "Never";
    }

    return {
      easeFactor: easeFactor.toFixed(1),
      reviews,
      correct,
      partial,
      incorrect,
      lastReviewed,
    };
  };

  const cardStats = getCardStats();

  const handleFlip = async () => {
    setIsFlipped(!isFlipped);

    // Get auto-grade setting from localStorage
    const savedSettings = localStorage.getItem("ez-anki-settings");
    let autoGrade = false;
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        autoGrade = settings.autoGrade || false;
      } catch (e) {
        console.error("Error parsing settings:", e);
      }
    }

    // If flipping to answer and auto-grade is enabled and not already graded, trigger grading
    if (!isFlipped && autoGrade && userAnswer.trim() && !isGraded) {
      await handleGradeWithAI();
    }

    // Notify parent that user has answered (viewed the answer)
    if (!isFlipped && onAnswered) {
      onAnswered();
    }
  };

  const handleGradeWithAI = async () => {
    // Don't grade if answer is empty
    if (!userAnswer.trim()) {
      toast.error("Cannot grade empty answer", {
        description: "Please provide an answer before grading.",
      });
      return;
    }

    // Reset any previous grading first
    resetGrading();

    // Then start new grading process
    setIsGrading(true);

    // Get the global difficulty setting from localStorage
    const savedSettings = localStorage.getItem("ez-anki-settings");
    let gradingDifficulty = 2; // Default to adept (2) if not found

    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.gradingDifficulty) {
          gradingDifficulty =
            settings.gradingDifficulty === "beginner"
              ? 1
              : settings.gradingDifficulty === "master"
              ? 3
              : 2;
        }
      } catch (e) {
        console.error("Error parsing settings:", e);
      }
    }

    try {
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: card.question,
          answer: card.answer,
          userAnswer: userAnswer,
          gradingDifficulty,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to grade answer");
      }

      const result = await response.json();
      setAiGrade(result);
      setIsGraded(true);

      // Auto-mark the card based on the AI grade, but don't advance to next card
      if (result.grade >= 80 && onCorrect) {
        // ≥80% - Mark as correct
        await onCorrect();
      } else if (result.grade >= 60 && onPartiallyCorrect) {
        // 60-79% - Mark as partially correct
        await onPartiallyCorrect();
      } else if (result.grade < 60 && onWrong) {
        // <60% - Mark as incorrect
        await onWrong();
      }
    } catch (error) {
      console.error("Error grading answer:", error);
      toast.error("Failed to grade answer", {
        description: "Please try again or grade manually.",
      });
    } finally {
      setIsGrading(false);
    }
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
      {/* Action buttons above the card */}
      <div className="flex justify-between mb-2">
        {/* Debug Mode Info Button - only shown when debug mode is on (left side) */}
        <div>
          {(() => {
            // Check if debug mode is enabled
            const savedSettings = localStorage.getItem("ez-anki-settings");
            let debugMode = false;
            if (savedSettings) {
              try {
                const settings = JSON.parse(savedSettings);
                debugMode = settings.debugMode || false;
              } catch (e) {
                console.error("Error parsing settings:", e);
              }
            }

            if (debugMode && allCards && allCards.length > 0) {
              return (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 p-0">
                      <Info className="h-4 w-4 text-amber-500" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="start">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">
                        Debug: Cards in Deck
                      </h4>
                      <div className="max-h-[400px] overflow-y-auto border rounded-md p-2">
                        <table className="w-full text-xs">
                          <thead className="sticky top-0 bg-gray-100">
                            <tr className="border-b">
                              <th className="w-10 py-1 text-left font-medium text-gray-600">
                                No.
                              </th>
                              <th className="w-16 py-1 text-left font-medium text-gray-600">
                                Score
                              </th>
                              <th className="py-1 text-left font-medium text-gray-600">
                                Question
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {allCards.map((c, index) => {
                              // Calculate score for sorting
                              const score = Math.round(
                                scoreCard(
                                  {
                                    ease: c.ease,
                                    last_reviewed: c.last_reviewed
                                      ? new Date(c.last_reviewed)
                                      : new Date(0),
                                    review_count: c.review_count,
                                  },
                                  false
                                )
                              );
                              return (
                                <tr
                                  key={c.id}
                                  className="border-b border-gray-100 last:border-0"
                                >
                                  <td className="py-1 pr-2 text-gray-500">
                                    {index + 1}.
                                  </td>
                                  <td className="py-1 pr-2 font-mono text-blue-600">
                                    {score}
                                  </td>
                                  <td className="py-1 truncate">
                                    {c.question.length > 50
                                      ? c.question.substring(0, 50) + "..."
                                      : c.question}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              );
            }
            return null;
          })()}
        </div>

        {/* Other action buttons (right side) */}
        <div className="flex gap-2">
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

                  <div className="text-muted-foreground">Reviews:</div>
                  <div>{cardStats.reviews}</div>

                  <div className="text-muted-foreground">Correct Answers:</div>
                  <div>{cardStats.correct}</div>

                  <div className="text-muted-foreground">Partial Answers:</div>
                  <div>{cardStats.partial}</div>

                  <div className="text-muted-foreground">
                    Incorrect Answers:
                  </div>
                  <div>{cardStats.incorrect}</div>

                  <div className="text-muted-foreground">Last Reviewed:</div>
                  <div>{cardStats.lastReviewed}</div>
                </div>

                <div className="border rounded-md p-3 bg-muted/20 text-xs space-y-1">
                  <h5 className="font-medium">Grading System</h5>
                  <div className="grid gap-3 mt-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                        <strong>Correct:</strong>
                      </div>
                      <div className="pl-3.5">
                        <div>Solid recall (≥80%)</div>
                        <div className="text-muted-foreground">+5% ease</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0"></span>
                        <strong>Partial:</strong>
                      </div>
                      <div className="pl-3.5">
                        <div>Knew concept but missed details (60-79%)</div>
                        <div className="text-muted-foreground">-5% ease</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                        <strong>Incorrect:</strong>
                      </div>
                      <div className="pl-3.5">
                        <div>Didn&apos;t recall properly (&lt;60%)</div>
                        <div className="text-muted-foreground">-15% ease</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 pt-1 border-t text-muted-foreground">
                    AI grading automatically applies these verdicts based on
                    your answer.
                  </div>
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
      </div>

      <Card className="w-full shadow-lg">
        <CardContent className="p-6">
          <div className="text-sm font-medium text-muted-foreground mb-4">
            <span>{isFlipped ? "Answer" : "Question"}</span>
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
                  <div className="text-lg font-medium mb-6 max-h-[200px] overflow-y-auto pr-1">
                    <MarkdownContent content={card.question} />
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
                  <div className="text-lg font-medium mb-6 max-h-[200px] overflow-y-auto pr-1">
                    <MarkdownContent content={card.answer} />
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
                    onClick={() => {
                      handleGradeWithAI().catch((error) => {
                        console.error("Error in handleGradeWithAI:", error);
                        toast.error("Failed to grade answer", {
                          description: "Please try again or grade manually.",
                        });
                      });
                    }}
                    disabled={isGrading || isGraded}
                    className="relative"
                  >
                    <Brain className="h-4 w-4 mr-1" />
                    {isGraded ? "Already Graded" : "Grade with AI"}
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

                {/* Manual grading buttons */}
                {onCorrect &&
                  onWrong &&
                  !isGraded &&
                  !isGrading &&
                  (() => {
                    // Check if auto-grade is enabled in localStorage
                    const savedSettings =
                      localStorage.getItem("ez-anki-settings");
                    let autoGrade = false;
                    if (savedSettings) {
                      try {
                        const settings = JSON.parse(savedSettings);
                        autoGrade = settings.autoGrade || false;
                      } catch (e) {
                        console.error("Error parsing settings:", e);
                      }
                    }

                    // If auto-grade is enabled, don't show manual grading buttons
                    if (autoGrade) return null;

                    return (
                      <div className="flex gap-2 mt-4 border-t pt-4">
                        <div className="text-sm font-medium text-muted-foreground mb-2 mr-2">
                          Rate your answer:
                        </div>
                        <Button
                          variant="outline"
                          onClick={onCorrect}
                          className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Correct
                        </Button>
                        {onPartiallyCorrect && (
                          <Button
                            variant="outline"
                            onClick={onPartiallyCorrect}
                            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Partial
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={onWrong}
                          className="bg-red-100 hover:bg-red-200 text-red-800 border-red-300"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Incorrect
                        </Button>
                      </div>
                    );
                  })()}
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
              <div className="absolute -top-3 left-10 w-6 h-6 bg-muted/20 border-t-2 border-l-2 border-border transform rotate-45"></div>
              <div className="flex items-start gap-4">
                <div className="bg-muted p-2 rounded-full">
                  <Brain className="h-6 w-6 text-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-lg">AI Feedback</h4>
                    <div className="flex items-center text-lg font-bold">
                      <span className={getGradeTextColor(aiGrade.grade)}>
                        {aiGrade.grade}%
                      </span>
                      {aiGrade.grade >= 80 && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 ml-2 text-xs font-medium text-green-700">
                          Correct
                        </span>
                      )}
                      {aiGrade.grade >= 60 && aiGrade.grade < 80 && (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 ml-2 text-xs font-medium text-yellow-700">
                          Partially Correct
                        </span>
                      )}
                      {aiGrade.grade < 60 && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 ml-2 text-xs font-medium text-red-700">
                          Incorrect
                        </span>
                      )}
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

                  <div className="text-foreground mb-4">
                    <MarkdownContent content={aiGrade.response} />
                  </div>

                  {/* Ask ChatGPT Button */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
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
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center">
                        <p className="text-sm">Copies your question and answer to clipboard and opens ChatGPT</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => {
            resetGrading();
            onPrevious?.();
          }}
          className="flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            resetGrading();
            onNext?.();
          }}
          className={`flex items-center ${
            isFlipped && (isGraded || isGrading)
              ? "bg-blue-100 border-blue-300 text-blue-800 animate-pulse"
              : ""
          }`}
        >
          {isFlipped ? "Next" : "Skip"}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
