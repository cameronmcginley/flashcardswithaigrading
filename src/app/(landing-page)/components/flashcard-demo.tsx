"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  RotateCcw,
  ArrowRight,
  Copy,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MarkdownContent } from "@/components/markdown-content";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function FlashcardDemo() {
  const [currentExample, setCurrentExample] = useState(0);
  const [isGrading, setIsGrading] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [userAnswer, setUserAnswer] = useState("");
  const [isInteractive, setIsInteractive] = useState(false);

  const examples = [
    {
      id: 1,
      category: "Programming",
      front: "What is tail call optimization?",
      correctAnswer: "When the final action of a function is a recursive call and can reuse stack frame",
      userAnswer: "Recursion that stops early",
      grade: 65,
      feedback: "Partially correct. You're on the right track, but it specifically refers to reusing the call frame. Tail call optimization is a compiler technique where a function call in tail position doesn't need to allocate a new stack frame, instead reusing the current one. This prevents stack overflow in deeply recursive functions.",
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: 2,
      category: "Mathematics",
      front: "Explain the fundamental theorem of calculus",
      correctAnswer: "It connects differentiation and integration, stating that differentiation and integration are inverse operations",
      userAnswer: "Integration and derivatives are related somehow",
      grade: 45,
      feedback: "Your answer shows basic understanding but lacks specificity. The Fundamental Theorem of Calculus has two parts: (1) If f is continuous on [a,b], then the function F(x) = ∫[a to x] f(t)dt is differentiable and F'(x) = f(x). (2) If f is continuous on [a,b] and F is an antiderivative of f, then ∫[a to b] f(x)dx = F(b) - F(a).",
      color: "from-green-500 to-emerald-600"
    },
    {
      id: 3,
      category: "Science",
      front: "What causes the greenhouse effect?",
      correctAnswer: "Certain gases in the atmosphere trap heat by absorbing and re-emitting infrared radiation",
      userAnswer: "Greenhouse gases trap heat from the sun in the atmosphere",
      grade: 85,
      feedback: "Excellent answer! You correctly identified greenhouse gases as the cause and their heat-trapping mechanism. To make it even more precise, you could mention that they specifically absorb and re-emit infrared radiation (heat energy) rather than visible light from the sun.",
      color: "from-emerald-500 to-teal-600"
    }
  ];

  const currentCard = examples[currentExample];

  const handleGradeSubmission = async () => {
    if (!userAnswer.trim()) return;
    
    setIsGrading(true);
    setShowResults(false);
    
    // Simulate AI grading process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGrading(false);
    setShowResults(true);
  };

  const handleNextExample = () => {
    setCurrentExample((prev) => (prev + 1) % examples.length);
    setUserAnswer("");
    setShowResults(true);
    setIsInteractive(false);
  };

  const handleTryInteractive = () => {
    setIsInteractive(true);
    setUserAnswer("");
    setShowResults(false);
  };

  const copyFeedbackAndOpenChatGPT = () => {
    const card = isInteractive ? { ...currentCard, userAnswer } : currentCard;
    const feedbackText = `This is the feedback I got for an AI graded flashcard answer

Front: ${card.front}
Correct Answer: ${card.correctAnswer}
Your Answer: ${card.userAnswer}
AI Feedback: ${card.feedback}
Grade: ${card.grade}%

Can you help me understand this feedback better and suggest how I can improve my answer?`;

    navigator.clipboard.writeText(feedbackText)
      .then(() => {
        toast.success("Feedback copied to clipboard");
        window.open("https://chat.openai.com", "_blank");
      })
      .catch(() => {
        toast.error("Failed to copy feedback");
      });
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Main Flashcard */}
      <Card className="relative overflow-hidden border-2 bg-white dark:bg-gray-800">
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={`bg-gradient-to-r ${currentCard.color} text-white`}>
                {currentCard.category}
              </Badge>
              <span className="text-sm text-gray-500">
                Example {currentExample + 1} of {examples.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextExample}
              className="text-xs"
            >
              Next Example <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="relative">
          <div className="space-y-6">
            <div className="text-sm font-medium text-muted-foreground mb-4">
              Front
            </div>
            
            {/* Question */}
            <div className="text-lg font-medium mb-6">
              <MarkdownContent content={currentCard.front} />
            </div>

            {/* Answer Input Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">
                  Your Answer:
                </div>
                {!isInteractive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTryInteractive}
                    className="text-xs"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Try Yourself
                  </Button>
                )}
              </div>

              {isInteractive ? (
                <div className="space-y-3">
                  <Textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="min-h-[100px]"
                    disabled={isGrading}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleGradeSubmission}
                      disabled={!userAnswer.trim() || isGrading}
                      variant="outline"
                    >
                      {isGrading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="mr-2"
                          >
                            <Brain className="h-4 w-4" />
                          </motion.div>
                          AI is grading...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-1" />
                          Grade with AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div>{currentCard.userAnswer}</div>
                </div>
              )}
            </div>

            {/* Correct Answer */}
            <div className="mt-6 p-4 bg-muted/20 rounded-lg">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Correct Answer:
              </div>
              <div className="text-lg font-medium">
                <MarkdownContent content={currentCard.correctAnswer} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Feedback Bubble - Matches real flashcard.tsx style */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-8"
          >
            <Card className="p-6 border-2 border-border bg-muted/20 relative">
              {/* Speech bubble arrow */}
              <div className="absolute -top-3 left-10 w-6 h-6 bg-muted/20 border-t-2 border-l-2 border-border transform rotate-45"></div>
              
              <div className="flex items-start gap-4">
                <div className="bg-muted p-2 rounded-full">
                  <Brain className="h-6 w-6 text-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-lg">AI Feedback</h4>
                    <div className="flex items-center text-lg font-bold">
                      <span className={getGradeTextColor(currentCard.grade)}>
                        {currentCard.grade}%
                      </span>
                      {currentCard.grade >= 80 && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 ml-2 text-xs font-medium text-green-700">
                          Correct
                        </span>
                      )}
                      {currentCard.grade >= 60 && currentCard.grade < 80 && (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 ml-2 text-xs font-medium text-yellow-700">
                          Partially Correct
                        </span>
                      )}
                      {currentCard.grade < 60 && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 ml-2 text-xs font-medium text-red-700">
                          Incorrect
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar - exactly like real flashcard */}
                  <div className="w-full h-2 bg-muted rounded-full mb-4 overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        getGradeColor(currentCard.grade)
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${currentCard.grade}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>

                  <div className="text-foreground mb-4">
                    <MarkdownContent content={currentCard.feedback} />
                  </div>

                  {/* Ask ChatGPT Button - exactly like real flashcard */}
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
                        <p className="text-sm">Copies your front and answer to clipboard and opens ChatGPT</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation dots */}
      <div className="flex justify-center gap-2 mt-6">
        {examples.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentExample(index);
              setShowResults(true);
              setIsInteractive(false);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentExample
                ? 'bg-blue-500 w-6'
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
