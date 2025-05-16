import { supabase } from "@/lib/supabase/client";
import { openai } from "@/lib/openai";

const QUIZ_CATEGORY_NAME = "Quizzes";

export interface QuizResult {
  questionNumber: number;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  grade: number;
  feedback: string;
}

export interface QuizSummary {
  quizId: string;
  totalQuestions: number;
  averageGrade: number;
  results: QuizResult[];
  createdAt: string;
}

async function ensureQuizCategory() {
  // Check if Quiz category exists
  const { data: categories } = await supabase
    .from("categories")
    .select("id")
    .eq("name", QUIZ_CATEGORY_NAME)
    .single();

  if (categories) return categories.id;

  // Create Quiz category if it doesn't exist
  const { data: newCategory, error } = await supabase
    .from("categories")
    .insert([{ name: QUIZ_CATEGORY_NAME }])
    .select()
    .single();

  if (error) throw error;
  return newCategory.id;
}

export async function generateQuizDeck(
  deckIds: string[],
  numQuestions: number
) {
  // Get the quiz category ID
  const quizCategoryId = await ensureQuizCategory();

  // Fetch content from selected decks
  const { data: selectedDecks, error: decksError } = await supabase
    .from("decks")
    .select(
      `
      name,
      cards!inner (
        front,
        back
      )
    `
    )
    .in("id", deckIds);

  if (decksError) throw decksError;

  // Prepare content for OpenAI
  const deckContent = selectedDecks
    ?.map(
      (deck) =>
        `Deck "${deck.name}":\n${deck.cards
          .map((card) => `- ${card.front}\n  Answer: ${card.back}`)
          .join("\n")}`
    )
    .join("\n\n");

  // Generate quiz questions using OpenAI
  const prompt = `Based on the following flashcard content, generate ${numQuestions} quiz questions that test understanding of the material. Make the questions challenging and varied. Do not directly copy the given flashcards, but rather see them as a source of inspiration or study material.

Content:
${deckContent}

Generate exactly ${numQuestions} questions for this quiz in this JSON format:
[
  {
    "question": "...",
    "answer": "..."
  }
]`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const response = completion.choices[0].message.content;
  if (!response) throw new Error("No response from OpenAI");

  const questions = JSON.parse(response);

  // Create a new deck for the quiz
  const timestamp = new Date().toISOString().split("T")[0];
  const deckName = `Quiz ${timestamp}`;

  const { data: quizDeck, error: deckError } = await supabase
    .from("decks")
    .insert([
      {
        name: deckName,
        category_id: quizCategoryId,
        num_cards: numQuestions,
      },
    ])
    .select()
    .single();

  if (deckError) throw deckError;

  // Create the quiz cards
  const { error: cardsError } = await supabase.from("cards").insert(
    questions.map((q: { question: string; answer: string }) => ({
      deck_id: quizDeck.id,
      front: q.question,
      back: q.answer,
    }))
  );

  if (cardsError) throw cardsError;

  //   return quizDeck;
  // return set of cards
  return cards;
}

export async function saveQuizResults(deckId: string, results: QuizResult[]) {
  const averageGrade =
    results.reduce((sum, r) => sum + r.grade, 0) / results.length;

  const { data: summary, error } = await supabase
    .from("quiz_results")
    .insert([
      {
        deck_id: deckId,
        results: results,
        average_grade: averageGrade,
        total_questions: results.length,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return summary;
}

export async function getQuizResults(deckId: string) {
  const { data, error } = await supabase
    .from("quiz_results")
    .select("*")
    .eq("deck_id", deckId)
    .single();

  if (error) throw error;
  return data;
}
