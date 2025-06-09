# Flashcards with AI Grading

**Live at: [flashcardswithaigrading.com](https://flashcardswithaigrading.com)**

I developed this project to satisfy my own need for a flashcard application with features I couldn't find elsewhere: bulk JSON import, Markdown/LaTeX support, and AI-powered grading. In this application, AI-generated scores are used to drive the spaced repetition algorithm. Other features include user-customizable AI prompts, analytics, AI deck generation, and deck/category organization.

## Abstract

Traditional flashcard applications often rely on binary user self-assessment (i.e., correct/incorrect) and lack support for programmatic content creation. This project is an implementation of an intelligent flashcard application designed to address these limitations. The core hypothesis is that by using a Large Language Model (LLM) to provide nuanced, qualitative feedback on a user's free-form answers, we can more accurately modulate the parameters of a spaced repetition system (SRS). This creates a more adaptive and efficient learning experience. Key features include bulk JSON import, Markdown/LaTeX support, user-customizable AI prompts, analytics, and AI deck generation.

## Key Features

-   **AI-Informed Spaced Repetition:** The scheduling algorithm is directly informed by AI-driven grading. User answers are evaluated for correctness, context, and completeness, and the resulting score provides a granular input to the spaced repetition scheduler.

-   **AI Deck Generation:** An LLM is used to generate comprehensive, context-aware flashcard decks from a single topic prompt, significantly reducing the manual effort of content creation.

-   **Hierarchical Organization:** Decks can be organized into user-defined categories. The UI supports full CRUD (Create, Read, Update, Delete) operations and reordering of both categories and decks via a drag-and-drop interface.

-   **Rich Text Support:** Cards support full Markdown, enabling formatted text, code blocks with syntax highlighting, and mathematical formulae (via LaTeX).

-   **Bulk JSON Import:** To facilitate migration from other systems, flashcards can be imported in bulk using a structured JSON format.

-   **User Authentication & Data Persistence:** The system includes user authentication to ensure data is private and persistent across sessions.

-   **Performance Analytics:** A dashboard provides users with insights into their learning progress, tracking metrics like topic mastery, review streaks, and overall accuracy.

## System Architecture & Tech Stack

The application is a monolithic full-stack application built with a modern technology stack.

-   **Framework:** [Next.js](https://nextjs.org/) / [React](https://react.dev/) (App Router)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **UI/Styling:**
    -   [Tailwind CSS](https://tailwindcss.com/)
    -   [shadcn/ui](https://ui.shadcn.com/) for the component library
    -   [Framer Motion](https://www.framer.com/motion/) for UI animations
    -   `@dnd-kit` for drag-and-drop functionality
-   **Backend:** [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) (Serverless Functions)
-   **Database:** [PostgreSQL](https://www.postgresql.org/) (managed via [Supabase](https://supabase.com/))
-   **Authentication:** [Supabase Auth](https://supabase.com/auth)
-   **AI Services:** [OpenAI API](https://platform.openai.com/docs/api-reference) (GPT models) for grading and deck generation.

## Local Development Setup

### 1. Prerequisites

-   [Node.js](https://nodejs.org/) (v18.x or later)
-   `npm` (v9.x or later)
-   A [Supabase](https://supabase.com/) project for the database and authentication.
-   An [OpenAI API key](https://platform.openai.com/api-keys).

### 2. Environment Variables

Create a `.env.local` file in the root of the project with the following:

```plaintext
# Supabase
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# OpenAI
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
```

### 3. Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start local Supabase services
npx supabase start

# 3. Seed the database
npm run db:seed

# 4. Run the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## Deployment

This project is deployed on a DigitalOcean VPS and is live at [flashcardswithaigrading.com](https://flashcardswithaigrading.com).
