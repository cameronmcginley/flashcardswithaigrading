"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { testQuizGeneration } from "@/app/api/quiz/test-endpoint";

interface Deck {
  id: string;
  name: string;
  category: {
    name: string;
  } | null;
}

interface TestResult {
  success: boolean;
  data?: {
    quizId: string;
    [key: string]: unknown;
  };
  error?: unknown;
  status?: number;
}

// For handling Supabase's response type
interface SupabaseDeckResult {
  id: string;
  name: string;
  category: unknown;
}

export default function TestQuizGeneration() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDecks, setSelectedDecks] = useState<string[]>([]);
  const [numQuestions, setNumQuestions] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const { data, error } = await supabase
          .from("decks")
          .select("id, name, category:categories(name)");

        if (error) {
          console.error("Error fetching decks:", error);
          return;
        }

        // Transform the data to match our Deck interface
        const formattedDecks: Deck[] = (data || []).map(
          (item: SupabaseDeckResult) => {
            // Safe extraction of category name
            let categoryName: string | null = null;
            if (item.category && typeof item.category === "object") {
              const category = item.category as Record<string, unknown>;
              if ("name" in category && typeof category.name === "string") {
                categoryName = category.name;
              }
            }

            return {
              id: item.id,
              name: item.name,
              category: categoryName ? { name: categoryName } : null,
            };
          }
        );

        setDecks(formattedDecks);
      } catch (err) {
        console.error("Error in fetchDecks:", err);
      }
    };

    fetchDecks();
  }, []);

  const handleDeckToggle = (deckId: string) => {
    setSelectedDecks((prev) =>
      prev.includes(deckId)
        ? prev.filter((id) => id !== deckId)
        : [...prev, deckId]
    );
  };

  const handleTest = async () => {
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const testResult = await testQuizGeneration(selectedDecks, numQuestions);
      setResult(testResult as TestResult);

      if (!testResult.success) {
        setError(`Test failed: ${JSON.stringify(testResult.error)}`);
      }
    } catch (error) {
      console.error("Error running test:", error);
      setError(
        `Exception: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-2xl font-bold">Quiz Generation Test</h1>
      <p className="text-muted-foreground">
        This page is for testing and debugging the quiz generation API.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Test Parameters</CardTitle>
          <CardDescription>
            Select decks and set the number of questions to test the quiz
            generation API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="numQuestions">Number of Questions</Label>
            <Input
              id="numQuestions"
              type="number"
              min="1"
              max="20"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
              className="max-w-[120px]"
            />
          </div>

          <div>
            <Label>Select Decks</Label>
            <div className="grid gap-2 mt-2">
              {decks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Loading decks...
                </p>
              ) : (
                decks.map((deck) => (
                  <div key={deck.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`deck-${deck.id}`}
                      checked={selectedDecks.includes(deck.id)}
                      onCheckedChange={() => handleDeckToggle(deck.id)}
                    />
                    <Label
                      htmlFor={`deck-${deck.id}`}
                      className="cursor-pointer"
                    >
                      {deck.name}{" "}
                      <span className="text-xs text-muted-foreground">
                        ({deck.category?.name})
                      </span>
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleTest}
            disabled={isLoading || selectedDecks.length === 0}
          >
            {isLoading ? "Testing..." : "Run Test"}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-md overflow-auto">
              {error}
            </pre>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Test Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-md overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
          {result.success && result.data?.quizId && (
            <CardFooter>
              <Button asChild>
                <a
                  href={`/app/quiz/${result.data.quizId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Generated Quiz
                </a>
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}
