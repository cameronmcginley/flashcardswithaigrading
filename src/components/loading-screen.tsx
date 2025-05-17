import { Skeleton } from "@/components/ui/skeleton";
import { Plus, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoadingScreenProps {
  isLoading: boolean;
  hasContent: boolean;
  onAddCategory: () => void;
  onOpenMagicDeck: () => void;
}

export function LoadingScreen({
  isLoading,
  hasContent,
  onAddCategory,
  onOpenMagicDeck,
}: LoadingScreenProps) {
  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <BookOpen className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Loading your flashcards</h2>
          <p className="text-muted-foreground text-center mb-8">
            Preparing your study materials...
          </p>
          <div className="w-full space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-full" />
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome to ez-anki!</h2>
          <p className="text-muted-foreground text-center mb-8">
            Get started by creating a category and adding flashcard decks
          </p>
          <div className="flex flex-col space-y-4 w-full">
            <Button onClick={onAddCategory} className="w-full" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Create your first category
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </div>
            <Button
              onClick={onOpenMagicDeck}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              size="lg"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate with AI
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
