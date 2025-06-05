"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  FileText, 
  Plus, 
  CheckCircle2, 
  Copy,
  Database,
  Zap,
  ArrowRight
} from "lucide-react";

export default function BulkImportShowcase() {
  const [activeTab, setActiveTab] = useState("json");
  const [isImporting, setIsImporting] = useState(false);

  const jsonExample = `[
  {
    "front": "What is React Fiber?",
    "back": "React's reconciliation algorithm that enables concurrent rendering and better performance through work splitting."
  },
  {
    "front": "Explain useCallback hook",
    "back": "A React hook that returns a memoized callback function, preventing unnecessary re-renders of child components."
  },
  {
    "front": "What is TypeScript?",
    "back": "A statically typed superset of JavaScript that compiles to plain JavaScript, providing better tooling and error detection."
  }
]`;

  const [formData, setFormData] = useState({
    front1: "What is GraphQL?",
    back1: "A query language and runtime for APIs that allows clients to request exactly the data they need.",
    front2: "Explain Docker containers",
    back2: "Lightweight, portable units that package applications with all dependencies for consistent deployment.",
    front3: "What is Redis?",
    back3: "An in-memory data structure store used as a database, cache, and message broker."
  });

  const handleImport = () => {
    setIsImporting(true);
    
    // Just replay the import animation for demo
    setTimeout(() => {
      setIsImporting(false);
    }, 2000);
  };

  const copyJsonExample = () => {
    navigator.clipboard.writeText(jsonExample);
  };

  const getCardData = () => {
    if (activeTab === 'json') {
      return [
        "What is React Fiber?",
        "Explain useCallback hook", 
        "What is TypeScript?"
      ];
    } else {
      return [
        "What is GraphQL?",
        "Explain Docker containers",
        "What is Redis?"
      ];
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Input Section */}
        <Card className="relative overflow-hidden border-2 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Bulk Import Methods
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose your preferred method to import multiple flashcards at once
            </p>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="json" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  JSON Import
                </TabsTrigger>
                <TabsTrigger value="form" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Form Builder
                </TabsTrigger>
              </TabsList>

              <TabsContent value="json" className="space-y-4 mt-6">
                <div className="relative">
                  <Label htmlFor="json-input">Paste your JSON array</Label>
                  <div className="relative mt-2">
                    <Textarea
                      id="json-input"
                      value={jsonExample}
                      readOnly
                      className="h-[200px] font-mono text-sm bg-gray-50 dark:bg-gray-900 border-2"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={copyJsonExample}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Supports unlimited cards with front/back structure
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="form" className="space-y-4 mt-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline">Card {num}</Badge>
                      </div>
                      <div className="grid gap-3">
                        <div>
                          <Label htmlFor={`front${num}`} className="text-sm">Front</Label>
                          <Input
                            id={`front${num}`}
                            value={formData[`front${num}` as keyof typeof formData]}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              [`front${num}`]: e.target.value
                            }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`back${num}`} className="text-sm">Back</Label>
                          <Input
                            id={`back${num}`}
                            value={formData[`back${num}` as keyof typeof formData]}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              [`back${num}`]: e.target.value
                            }))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Card
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <Button 
              onClick={handleImport}
              disabled={isImporting}
              className="w-full mt-6 group"
              size="lg"
            >
              {isImporting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Database className="h-4 w-4" />
                  </motion.div>
                  Importing Cards...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                  Import 3 Cards
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </CardContent>

          {/* Loading overlay */}
          <AnimatePresence>
            {isImporting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center"
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
                    <Database className="h-8 w-8 mx-auto text-blue-500" />
                  </motion.div>
                  <p className="mt-2 font-medium">Processing cards...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Results Section - Always Visible */}
        <Card className="border-2 bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Import Results
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Successfully imported 3 cards to your deck
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Success Status */}
              <div className="text-center py-4">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-3" />
                <h3 className="text-lg font-semibold text-green-600 mb-2">
                  Import Complete!
                </h3>
                <div className="flex justify-center gap-2">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    ✓ Validated
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    ✓ Processed
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    ✓ Ready to Study
                  </Badge>
                </div>
              </div>

              {/* Cards preview */}
              <div className="space-y-3">
                {getCardData().map((front, index) => (
                  <div
                    key={`${activeTab}-${index}`}
                    className="p-3 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm font-medium truncate">{front}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Imported
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Import Stats */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">3</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Cards Added</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">0.8s</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Import Time</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">100%</div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Success Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 