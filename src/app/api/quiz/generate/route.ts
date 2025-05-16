import { generateQuizDeck } from "@/features/quiz/quiz";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deckIds, numQuestions } = await request.json();

    if (!deckIds?.length || !numQuestions) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    // Create a new quiz record
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        user_id: session.user.id,
        deck_ids: deckIds,
        num_questions: numQuestions,
        status: "pending",
      })
      .select()
      .single();

    if (quizError) {
      console.error("Error creating quiz:", quizError);
      return NextResponse.json(
        { error: "Failed to create quiz" },
        { status: 500 }
      );
    }

    let quizQuestions;
    try {
      quizQuestions = await generateQuizDeck(deckIds, numQuestions);

      // Store the generated questions in the quiz record
      const { error: updateError } = await supabase
        .from("quizzes")
        .update({
          questions: quizQuestions,
          status: "ready",
        })
        .eq("id", quiz.id);

      if (updateError) {
        console.error("Error storing quiz questions:", updateError);
        return NextResponse.json(
          { error: "Failed to store quiz questions" },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Error generating quiz questions:", error);

      // Update quiz status to failed
      await supabase
        .from("quizzes")
        .update({
          status: "failed",
          error_message:
            error instanceof Error ? error.message : "Unknown error",
        })
        .eq("id", quiz.id);

      return NextResponse.json(
        { error: "Failed to generate quiz questions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ quizId: quiz.id });
  } catch (error) {
    console.error("Error in quiz generation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
