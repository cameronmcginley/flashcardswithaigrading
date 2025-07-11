import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Wand2, 
  Brain, 
  Lightbulb,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { UICategory } from "../types";

interface MagicDeckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (categoryId: string, deckName: string, prompt: string) => void;
  categories: UICategory[];
}

const DEFAULT_PROMPT = `Create educational flashcards for the topic: {topic}. Make them comprehensive and progressively challenging. Focus on key concepts, definitions, and practical applications.

Each flashcard should:
- Be phrased as a clear question with a specific answer
- Focus on practical knowledge and real-world application  
- Have an answer that fits in 1-2 sentences or a small code snippet
- Be technical and actionable, not just theoretical
- Be suitable for spaced repetition learning

Topic focus:
- Core concepts and best practices
- Recent developments and modern approaches
- Practical techniques and common scenarios
- Key principles and patterns
- Common pitfalls and solutions

Make the cards challenging enough to be valuable for learning but clear enough to have unambiguous answers.`;

const exampleTopics = [
  {
    topic: "React Hooks",
    description: "Modern React patterns",
    color: "from-blue-400 to-cyan-500",
    icon: "⚛️",
  },
  {
    topic: "Machine Learning",
    description: "AI & ML fundamentals",
    color: "from-purple-400 to-pink-500",
    icon: "🤖",
  },
  {
    topic: "Python Data Science",
    description: "Data analysis & visualization",
    color: "from-green-400 to-emerald-500",
    icon: "🐍",
  },
  {
    topic: "System Design",
    description: "Scalable architecture patterns",
    color: "from-orange-400 to-red-500",
    icon: "🏗️",
  },
  {
    topic: "Cybersecurity",
    description: "Security best practices",
    color: "from-red-400 to-rose-500",
    icon: "🔒",
  },
  {
    topic: "Cloud Computing",
    description: "AWS, Azure, GCP concepts",
    color: "from-indigo-400 to-purple-500",
    icon: "☁️",
  }
];

