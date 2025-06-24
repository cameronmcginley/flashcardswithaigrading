import { Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MarkdownContent } from "@/components/markdown-content";

const FlashcardDemo = () => {
  const aiGrade = {
    grade: 90,
    response:
      "**Excellent understanding!** You correctly identified the quadratic formula and its components. Your explanation of the discriminant's role is spot-on. Minor note: you could mention that when b² - 4ac < 0, the solutions are complex numbers.",
  };

  const questionContent = `Explain the **quadratic formula** and what the discriminant tells us about the solutions.

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$`;

  const answerContent = `The quadratic formula solves equations of the form \`ax² + bx + c = 0\`.

The **discriminant** is \`b² - 4ac\`:

- If discriminant > 0: two real solutions
- If discriminant = 0: one real solution  
- If discriminant < 0: no real solutions`;

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "bg-green-500";
    if (grade >= 80) return "bg-green-400";
    if (grade >= 70) return "bg-yellow-400";
    if (grade >= 60) return "bg-yellow-500";
    if (grade >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  const getGradeTextColor = (grade: number) => {
    if (grade >= 80) return "text-green-600";
    if (grade >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main Card */}
      <Card className="w-full shadow-lg">
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Question:
            </h3>
            <div className="text-gray-800">
              <MarkdownContent content={questionContent} />
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Your Answer:
            </h3>
            <div className="text-gray-800 text-sm">
              <MarkdownContent content={answerContent} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Feedback Bubble */}
      <div className="mt-8">
        <Card className="p-6 border border-slate-200 bg-white relative shadow-lg">
          <div className="absolute -top-3 left-10 w-6 h-6 bg-white border-t border-l border-slate-200 transform rotate-45"></div>
          <div className="flex items-start gap-4">
            <div className="bg-slate-100 p-2 rounded-full">
              <Brain className="h-6 w-6 text-gray-700" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-lg text-gray-900">
                  AI Feedback
                </h4>
                <div className="flex items-center text-lg font-bold">
                  <span className={getGradeTextColor(aiGrade.grade)}>
                    {aiGrade.grade}%
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 ml-2 text-xs font-medium text-green-700">
                    Correct (+5% ease)
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full mb-4 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    getGradeColor(aiGrade.grade)
                  )}
                  style={{ width: `${aiGrade.grade}%` }}
                />
              </div>

              <div className="text-gray-700">
                <MarkdownContent content={aiGrade.response} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FlashcardDemo;
