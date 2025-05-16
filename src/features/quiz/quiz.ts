import { supabase } from "@/lib/supabase/client";
import { openai } from "@/lib/openai";
import { z } from "zod"; // Add zod for schema validation
import { SupabaseClient } from "@supabase/supabase-js";

const QUIZ_CATEGORY_NAME = "Quizzes";

// Define schema for OpenAI response
const QuestionSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const QuestionsArraySchema = z.array(QuestionSchema);

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

async function ensureQuizCategory(client: SupabaseClient = supabase) {
  try {
    // Check if Quiz category exists
    const { data: categories, error: categoryError } = await client
      .from("categories")
      .select("id")
      .eq("name", QUIZ_CATEGORY_NAME)
      .single();

    if (categoryError && categoryError.code !== "PGRST116") {
      console.error("Error checking quiz category:", categoryError);
      throw new Error(
        `Failed to check quiz category: ${categoryError.message}`
      );
    }

    if (categories) return categories.id;

    // Create Quiz category if it doesn't exist
    const { data: newCategory, error } = await client
      .from("categories")
      .insert([{ name: QUIZ_CATEGORY_NAME }])
      .select()
      .single();

    if (error) {
      console.error("Error creating quiz category:", error);
      throw new Error(`Failed to create quiz category: ${error.message}`);
    }

    return newCategory.id;
  } catch (error) {
    console.error("Error in ensureQuizCategory:", error);
    throw error;
  }
}

export async function generateQuizDeck(
  deckIds: string[],
  numQuestions: number,
  client: SupabaseClient = supabase
) {
  try {
    if (!deckIds || !Array.isArray(deckIds) || deckIds.length === 0) {
      throw new Error("No deck IDs provided");
    }

    if (!numQuestions || numQuestions < 1) {
      throw new Error("Invalid number of questions");
    }

    // Get the current user
    const { data: userData } = await client.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      throw new Error("No authenticated user found");
    }

    // Get the quiz category ID
    const quizCategoryId = await ensureQuizCategory(client);

    // Fetch content from selected decks
    const { data: selectedDecks, error: decksError } = await client
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

    if (decksError) {
      console.error("Error fetching decks:", decksError);
      throw new Error(`Failed to fetch deck content: ${decksError.message}`);
    }

    if (!selectedDecks || selectedDecks.length === 0) {
      throw new Error("No valid decks found for the selected IDs");
    }

    // Prepare content for OpenAI
    const deckContent = selectedDecks
      .map(
        (deck) =>
          `Deck "${deck.name}":\n${deck.cards
            .map((card) => `- ${card.front}\n  Answer: ${card.back}`)
            .join("\n")}`
      )
      .join("\n\n");

    // Generate quiz questions using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Based on the following flashcard content, generate ${numQuestions} quiz questions that test understanding of the material. Make the questions challenging and varied. Do not directly copy the given flashcards, but rather see them as a source of inspiration or study material.

Content:
${deckContent}

Generate exactly ${numQuestions} questions for this quiz in this JSON format:
[
  {
    "question": "...",
    "answer": "..."
  }
]`,
        },
      ],
    });

    const response = completion.choices[0].message.content;
    if (!response) throw new Error("No response from OpenAI");

    let questions;
    try {
      const parsedResponse = JSON.parse(response);
      // Validate the parsed response against our schema
      questions = QuestionsArraySchema.parse(parsedResponse);
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      console.error("Raw response:", response);
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid response format from OpenAI: ${error.message}`
        );
      } else {
        throw new Error(
          `Failed to parse OpenAI response: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    // Create a new deck for the quiz
    const timestamp = new Date().toISOString().split("T")[0];
    const deckName = `Quiz ${timestamp}`;

    const { data: quizDeck, error: deckError } = await client
      .from("decks")
      .insert([
        {
          name: deckName,
          category_id: quizCategoryId,
          num_cards: numQuestions,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (deckError) {
      console.error("Error creating quiz deck:", deckError);
      throw new Error(`Failed to create quiz deck: ${deckError.message}`);
    }

    // Create the quiz cards
    const { data: cards, error: cardsError } = await client
      .from("cards")
      .insert(
        questions.map((q) => ({
          deck_id: quizDeck.id,
          front: q.question,
          back: q.answer,
          user_id: userId,
        }))
      )
      .select();

    if (cardsError) {
      console.error("Error creating quiz cards:", cardsError);
      // Try to clean up the deck since card creation failed
      await client.from("decks").delete().eq("id", quizDeck.id);
      throw new Error(`Failed to create quiz cards: ${cardsError.message}`);
    }

    return cards;
  } catch (error) {
    console.error("Error in generateQuizDeck:", error);
    throw error;
  }
}

export async function saveQuizResults(
  deckId: string,
  results: QuizResult[],
  client: SupabaseClient = supabase
) {
  const averageGrade =
    results.reduce((sum, r) => sum + r.grade, 0) / results.length;

  const { data: summary, error } = await client
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

export async function getQuizResults(
  deckId: string,
  client: SupabaseClient = supabase
) {
  const { data, error } = await client
    .from("quiz_results")
    .select("*")
    .eq("deck_id", deckId)
    .single();

  if (error) throw error;
  return data;
}
