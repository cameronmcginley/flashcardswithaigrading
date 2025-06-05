"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Copy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function FlashcardDemo() {
  const [currentTab, setCurrentTab] = useState("back");
  const gradeScore = 65;

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
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
    const front = "What is tail call optimization?";
    const correctBack =
      "When the final action of a function is a recursive call and can reuse stack frame";
    const userBack = "Recursion that stops early";
    const aiFeedback =
      "Partially correct. You're on the right track, but it specifically refers to reusing the call frame. Tail call optimization is a compiler technique where a function call in tail position doesn't need to allocate a new stack frame, instead reusing the current one. This prevents stack overflow in deeply recursive functions.";

    const feedbackText = `This is the feedback I got for an AI graded flashcard answer

Front: ${front}
Correct Back: ${correctBack}
Your Back: ${userBack}
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
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="relative">
        <Card className="p-8 md:p-10 shadow-lg border-2 bg-white dark:bg-gray-800 min-h-[300px] flex flex-col">
          <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="front">Front</TabsTrigger>
              <TabsTrigger value="back">Back</TabsTrigger>
            </TabsList>

            <TabsContent value="front" className="mt-0">
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-6">
                  What is tail call optimization?
                </h3>
                <Button
                  onClick={() => setCurrentTab("back")}
                  className="mt-4"
                  variant="outline"
                >
                  Show Back
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="back" className="mt-0">
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Your Answer:
                  </h4>
                  <p className="text-lg">&quot;Recursion that stops early&quot;</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Correct Answer:
                  </h4>
                  <p className="text-lg">
                    &quot;When the final action of a function is a recursive call
                    and can reuse stack frame&quot;
                  </p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      AI Graded: {gradeScore}%
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* AI Feedback - Always Visible */}
      <Card className="p-6 border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-start gap-4">
          <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full flex-shrink-0">
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
              <div
                className={cn(
                  "h-full rounded-full",
                  getGradeColor(gradeScore)
                )}
                style={{ width: `${gradeScore}%` }}
              />
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Partially correct. You&apos;re on the right track, but it
              specifically refers to reusing the call frame. Tail call
              optimization is a compiler technique where a function call
              in tail position doesn&apos;t need to allocate a new stack frame,
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
                  <p className="text-sm">Copies your front and answer to clipboard and opens ChatGPT</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </Card>
    </div>
  );
}
