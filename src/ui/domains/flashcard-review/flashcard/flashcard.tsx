"use client";

import { useState, useEffect, useRef } from "react";
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
  Lightbulb,
  Mic,
  Square,
  Loader2,
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
import { scoreCard } from "@/api/cards/sorting";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Add type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare const SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

interface FlashcardProps {
  card: {
    id: string;
    front: string;
    back: string;
    ease?: number;
    review_count?: number;
    correct_count?: number;
    partial_correct_count?: number;
    incorrect_count?: number;
    last_reviewed?: Date | string | null;
  };
  onUpdate: (front: string, back: string) => void;
  onDelete: () => void;
  resetGradingOnCardChange?: boolean;
  onBacked?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onCorrect?: () => void;
  onPartiallyCorrect?: () => void;
  onWrong?: () => void;
  allCards?: Array<{
    id: string;
    front: string;
    ease: number;
    review_count: number;
    last_reviewed: Date | string | null;
  }>;
}

export const Flashcard = ({
  card,
  onUpdate,
  onDelete,
  resetGradingOnCardChange = true,
  onBacked,
  onPrevious,
  onNext,
  onCorrect,
  onPartiallyCorrect,
  onWrong,
  allCards,
}: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [userAnswer, setUserBack] = useState("");
  const [editingFront, setEditingFront] = useState(false);
  const [editingBack, setEditingBack] = useState(false);
  const [tempFront, setTempFront] = useState(card.front);
  const [tempBack, setTempBack] = useState(card.back);
  const [isGrading, setIsGrading] = useState(false);
  const [isGraded, setIsGraded] = useState(false);
  const [aiGrade, setAiGrade] = useState<{
    grade: number;
    response: string;
  } | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);

  // Audio recording states
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize audio recording
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    ) {
      setSpeechSupported(true);
    } else {
      setSpeechSupported(false);
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await transcribeAudio(audioBlob);

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsListening(true);

      toast.success("Recording...", {
        description: "Click again to stop and transcribe your speech.",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to start recording", {
        description: "Please allow microphone access and try again.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isListening) {
      mediaRecorder.stop();
      setIsListening(false);
      setIsProcessingSpeech(true);
      toast.success("Processing speech...");
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const result = await response.json();
      const transcribedText = result.text.trim();

      if (transcribedText) {
        setUserBack((prev) => {
          const newText = prev.trim() ? prev + " " : "";
          return newText + transcribedText;
        });
        toast.success("Speech converted to text");
      } else {
        toast.error("No speech detected", {
          description: "Please try speaking more clearly.",
        });
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
      toast.error("Failed to transcribe speech", {
        description: "Please try again or type your answer.",
      });
    } finally {
      setIsProcessingSpeech(false);
    }
  };

  const toggleRecording = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const resetGrading = () => {
    setIsGraded(false);
    setAiGrade(null);
    setIsGrading(false);
    setExplanation(null);
    // Stop recording when resetting grading
    if (isListening && mediaRecorder) {
      stopRecording();
    }
  };

  useEffect(() => {
    if (resetGradingOnCardChange) {
      resetGrading();
      setTempFront(card.front);
      setTempBack(card.back);
      setUserBack("");
    }
  }, [card.id, resetGradingOnCardChange]);

  useEffect(() => {
    if (!editingFront) {
      setTempFront(card.front);
    }
    if (!editingBack) {
      setTempBack(card.back);
    }
  }, [card.front, card.back, editingFront, editingBack]);

  // Cleanup effect for audio recording
  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);

  const getCardStats = () => {
    const easeFactor = card.ease ?? 2.5;
    const reviews = card.review_count ?? 0;
    const correct = card.correct_count ?? 0;
    const partial = card.partial_correct_count ?? 0;
    const incorrect = card.incorrect_count ?? 0;

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

    const savedSettings = localStorage.getItem(
      "flashcardswithaigrading-settings"
    );
    let autoGrade = false;
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        autoGrade = settings.autoGrade || false;
      } catch (e) {
        console.error("Error parsing settings:", e);
      }
    }

    if (!isFlipped && autoGrade && userAnswer.trim() && !isGraded) {
      await handleGradeWithAI();
    }

    if (!isFlipped && onBacked) {
      onBacked();
    }
  };

  const handleGradeWithAI = async () => {
    if (!userAnswer.trim()) {
      toast.error("Cannot grade empty answer", {
        description: "Please provide an answer before grading.",
      });
      return;
    }

    resetGrading();

    setIsGrading(true);

    const savedSettings = localStorage.getItem(
      "flashcardswithaigrading-settings"
    );
    let gradingDifficulty = 2;

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
          front: card.front,
          back: card.back,
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

      if (result.grade >= 80 && onCorrect) {
        await onCorrect();
      } else if (result.grade >= 60 && onPartiallyCorrect) {
        await onPartiallyCorrect();
      } else if (result.grade < 60 && onWrong) {
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

  const handleGetExplanation = async () => {
    if (explanation) {
      setExplanation(null);
      return;
    }
    setIsLoadingExplanation(true);
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          front: card.front,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get explanation");
      }

      const data = await response.json();
      setExplanation(data.explanation);
    } catch (error) {
      toast.error("Failed to get explanation");
      console.error(error);
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const startEditingFront = () => {
    setTempFront(card.front);
    setEditingFront(true);
  };

  const startEditingBack = () => {
    setTempBack(card.back);
    setEditingBack(true);
  };

  const startEditing = () => {
    if (isFlipped) {
      startEditingBack();
    } else {
      startEditingFront();
    }
  };

  const saveFront = () => {
    if (tempFront.trim()) {
      onUpdate(tempFront, card.back);
      setEditingFront(false);
    }
  };

  const saveBack = () => {
    if (tempBack.trim()) {
      onUpdate(card.front, tempBack);
      setEditingBack(false);
    }
  };

  const cancelEditingFront = () => {
    setEditingFront(false);
    setTempFront(card.front);
  };

  const cancelEditingBack = () => {
    setEditingBack(false);
    setTempBack(card.back);
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "bg-green-500";
    if (grade >= 80) return "bg-green-400";
    if (grade >= 70) return "bg-yellow-400";
    if (grade >= 60) return "bg-yellow-500";
    if (grade >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  const getGradeTextColor = (grade: number) => {
    if (grade >= 80) return "text-green-500";
    if (grade >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const copyFeedbackAndOpenChatGPT = () => {
    if (!aiGrade) return;

    const feedbackText = `This is the feedback I got for an AI graded flashcard answer

Front: ${card.front}
Correct Back: ${card.back}
Your Back: ${userAnswer || "(No answer provided)"}
AI Feedback: ${aiGrade.response}
Grade: ${aiGrade.grade}%

Can you help me understand this feedback better and suggest how I can improve my answer?`;

    navigator.clipboard
      .writeText(feedbackText)
      .then(() => {
        toast.success("Feedback copied to clipboard");
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
      <div className="flex justify-between mb-2">
        <div>
          {(() => {
            const savedSettings = localStorage.getItem(
              "flashcardswithaigrading-settings"
            );
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
                                Front
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {allCards.map((c, index) => {
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
                                    {c.front.length > 50
                                      ? c.front.substring(0, 50) + "..."
                                      : c.front}
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

                  <div className="text-muted-foreground">Correct Backs:</div>
                  <div>{cardStats.correct}</div>

                  <div className="text-muted-foreground">Partial Backs:</div>
                  <div>{cardStats.partial}</div>

                  <div className="text-muted-foreground">Incorrect Backs:</div>
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
            <span>{isFlipped ? "Back" : "Front"}</span>
          </div>

          {!isFlipped ? (
            <div className="mb-6">
              <div className="group relative">
                {editingFront ? (
                  <div className="space-y-2">
                    <div>
                      <Textarea
                        value={tempFront}
                        onChange={(e) => setTempFront(e.target.value)}
                        className="min-h-[150px] w-full"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveFront}>
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditingFront}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-lg font-medium mb-6 max-h-[500px] overflow-y-auto pr-1">
                    <MarkdownContent content={card.front} />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Textarea
                    placeholder={
                      isListening
                        ? "Recording... Click mic to stop"
                        : "Type your answer here..."
                    }
                    value={userAnswer}
                    onChange={(e) => setUserBack(e.target.value)}
                    className={`min-h-[150px] w-full pr-12 transition-colors ${
                      isListening || isProcessingSpeech
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={isListening || isProcessingSpeech}
                  />
                  {speechSupported && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={`absolute right-2 top-2 h-8 w-8 ${
                        isListening
                          ? "text-red-500 bg-red-50 hover:bg-red-100"
                          : isProcessingSpeech
                          ? "text-blue-500 bg-blue-50"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={toggleRecording}
                      disabled={isProcessingSpeech}
                    >
                      {isProcessingSpeech ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isListening ? (
                        <Square className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleFlip}>Flip</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="group relative">
                {editingBack ? (
                  <div className="space-y-2">
                    <div>
                      <Textarea
                        value={tempBack}
                        onChange={(e) => setTempBack(e.target.value)}
                        className="min-h-[150px] w-full"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveBack}>
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditingBack}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-lg font-medium mb-6 max-h-[500px] overflow-y-auto pr-1">
                    <MarkdownContent content={card.back} />
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="p-4 bg-muted/20 rounded-lg mb-4 max-h-[150px] overflow-y-auto">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Your Back:
                  </div>
                  <div>{userAnswer || "(No answer provided)"}</div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleFlip}>Back to Front</Button>
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

                {onCorrect &&
                  onWrong &&
                  !isGraded &&
                  !isGrading &&
                  (() => {
                    const savedSettings = localStorage.getItem(
                      "flashcardswithaigrading-settings"
                    );
                    let autoGrade = false;
                    if (savedSettings) {
                      try {
                        const settings = JSON.parse(savedSettings);
                        autoGrade = settings.autoGrade || false;
                      } catch (e) {
                        console.error("Error parsing settings:", e);
                      }
                    }

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

      <AnimatePresence>
        {isGraded && aiGrade && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-8"
          >
            <Card className="p-6 border border-border bg-white relative">
              <div className="absolute -top-3 left-10 w-6 h-6 bg-white border-t border-l-2 border-border transform rotate-45"></div>
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
                          Correct (+5% ease)
                        </span>
                      )}
                      {aiGrade.grade >= 60 && aiGrade.grade < 80 && (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 ml-2 text-xs font-medium text-yellow-700">
                          Partially Correct (-5% ease)
                        </span>
                      )}
                      {aiGrade.grade < 60 && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 ml-2 text-xs font-medium text-red-700">
                          Incorrect (-15% ease)
                        </span>
                      )}
                    </div>
                  </div>

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

                  <TooltipProvider>
                    <div className="flex items-center gap-2">
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
                          <p className="text-sm">
                            Copies your the card details and your answer to
                            clipboard and opens ChatGPT
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1.5 ml-2"
                            onClick={handleGetExplanation}
                            disabled={isLoadingExplanation}
                          >
                            {isLoadingExplanation ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                                className="mr-2"
                              >
                                <Brain className="h-3.5 w-3.5" />
                              </motion.div>
                            ) : (
                              <Lightbulb className="h-3.5 w-3.5" />
                            )}
                            <span>
                              {explanation ? "Hide" : "Full Explanation"}
                            </span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                          <p className="text-sm">
                            {explanation
                              ? "Hide the detailed explanation"
                              : "Get a detailed explanation of the concept"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

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
              ? "bg-blue-100 border-blue-300 text-blue-800"
              : ""
          }`}
        >
          {isFlipped ? "Next" : "Skip"}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <AnimatePresence>
        {explanation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="mt-8"
          >
            <Card className="p-6 border-2 border-border w-[150%] ml-[-25%] bg-white">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-muted p-2 rounded-full">
                      <Lightbulb className="h-6 w-6 text-foreground" />
                    </div>
                    <h4 className="font-semibold text-lg">
                      Detailed Explanation
                    </h4>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <MarkdownContent content={explanation} />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
