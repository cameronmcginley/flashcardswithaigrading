import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Brain } from "lucide-react";
import FlashcardDemo from "./components/flashcard-demo";
import SettingsShowcase from "./components/settings-showcase";
import FeatureGrid from "./components/feature-grid";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-20 px-4 md:py-32 flex flex-col items-center justify-center text-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="container max-w-4xl">
          <Badge className="mb-4 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800">
            Powered by AI
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Smarter Flashcards.{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
              Built for Engineers.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            EZ Anki uses AI to grade your answers, give feedback, and adapt your
            study schedule.
          </p>
          <Button size="lg" className="rounded-full px-8 py-6 text-lg group">
            Try Now
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </section>

      {/* Main Visual Demo */}
      <section className="w-full py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              AI-Powered Flashcard Grading
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Get instant, intelligent feedback on your answers with our GPT-4
              powered grading system.
            </p>
          </div>

          <FlashcardDemo />

          <div className="mt-12 text-center">
            <Badge
              variant="outline"
              className="px-4 py-1.5 text-sm flex items-center gap-2 mx-auto"
            >
              <Brain className="h-4 w-4" />
              Powered by OpenAI GPT-4
            </Badge>
          </div>
        </div>
      </section>

      {/* Settings Showcase */}
      <section className="w-full py-20 px-4 bg-white dark:bg-gray-950">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Customize Your Learning Experience
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Fine-tune your study parameters and AI prompts to match your
              learning style.
            </p>
          </div>

          <SettingsShowcase />
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for Efficient Learning
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              EZ Anki combines the best of spaced repetition with modern AI
              capabilities.
            </p>
          </div>

          <FeatureGrid />
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-20 px-4 bg-white dark:bg-gray-950">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Studying Smarter Today
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of engineers who are optimizing their learning with
            EZ Anki.
          </p>
          <Button size="lg" className="rounded-full px-8 py-6 text-lg group">
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 px-4 bg-gray-100 dark:bg-gray-900">
        <div className="container max-w-6xl mx-auto text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} EZ Anki. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
