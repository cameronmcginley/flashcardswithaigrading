"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Timer, 
  TrendingUp, 
  RotateCcw,
  Calendar,
  Target,
  Zap,
  Clock,
  CheckCircle2
} from "lucide-react";

export default function AlgorithmShowcase() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const algorithmSteps = [
    {
      id: "initial",
      title: "New Card",
      description: "Fresh card starts with default ease factor of 2.5",
      ease: 2.5,
      lastReviewed: "Never",
      aiScore: null,
      queuePosition: "Top of Queue",
      priority: "High",
      color: "bg-blue-500"
    },
    {
      id: "first-review",
      title: "First AI Review - 92%",
      description: "AI grades answer at 92% - excellent performance increases ease",
      ease: 2.7,
      lastReviewed: "Just now",
      aiScore: 92,
      queuePosition: "Back of Queue",
      priority: "Low",
      color: "bg-green-500"
    },
    {
      id: "second-review",
      title: "Second Review - 78%",
      description: "AI grades at 78% - good but not perfect, ease adjusts down slightly",
      ease: 2.6,
      lastReviewed: "3 days ago",
      aiScore: 78,
      queuePosition: "Middle Queue",
      priority: "Medium",
      color: "bg-yellow-500"
    },
    {
      id: "third-review-struggle",
      title: "Struggle - 45%",
      description: "AI detects poor understanding at 45% - ease drops significantly",
      ease: 2.1,
      lastReviewed: "7 days ago",
      aiScore: 45,
      queuePosition: "Front of Queue",
      priority: "High",
      color: "bg-orange-500"
    },
    {
      id: "recovery",
      title: "Recovery - 88%",
      description: "Strong recovery at 88% - ease increases, longer interval",
      ease: 2.4,
      lastReviewed: "Just now",
      aiScore: 88,
      queuePosition: "Back of Queue",
      priority: "Low",
      color: "bg-emerald-500"
    }
  ];

  const getScoreColor = (score: number | null) => {
    if (score === null) return "bg-gray-400";
    if (score >= 90) return "bg-green-400";
    if (score >= 80) return "bg-green-300";
    if (score >= 70) return "bg-yellow-300";
    if (score >= 60) return "bg-yellow-400";
    if (score >= 50) return "bg-orange-400";
    return "bg-red-400";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-700 bg-red-50 border-red-200";
      case "Medium": return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "Low": return "text-green-700 bg-green-50 border-green-200";
      default: return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  // Auto-advance through steps
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % algorithmSteps.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const currentStepData = algorithmSteps[currentStep];

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    setIsAnimating(false);
  };

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setIsAnimating(true);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Algorithm Visualization */}
        <div className="lg:col-span-2">
          <Card className="border-2 bg-white dark:bg-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Spaced Repetition Algorithm
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleAnimation}
                  >
                    {isAnimating ? "⏸ Pause" : "▶ Play"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetDemo}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Watch how the algorithm adapts to your performance
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Step Progress */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {algorithmSteps.map((step, index) => (
                    <motion.button
                      key={step.id}
                      onClick={() => handleStepClick(index)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                        index === currentStep
                          ? `bg-blue-100 text-blue-800 border-2 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800`
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-transparent'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        index === currentStep ? 'bg-blue-500' : 'bg-gray-400'
                      }`} />
                      Step {index + 1}
                      {index < currentStep && (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Current Step Display */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className={`p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 min-h-[120px] flex flex-col justify-center`}>
                      <h3 className="text-lg font-semibold mb-2">{currentStepData.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {currentStepData.description}
                      </p>
                      
                      {currentStepData.aiScore !== null && (
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-sm font-medium">AI Score:</span>
                          <Badge className={`${getScoreColor(currentStepData.aiScore)} text-white border-0`}>
                            {currentStepData.aiScore}%
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Algorithm Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {currentStepData.ease.toFixed(1)}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Ease Factor</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-lg font-bold text-green-600">
                          {currentStepData.lastReviewed}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Last Reviewed</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">
                          {currentStepData.queuePosition}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Queue Position</p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Sorting Logic - Static */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      Sorting Formula
                    </span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-mono text-xs">
                    ease × time
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Algorithm Details */}
        <Card className="border-2 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Smart Scheduling</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Cards appear right before you&apos;re about to forget them
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Adaptive Difficulty</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Ease factor adjusts based on your performance
                  </p>
                </div>
              </div>

              <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h4 className="font-medium text-sm mb-2">AI Score Impact:</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="font-medium">90-100%: Ease increases significantly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="font-medium">80-89%: Ease increases moderately</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="font-medium">70-79%: Ease adjusts slightly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="font-medium">50-69%: Ease decreases</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="font-medium">&lt;50%: Ease drops significantly</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-900 dark:text-purple-100 text-sm">
                    Smart & Simple
                  </span>
                </div>
                <p className="text-xs text-purple-800 dark:text-purple-200">
                  Unlike traditional spaced repetition, our algorithm directly uses AI grading percentages 
                  for more nuanced ease factor adjustment and intelligent scheduling.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 