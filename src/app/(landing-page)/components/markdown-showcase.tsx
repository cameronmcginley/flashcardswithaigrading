"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import { 
  Code2, 
  FileText, 
  Palette, 
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import "katex/dist/katex.min.css";

export default function MarkdownShowcase() {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const markdownCards = [
    {
      id: 1,
      category: "Code",
      front: "**Algorithm Question**: Implement Binary Search\n\n```javascript\n// Your implementation here\nfunction binarySearch(arr, target) {\n  // TODO: Implement\n}\n```\n\n> *Hint: Think about divide and conquer*",
      back: "```javascript\nfunction binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  \n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    \n    if (arr[mid] === target) {\n      return mid;\n    } else if (arr[mid] < target) {\n      left = mid + 1;\n    } else {\n      right = mid - 1;\n    }\n  }\n  \n  return -1;\n}\n```\n\n**Time Complexity**: O(log n)  \n**Space Complexity**: O(1)",
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: 2,
      category: "Math",
      front: "## Derivative Rules\n\nWhat is the derivative of:\n\n$$f(x) = x^3 + 2x^2 - 5x + 1$$\n\n---\n\n*Use the **power rule** and **sum rule***",
      back: "Using the power rule $(x^n)' = nx^{n-1}$:\n\n$$f'(x) = 3x^2 + 4x - 5$$\n\n### Step by step:\n1. $(x^3)' = 3x^2$\n2. $(2x^2)' = 4x$  \n3. $(-5x)' = -5$\n4. $(1)' = 0$\n\n> **Remember**: The derivative of a constant is always 0!",
      color: "from-green-500 to-emerald-600"
    },
    {
      id: 3,
      category: "Science",
      front: "# Photosynthesis Overview\n\n**Question**: What are the main inputs and outputs?\n\n- Light energy from ___?\n- Raw materials: ___?\n- Products: ___?",
      back: "## Photosynthesis Equation\n\n```\n6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂\n```\n\n### Inputs:\n- **Light energy** from the **sun** ☀️\n- **Carbon dioxide** (CO₂) from air\n- **Water** (H₂O) from roots\n\n### Outputs:\n- **Glucose** (C₆H₁₂O₆) - food/energy\n- **Oxygen** (O₂) - released to atmosphere\n\n> 🌱 This process occurs in the **chloroplasts** of plant cells!",
      color: "from-emerald-500 to-teal-600"
    }
  ];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCard((prev) => (prev + 1) % markdownCards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCard((prev) => (prev - 1 + markdownCards.length) % markdownCards.length);
    }, 150);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const currentCardData = markdownCards[currentCard];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid lg:grid-cols-5 gap-6 items-start">
        {/* Card Preview */}
        <div className="lg:col-span-3">
          <Card className="relative overflow-hidden border-2 bg-white dark:bg-gray-800 min-h-[400px]">
            <div className={`absolute inset-0 bg-gradient-to-br ${currentCardData.color} opacity-5`} />
            
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={`bg-gradient-to-r ${currentCardData.color} text-white`}>
                    {currentCardData.category}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Card {currentCard + 1} of {markdownCards.length}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentCard}-${isFlipped ? 'back' : 'front'}`}
                  initial={{ opacity: 0, rotateY: isFlipped ? -90 : 90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: isFlipped ? 90 : -90 }}
                  transition={{ duration: 0.3 }}
                  className="h-[320px] flex flex-col"
                >
                  <div className="mb-4 flex-shrink-0">
                    <Badge variant="secondary" className="text-xs">
                      {isFlipped ? "Back (Answer)" : "Front (Question)"}
                    </Badge>
                  </div>
                  
                  <div className="prose prose-sm dark:prose-invert max-w-none flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeHighlight, rehypeKatex]}
                    >
                      {isFlipped ? currentCardData.back : currentCardData.front}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between mt-6 flex-shrink-0">
                <Button variant="outline" onClick={handlePrev} size="sm">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <Button onClick={handleFlip} className="group">
                  <RotateCcw className="h-4 w-4 mr-2 transition-transform group-hover:rotate-180" />
                  {isFlipped ? "Show Question" : "Show Answer"}
                </Button>

                <Button variant="outline" onClick={handleNext} size="sm">
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features List */}
        <div className="lg:col-span-2">
          <Card className="border-2 bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Markdown Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Code2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Syntax Highlighting</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Support for JavaScript, Python, SQL, and 100+ languages
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Palette className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Rich Formatting</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      **Bold**, *italic*, headers, lists, and blockquotes
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-blue-500 mt-0.5 font-bold text-lg flex-shrink-0">∑</span>
                  <div>
                    <p className="font-medium text-sm">Math Equations</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      LaTeX support for complex mathematical expressions
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Markdown Editor Preview:
                  </p>
                  <div className="font-mono text-xs bg-white dark:bg-gray-800 p-2 rounded border">
                    ```javascript<br/>
                    const answer = 42;<br/>
                    ```<br/><br/>
                    **Note**: This is **bold**
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center gap-2 mt-6">
        {markdownCards.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentCard(index);
              setIsFlipped(false);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentCard
                ? 'bg-blue-500 w-6'
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
} 