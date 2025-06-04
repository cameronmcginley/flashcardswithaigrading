"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Copy, ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function FlashcardDemo() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGraded, setIsGraded] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [currentTab, setCurrentTab] = useState("question");
  const [gradeScore, setGradeScore] = useState(65);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      setCurrentTab("answer");
    } else {
      setCurrentTab("question");
    }
  };

  const handleGrade = () => {
    // Reset first
    setIsGraded(false);

    // Then start grading
    setIsGrading(true);

    // Simulate AI grading delay
    setTimeout(() => {
      setIsGraded(true);
      setIsGrading(false);
    }, 1500);
  };

  const resetDemo = () => {
    setIsFlipped(false);
    setIsGraded(false);
    setCurrentTab("question");
  };

  const closeGrading = () => {
    setIsGraded(false);
  };

  // Auto-play the demo after a delay
  useEffect(() => {
    const demoTimeout = setTimeout(() => {
      handleFlip();

      const gradeTimeout = setTimeout(() => {
        handleGrade();
      }, 2000);

      return () => clearTimeout(gradeTimeout);
    }, 3000);

    return () => clearTimeout(demoTimeout);
  }, []);

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
    const question = "What is tail call optimization?";
    const correctAnswer =
      "When the final action of a function is a recursive call and can reuse stack frame";
    const userAnswer = "Recursion that stops early";
    const aiFeedback =
      "Partially correct. You're on the right track, but it specifically refers to reusing the call frame. Tail call optimization is a compiler technique where a function call in tail position doesn't need to allocate a new stack frame, instead reusing the current one. This prevents stack overflow in deeply recursive functions.";

    const feedbackText = `This is the feedback I got for an AI graded flashcard answer

Question: ${question}
Correct Answer: ${correctAnswer}
Your Answer: ${userAnswer}
AI Feedback: ${aiFeedback}
Grade: ${gradeScore}%

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
    <div className="max-w-3xl mx-auto">
      <div className="relative perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={isFlipped ? "back" : "front"}
            initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full"
          >
            <Card className="p-8 md:p-10 shadow-lg border-2 bg-white dark:bg-gray-800 min-h-[300px] flex flex-col">
              <Tabs value={currentTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger
                    value="question"
                    onClick={() => setCurrentTab("question")}
                  >
                    Question
                  </TabsTrigger>
                  <TabsTrigger
                    value="answer"
                    onClick={() => setCurrentTab("answer")}
                  >
                    Answer
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="question" className="mt-0">
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold mb-6">
                      What is tail call optimization?
                    </h3>
                    <Button
                      onClick={handleFlip}
                      className="mt-4"
                      variant="outline"
                    >
                      Show Answer
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="answer" className="mt-0">
                  <div className="space-y-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Your Answer:
                      </h4>
                      <p className="text-lg">"Recursion that stops early"</p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Correct Answer:
                      </h4>
                      <p className="text-lg">
                        "When the final action of a function is a recursive call
                        and can reuse stack frame"
                      </p>
                    </div>

                    <div className="flex justify-center mt-6">
                      {!isGraded ? (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={handleGrade}
                            className="relative group"
                            disabled={isGrading}
                          >
                            <span className="flex items-center">
                              <Brain className="mr-2 h-4 w-4" />
                              Grade with AI
                            </span>

                            {/* Magnifying glass effect */}
                            <span className="absolute inset-0 rounded-md bg-white dark:bg-gray-800 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>

                            {isGrading && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
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
                        </motion.div>
                      ) : (
                        <Button onClick={resetDemo} variant="outline">
                          Reset Demo
                        </Button>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* AI Feedback Bubble */}
      <AnimatePresence>
        {isGraded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-8"
          >
            <Card className="p-6 border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 relative">
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-6 w-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={closeGrading}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="absolute -top-3 left-10 w-6 h-6 bg-gray-50 dark:bg-gray-800 border-t-2 border-l-2 border-gray-200 dark:border-gray-700 transform rotate-45"></div>
              <div className="flex items-start gap-4">
                <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full">
                  <Brain className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-lg">AI Feedback</h4>
                    <div className="text-lg font-bold">
                      <span className={getGradeTextColor(gradeScore)}>
                        {gradeScore}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        getGradeColor(gradeScore)
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${gradeScore}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Partially correct. You're on the right track, but it
                    specifically refers to reusing the call frame. Tail call
                    optimization is a compiler technique where a function call
                    in tail position doesn't need to allocate a new stack frame,
                    instead reusing the current one. This prevents stack
                    overflow in deeply recursive functions.
                  </p>

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
    </div>
  );
}
