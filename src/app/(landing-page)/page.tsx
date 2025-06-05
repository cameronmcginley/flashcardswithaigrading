import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Brain, Sparkles, Zap, Target, Wand2 } from "lucide-react";
import FlashcardDemo from "./components/flashcard-demo";
import SettingsShowcase from "./components/settings-showcase";
import FeatureGrid from "./components/feature-grid";
import BulkImportShowcase from "./components/bulk-import-showcase";
import InsightsShowcase from "./components/insights-showcase";
import MarkdownShowcase from "./components/markdown-showcase";
import AlgorithmShowcase from "./components/algorithm-showcase";
import AIDeckGeneratorShowcase from "./components/ai-deck-generator-showcase";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-20 px-4 md:py-32 flex flex-col items-center justify-center text-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="container max-w-5xl">
          <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 px-4 py-2">
            <Sparkles className="h-4 w-4 mr-2" />
            Powered by AI
          </Badge>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-8">
            The Future of{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600">
              Smart Learning
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            EZ Anki revolutionizes flashcard learning with AI-powered grading, 
            adaptive algorithms, and powerful features that make studying efficient and engaging.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/app">
              <Button size="lg" className="rounded-full px-8 py-6 text-lg group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Zap className="mr-2 h-5 w-5" />
                Start Learning Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg">
              <Target className="mr-2 h-5 w-5" />
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* AI Grading Demo */}
      <section className="w-full py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Brain className="h-4 w-4 mr-2" />
              AI-Powered Intelligence
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Intelligent Flashcard Grading
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Experience instant, nuanced feedback with our GPT-4 powered grading system 
              that understands context, provides detailed explanations, and adapts to your learning style.
            </p>
          </div>

          <FlashcardDemo />
        </div>
      </section>

      {/* AI Deck Generator */}
      <section className="w-full py-20 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-indigo-950/20">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Wand2 className="h-4 w-4 mr-2" />
              AI Deck Generator
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Create Entire Decks Instantly ✨
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Simply enter any topic and watch our AI generate a complete, 
              intelligent flashcard deck in seconds. From programming to history to science - 
              the AI understands context and creates perfectly structured learning material.
            </p>
          </div>

          <AIDeckGeneratorShowcase />
        </div>
      </section>

      {/* Bulk Import Showcase */}
      <section className="w-full py-20 px-4 bg-white dark:bg-gray-950">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              Rapid Content Creation
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Import Cards in Seconds
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Whether you prefer structured JSON or simple forms, create hundreds of 
              flashcards instantly with our flexible import system.
            </p>
          </div>

          <BulkImportShowcase />
        </div>
      </section>

      {/* Markdown & Rich Content */}
      <section className="w-full py-20 px-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Rich Content Support
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Beyond Basic Text
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Create stunning flashcards with code syntax highlighting, mathematical equations, 
              images, and rich markdown formatting for any subject.
            </p>
          </div>

          <MarkdownShowcase />
        </div>
      </section>

      {/* Smart Insights */}
      <section className="w-full py-20 px-4 bg-white dark:bg-gray-950">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Brain className="h-4 w-4 mr-2" />
              Data-Driven Learning
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Smart Analytics & Insights
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Track your progress with detailed analytics, identify weak spots, 
              and optimize your study schedule with AI-powered insights.
            </p>
          </div>

          <InsightsShowcase />
        </div>
      </section>

      {/* Spaced Repetition Algorithm */}
      <section className="w-full py-20 px-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Target className="h-4 w-4 mr-2" />
              Science-Based Learning
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Optimized Spaced Repetition
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our advanced algorithm adapts to your performance, scheduling reviews 
              at the perfect moment for maximum retention and efficiency.
            </p>
          </div>

          <AlgorithmShowcase />
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
              learning style and goals.
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
              capabilities and user-friendly design.
            </p>
          </div>

          <FeatureGrid />
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are optimizing their study sessions 
            with EZ Anki&apos;s intelligent flashcard system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/app">
              <Button size="lg" className="rounded-full px-8 py-6 text-lg group bg-white text-purple-600 hover:bg-gray-50">
                <Zap className="mr-2 h-5 w-5" />
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg border-white text-white hover:bg-white hover:text-purple-600">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 px-4 bg-gray-100 dark:bg-gray-900">
        <div className="container max-w-6xl mx-auto text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} EZ Anki. Revolutionizing learning through intelligent technology.</p>
        </div>
      </footer>
    </main>
  );
}