export const MagicDeckModal = ({
  open,
  onOpenChange,
  onGenerate,
  categories,
}: MagicDeckModalProps) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [deckName, setDeckName] = useState("");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [isLoading, setIsLoading] = useState(false);
  const [cardCount, setCardCount] = useState(10);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [showExamples, setShowExamples] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [generationResults, setGenerationResults] = useState<{
    cardCount: number;
    deckName: string;
    categoryName: string;
    generationTime: number;
    cards: {front: string; back: string}[];
  } | null>(null);

  const currentExample = exampleTopics[currentTopicIndex];

  // Reset form and set defaults when modal opens
  useEffect(() => {
    if (open) {
      const timestamp = new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
      setDeckName(`AI Deck ${timestamp}`);
      setSelectedCategoryId("");
      setPrompt(DEFAULT_PROMPT);
      setCardCount(10);
      setShowExamples(false);
      setShowResults(false);
      setGenerationResults(null);
    }
  }, [open]);

  const handleExampleClick = (topic: string, index: number) => {
    setCurrentTopicIndex(index);
    const customPrompt = DEFAULT_PROMPT.replace("{topic}", topic);
    setPrompt(customPrompt);
    setShowExamples(false); // Close the dropdown after selection
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategoryId && deckName.trim() && prompt.trim()) {
      setIsLoading(true);
      const startTime = Date.now();
      try {
        const response = await fetch("/api/generate-deck", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            categoryId: selectedCategoryId,
            deckName: deckName.trim(),
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to generate deck");
        }

        const result = await response.json();
        const generationTime = (Date.now() - startTime) / 1000;
        const selectedCategory = categories.find(c => c.id === selectedCategoryId);
        
        // Debug: log the actual API response
        console.log("API Response:", result);
        console.log("Cards data:", result.cards);
        
        // Handle different possible card formats
        let processedCards: {front: string; back: string}[] = [];
        if (result.cards && Array.isArray(result.cards)) {
          processedCards = result.cards.map((card: string | {front: string; back: string}, index: number) => {
            // If card is already an object with front/back
            if (typeof card === 'object' && card.front && card.back) {
              return { front: card.front, back: card.back };
            }
            // If card is a string, treat it as the front and generate a placeholder back
            if (typeof card === 'string') {
              return { front: card, back: `Answer for card ${index + 1}` };
            }
            // Fallback
            return { front: `Card ${index + 1}`, back: `Answer ${index + 1}` };
          });
        }
        
        // Set results data and show results view
        setGenerationResults({
          cardCount: result.cardCount || processedCards.length,
          deckName: deckName.trim(),
          categoryName: selectedCategory?.name || "Unknown Category",
          generationTime,
          cards: processedCards
        });
        setShowResults(true);
        
        // Don't call onGenerate here - wait for user to click "Start Studying"
        toast.success(
          `Deck generated successfully with ${result.cardCount} cards!`
        );
      } catch (error) {
        console.error("Error generating deck:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to generate deck. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Results view component
  const ResultsView = () => (
    <div className="space-y-6">
      <div className="text-center py-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <CheckCircle2 className="h-16 w-16 mx-auto text-emerald-500 mb-4" />
        </motion.div>
        <h3 className="text-xl font-semibold text-emerald-600 mb-2">
          Deck Generated Successfully!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {generationResults?.cardCount} flashcards created for deck: {generationResults?.deckName}
        </p>
      </div>

      {/* Generation Stats */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-emerald-600">{generationResults?.cardCount}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Cards Created</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-teal-600">{generationResults?.generationTime.toFixed(1)}s</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Generation Time</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            setShowResults(false);
            setGenerationResults(null);
          }}
        >
          Generate Another
        </Button>
        <Button
          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          onClick={() => {
            if (generationResults) {
              onGenerate(selectedCategoryId, generationResults.deckName, prompt);
            }
            onOpenChange(false);
          }}
        >
          Start Studying
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <div className="relative overflow-hidden">
          <DialogHeader className="relative">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Wand2 className="h-6 w-6 text-emerald-600" />
              {showResults ? "Generation Complete" : "AI Deck Generator"}
            </DialogTitle>
            <DialogDescription className="text-base">
              {showResults 
                ? `Successfully created ${generationResults?.cardCount} cards in "${generationResults?.categoryName}" category`
                : "Harness the power of AI to create intelligent flashcards tailored to your learning goals"
              }
            </DialogDescription>
          </DialogHeader>

          {showResults ? (
            <div className="py-6">
              <ResultsView />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 py-6 relative">
              {/* Quick Topic Examples Dropdown */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowExamples(!showExamples)}
                  disabled={isLoading}
                  className="w-full justify-between p-3 h-auto border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Browse quick topic examples</span>
                  </div>
                  {showExamples ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
                
                <AnimatePresence>
                  {showExamples && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {exampleTopics.map((example, index) => (
                          <motion.button
                            key={example.topic}
                            type="button"
                            onClick={() => handleExampleClick(example.topic, index)}
                            disabled={isLoading}
                            className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                              index === currentTopicIndex
                                ? 'bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800'
                                : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-transparent'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                              <span className="text-lg">{example.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{example.topic}</p>
                              <p className="text-xs text-gray-500 truncate">{example.description}</p>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* AI Prompt */}
              <div className="space-y-3">
                <label htmlFor="prompt" className="text-sm font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Customizable AI Prompt:
                </label>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm text-emerald-800 dark:text-emerald-200">
                    <strong>Fully Customizable:</strong> Write your own prompt for any topic, subject, or learning goal. 
                    Specify your own topics, difficulty levels, question types, or focus areas. The AI will adapt to your exact requirements.
                  </p>
                </div>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Write your custom prompt here... Be specific about the topic, difficulty, and type of cards you want."
                  className="h-48 text-sm"
                  disabled={isLoading}
                />
              </div>

              {/* Settings Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category
                  </label>
                  <Select
                    value={selectedCategoryId}
                    onValueChange={setSelectedCategoryId}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of Cards:</label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={cardCount}
                    onChange={(e) => setCardCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 10)))}
                    className="text-center"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="deckName" className="text-sm font-medium">
                  Deck Name
                </label>
                <Input
                  id="deckName"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  placeholder="Enter deck name"
                  disabled={isLoading}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !selectedCategoryId ||
                    !deckName.trim() ||
                    !prompt.trim() ||
                    isLoading
                  }
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 group px-6"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Brain className="h-4 w-4" />
                      </motion.div>
                      Generating Magic...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                      Generate {cardCount} Cards
                      <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Loading overlay */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center rounded-lg"
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
                    <Brain className="h-12 w-12 mx-auto text-emerald-500" />
                  </motion.div>
                  <p className="mt-4 font-medium text-lg">AI is working its magic...</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Creating {cardCount} cards for {currentExample.topic}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
