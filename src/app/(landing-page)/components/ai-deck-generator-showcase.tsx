"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Wand2, 
  Brain, 
  BookOpen,
  Zap,
  ArrowRight,
  Clock,
  CheckCircle2,
  Lightbulb,
  Target
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function AIDeckGeneratorShowcase() {
  const [currentTopic, setCurrentTopic] = useState("JavaScript Promises");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(true);
  const [generatedCards, setGeneratedCards] = useState<{front: string; back: string}[]>([
    { front: "What is a Promise in JavaScript?", back: "A Promise is an object representing the eventual completion or failure of an asynchronous operation, providing a cleaner alternative to callbacks." },
    { front: "What are the three states of a Promise?", back: "Pending (initial state), Fulfilled (operation completed successfully), and Rejected (operation failed)." },
    { front: "How do you handle Promise rejections?", back: "Use .catch() method or try/catch with async/await to handle rejected promises gracefully." },
    { front: "What is Promise.all() used for?", back: "Promise.all() runs multiple promises concurrently and resolves when all promises resolve, or rejects if any promise rejects." },
    { front: "Difference between Promise.all() and Promise.allSettled()?", back: "Promise.all() fails fast on first rejection, while Promise.allSettled() waits for all promises to settle (resolve or reject)." }
  ]);
  const [cardCount, setCardCount] = useState(5);
  const [currentExample, setCurrentExample] = useState(0);
  const [aiPrompt, setAiPrompt] = useState("Create educational flashcards for the topic: {topic}. Make them comprehensive and progressively challenging. Focus on key concepts, definitions, and practical applications.");
  const [targetCardCount, setTargetCardCount] = useState(5);

  const exampleTopics = [
    {
      topic: "JavaScript Promises",
      description: "Modern async programming concepts",
      color: "from-yellow-400 to-orange-500",
      icon: "⚡",
      cards: [
        { front: "What is a Promise in JavaScript?", back: "A Promise is an object representing the eventual completion or failure of an asynchronous operation, providing a cleaner alternative to callbacks." },
        { front: "What are the three states of a Promise?", back: "Pending (initial state), Fulfilled (operation completed successfully), and Rejected (operation failed)." },
        { front: "How do you handle Promise rejections?", back: "Use .catch() method or try/catch with async/await to handle rejected promises gracefully." },
        { front: "What is Promise.all() used for?", back: "Promise.all() runs multiple promises concurrently and resolves when all promises resolve, or rejects if any promise rejects." },
        { front: "Difference between Promise.all() and Promise.allSettled()?", back: "Promise.all() fails fast on first rejection, while Promise.allSettled() waits for all promises to settle (resolve or reject)." }
      ]
    },
    {
      topic: "Photosynthesis Biology",
      description: "Plant energy conversion process",
      color: "from-green-400 to-emerald-500",
      icon: "🌱",
      cards: [
        { front: "What is photosynthesis?", back: "The process by which plants convert light energy, carbon dioxide, and water into glucose and oxygen using chlorophyll." },
        { front: "Where does photosynthesis occur in plant cells?", back: "In the chloroplasts, specifically in the thylakoid membranes and stroma." },
        { front: "What are the two main stages of photosynthesis?", back: "Light-dependent reactions (photo stage) and light-independent reactions (Calvin cycle)." },
        { front: "What is the chemical equation for photosynthesis?", back: "6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂" },
        { front: "What factors affect the rate of photosynthesis?", back: "Light intensity, carbon dioxide concentration, temperature, and chlorophyll availability." }
      ]
    },
    {
      topic: "World War II History",
      description: "Major events and timeline",
      color: "from-red-400 to-rose-500", 
      icon: "🌍",
      cards: [
        { front: "When did World War II officially begin and end?", back: "September 1, 1939 (Germany invades Poland) to September 2, 1945 (Japan surrenders)." },
        { front: "What was Operation Barbarossa?", back: "Nazi Germany's invasion of the Soviet Union on June 22, 1941, the largest military operation in history." },
        { front: "What happened on D-Day?", back: "June 6, 1944: Allied forces launched Operation Overlord, the massive invasion of Nazi-occupied Western Europe at Normandy beaches." },
        { front: "What were the main Axis powers?", back: "Germany, Italy, and Japan formed the primary Axis alliance during World War II." },
        { front: "What was the Holocaust?", back: "The systematic persecution and murder of six million Jews and millions of others by Nazi Germany and collaborators." }
      ]
    }
  ];

  const handleGenerate = async (topic: string) => {
    setCurrentTopic(topic);
    setIsGenerating(true);
    setIsComplete(false);
    setGeneratedCards([]);
    setCardCount(0);

    const exampleData = exampleTopics.find(ex => ex.topic === topic) || exampleTopics[currentExample];
    const cardsToGenerate = Math.min(targetCardCount, exampleData.cards.length);
    
    // Simulate AI generation with progress
    for (let i = 0; i < cardsToGenerate; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setCardCount(i + 1);
      setGeneratedCards(prev => [...prev, exampleData.cards[i]]);
    }

    setTimeout(() => {
      setIsGenerating(false);
      setIsComplete(true);
    }, 500);
  };

  const handleExampleClick = (topic: string, index: number) => {
    // Update the current example and topic when user clicks
    setCurrentExample(index);
    setCurrentTopic(topic);
  };

  const currentExampleData = exampleTopics[currentExample];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Input Section */}
        <Card className="relative overflow-hidden border-2 bg-white dark:bg-gray-800 min-h-[600px]">
          <div className={`absolute inset-0 bg-gradient-to-br ${currentExampleData.color} opacity-5`} />
          
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              AI Deck Generator
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Customize your AI prompt and generate the perfect number of cards
            </p>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-6">
              {/* Topic Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Topic:</label>
                <div className="relative">
                  <Input
                    value={currentTopic || currentExampleData.topic}
                    onChange={(e) => setCurrentTopic(e.target.value)}
                    placeholder="e.g., React Hooks, Quantum Physics, French Revolution..."
                    className="pr-12"
                    disabled={isGenerating}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl">
                    {currentExampleData.icon}
                  </div>
                </div>
              </div>

              {/* AI Prompt Customization */}
              <div className="space-y-2">
                <label className="text-sm font-medium">AI Prompt:</label>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Customize how AI generates your flashcards..."
                  className="h-20 text-sm"
                  disabled={isGenerating}
                />
                <p className="text-xs text-gray-500">
                  Use {"{topic}"} as a placeholder for your topic
                </p>
              </div>

              {/* Card Count Setting */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of Cards:</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={targetCardCount}
                    onChange={(e) => setTargetCardCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    className="text-center"
                    disabled={isGenerating}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty:</label>
                  <select 
                    className="w-full p-2 border rounded-md dark:bg-gray-800 text-sm"
                    disabled={isGenerating}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>Mixed</option>
                  </select>
                </div>
              </div>

              {/* Example Topics */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Quick examples:</p>
                <div className="grid gap-2">
                  {exampleTopics.map((example, index) => (
                    <motion.button
                      key={example.topic}
                      onClick={() => handleExampleClick(example.topic, index)}
                      disabled={isGenerating}
                      className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                        index === currentExample
                          ? 'bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800'
                          : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-transparent'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                        <span className="text-lg">{example.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{example.topic}</p>
                        <p className="text-xs text-gray-500">{example.description}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                onClick={() => handleGenerate(currentTopic || currentExampleData.topic)}
                disabled={isGenerating}
                className="w-full group"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Brain className="h-4 w-4" />
                    </motion.div>
                    Generating {targetCardCount} Cards... ({cardCount}/{targetCardCount})
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                    Generate {targetCardCount} Cards
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              {/* AI Features */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-900 dark:text-purple-100 text-sm">
                    AI Magic Features
                  </span>
                </div>
                <ul className="text-xs text-purple-800 dark:text-purple-200 space-y-1">
                  <li>• Automatically structures learning material</li>
                  <li>• Creates progressive difficulty levels</li>
                  <li>• Generates comprehensive coverage</li>
                  <li>• Adapts to any subject or complexity</li>
                </ul>
              </div>
            </div>
          </CardContent>

          {/* Loading overlay */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Brain className="h-8 w-8 mx-auto text-purple-500" />
                  </motion.div>
                  <p className="mt-2 font-medium">AI is thinking...</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Creating {targetCardCount} cards for {currentTopic || currentExampleData.topic}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Generated Deck Preview */}
        <Card className="border-2 bg-white dark:bg-gray-800 h-full flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-500" />
              Generated Flashcards
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Watch AI create intelligent flashcards in real-time
            </p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 min-h-[400px] flex flex-col">
              <AnimatePresence mode="wait">
                {!isGenerating && generatedCards.length === 0 && !isComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center py-12 text-gray-500 flex-1 flex flex-col justify-center"
                  >
                    <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Ready to generate your first AI deck...</p>
                    <p className="text-sm mt-2">Choose a topic and watch the magic happen!</p>
                  </motion.div>
                )}

                {isComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                    >
                      <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-green-600 mb-2">
                      Deck Generated Successfully! ✨
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {cardCount} intelligent flashcards created for {currentTopic || currentExampleData.topic}
                    </p>
                    <div className="flex justify-center gap-2 mt-4">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <Target className="h-3 w-3 mr-1" />
                        Perfectly Structured
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Ready in Seconds
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        <Zap className="h-3 w-3 mr-1" />
                        AI Powered
                      </Badge>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generated Cards Display */}
              <div className="space-y-3 h-[550px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {generatedCards.map((card, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 50, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-700 dark:text-blue-300 text-xs font-medium">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm mb-2 leading-relaxed">
                          {card.front}
                        </p>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium text-gray-800 dark:text-gray-200">Answer: </span>
                          {card.back}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Progress indicator during generation */}
              {isGenerating && (
                <div className="mt-6 flex-shrink-0">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Generating cards...</span>
                    <span>{cardCount}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full bg-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(cardCount / 5) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 