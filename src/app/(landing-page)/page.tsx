import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Cpu, FileText, Github } from "lucide-react";
import Link from "next/link";
import FlashcardDemo from "./components/flashcard-demo";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-white text-gray-800">
      {/* Hero Section */}
      <section className="w-full py-20 px-4 md:py-32 flex flex-col items-center justify-center text-center bg-white">
        <div className="container max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-gray-900">
            Flashcards with AI Grading
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Built to fill the gaps in existing flashcard apps: bulk JSON import,
            Markdown/LaTeX support, and AI-powered grading that drives spaced
            repetition.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/app">
              <Button
                size="lg"
                className="px-8 py-6 text-lg group bg-green-700 text-white hover:bg-green-800 rounded-md"
              >
                Go to App
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Grading Demo Section */}
      <section className="w-full py-20 px-4 bg-slate-50">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
              AI Grading
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              LLM evaluation provides nuanced feedback on free-form answers,
              creating more accurate spaced repetition scheduling than binary
              self-assessment.
            </p>
          </div>
          <FlashcardDemo />
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 px-4 bg-white">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
              Features
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The features that were missing from other flashcard applications.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-100 p-6 rounded-md">
              <Code className="h-8 w-8 mb-4 text-green-600" />
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Markdown & LaTeX
              </h3>
              <p className="text-gray-600">
                Full Markdown support with code syntax highlighting and
                mathematical formulae via LaTeX rendering.
              </p>
            </div>
            <div className="bg-slate-100 p-6 rounded-md">
              <Cpu className="h-8 w-8 mb-4 text-green-600" />
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                AI Deck Generation
              </h3>
              <p className="text-gray-600">
                Generate comprehensive, context-aware flashcard decks from a
                single topic prompt, reducing manual content creation.
              </p>
            </div>
            <div className="bg-slate-100 p-6 rounded-md">
              <FileText className="h-8 w-8 mb-4 text-green-600" />
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Bulk JSON Import
              </h3>
              <p className="text-gray-600">
                Programmatic content creation and migration from other systems
                via structured JSON import.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Algorithm Section */}
      <section className="w-full py-20 px-4 bg-slate-50">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
              Algorithm
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Uses a spaced repetition algorithm informed by AI grading.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-green-600">
                AI-Informed Scheduling
              </h3>
              <p className="text-gray-600">
                Traditional flashcard apps rely on binary self-assessment. This
                system uses LLM evaluation of your answers to provide granular
                input to the spaced repetition scheduler.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-green-600">
                Customizable Prompts
              </h3>
              <p className="text-gray-600">
                User-customizable AI prompts let you adjust grading difficulty
                and feedback style to match your learning preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-20 px-4 bg-white">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
            Start Learning
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Free to use!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/app">
              <Button
                size="lg"
                className="px-8 py-6 text-lg group bg-green-700 text-white hover:bg-green-800 rounded-md"
              >
                Go to App
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 px-4 bg-slate-50">
        <div className="container max-w-6xl mx-auto text-center">
          <a
            href="https://github.com/cameronmcginley/flashcardswithaigrading"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Github className="h-5 w-5 mr-2" />
            View on GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}
