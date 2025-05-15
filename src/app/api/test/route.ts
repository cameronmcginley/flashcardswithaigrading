import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

const TEST_EMAIL = "test2@example.com";
const TEST_PASSWORD = "test123456";

export async function GET() {
  try {
    // Sign in with the credentials
    const { data: authData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

    if (signInError) {
      return NextResponse.json(
        { error: "SignIn failed: " + signInError.message },
        { status: 401 }
      );
    }

    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "No user ID found after auth" },
        { status: 401 }
      );
    }

    // Create a test category
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .insert([
        {
          name: "Test Category",
          profile_id: userId,
        },
      ])
      .select()
      .single();

    if (categoryError) {
      return NextResponse.json(
        { error: "Category creation failed: " + categoryError.message },
        { status: 500 }
      );
    }

    // Create a test deck in that category
    const { data: deckData, error: deckError } = await supabase
      .from("decks")
      .insert([
        {
          name: "Test Deck",
          category_id: categoryData.id,
          profile_id: userId,
          num_cards: 0,
        },
      ])
      .select()
      .single();

    if (deckError) {
      return NextResponse.json(
        { error: "Deck creation failed: " + deckError.message },
        { status: 500 }
      );
    }

    // Try queries after creating data
    const cardsResult = await supabase.from("cards").select("*");
    const categoriesResult = await supabase.from("categories").select("*");
    const decksResult = await supabase.from("decks").select("*");

    // Get the current session info
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    return NextResponse.json({
      cards: {
        data: cardsResult.data,
        error: cardsResult.error,
      },
      categories: {
        data: categoriesResult.data,
        error: categoriesResult.error,
      },
      decks: {
        data: decksResult.data,
        error: decksResult.error,
      },
      created: {
        category: categoryData,
        deck: deckData,
        userId,
      },
      auth: {
        session: session,
        error: sessionError,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Test route error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
