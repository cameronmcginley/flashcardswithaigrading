import { NextResponse } from "next/server";
import OpenAI from "openai";
import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful AI that generates flashcards based on user prompts.
You MUST respond with a JSON array of objects, where each object has 'front' and 'back' fields.
The response should be ONLY the JSON array, nothing else.
Example format:
[
  {
    "front": "What is the capital of France?",
    "back": "Paris"
  }
]`;

interface Card {
  front: string;
  back: string;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, categoryId, deckName } = await request.json();

    if (!prompt || !categoryId || !deckName) {
      return NextResponse.json(
        { error: "Prompt, categoryId, and deckName are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the current user's session (middleware ensures this exists)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          details: "No valid session found in API route",
          user,
          userError,
        },
        { status: 401 }
      );
    }

    // Generate cards using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content:
            prompt +
            "\n\nRemember to respond ONLY with the JSON array of flashcards in the specified format.",
        },
      ],
    });

    const response = completion.choices[0].message.content;

    if (!response) {
      throw new Error("No response from OpenAI");
    }

    let cards: Card[];
    try {
      const parsed = JSON.parse(response);
      if (!Array.isArray(parsed)) {
        throw new Error("Response is not an array");
      }
      cards = parsed;

      // Validate card format
      if (
        !cards.every(
          (card) =>
            typeof card === "object" &&
            card !== null &&
            "front" in card &&
            "back" in card
        )
      ) {
        throw new Error("Invalid card format in response");
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      console.error("Raw response:", response);
      throw new Error("Invalid JSON response from OpenAI");
    }

    // Create the deck in Supabase
    const { data: deck, error: deckError } = await supabase
      .from("decks")
      .insert([
        {
          name: deckName,
          category_id: categoryId,
          profile_id: user.id,
          num_cards: cards.length,
        },
      ])
      .select()
      .single();

    if (deckError) {
      console.error("Failed to create deck:", deckError);
      throw new Error("Failed to create deck");
    }

    // Create all cards in Supabase
    const { error: cardsError } = await supabase.from("cards").insert(
      cards.map((card) => ({
        deck_id: deck.id,
        front: card.front,
        back: card.back,
      }))
    );

    if (cardsError) {
      console.error("Failed to create cards:", cardsError);
      // Try to clean up the deck since card creation failed
      await supabase.from("decks").delete().eq("id", deck.id);
      throw new Error("Failed to create cards");
    }

    // On success, invalidate getCategoriesWithDecks
    revalidatePath("/categories");

    return NextResponse.json({
      success: true,
      deck,
      cardCount: cards.length,
    });
  } catch (error) {
    console.error("Error generating deck:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate deck",
      },
      { status: 500 }
    );
  }
}
