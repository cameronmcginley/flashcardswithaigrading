import { generateQuizDeck } from "@/features/quiz/quiz";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createAuthErrorResponse } from "@/lib/supabase/error";

export async function POST(request: NextRequest) {
  try {
    let reqBody;
    try {
      reqBody = await request.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { deckIds, numQuestions } = reqBody;

    if (!deckIds?.length || !numQuestions) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    // Create server-side Supabase client
    const supabase = await createClient();

    // Get the current user's session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
      return createAuthErrorResponse(
        userError || { message: "No user found" },
        user
      );
    }

    // Create a new quiz record
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        user_id: user.id,
        deck_ids: deckIds,
        num_questions: numQuestions,
        status: "pending",
      })
      .select()
      .single();

    if (quizError) {
      console.error("Error creating quiz:", quizError);
      return NextResponse.json(
        { error: "Failed to create quiz", details: quizError.message },
        { status: 500 }
      );
    }

    try {
      // Generate quiz questions
      const quizCards = await generateQuizDeck(deckIds, numQuestions, supabase);

      // Update the quiz with the generated questions
      const { error: updateError } = await supabase
        .from("quizzes")
        .update({
          questions: quizCards,
          status: "ready",
        })
        .eq("id", quiz.id);

      if (updateError) {
        throw new Error(`Failed to update quiz: ${updateError.message}`);
      }

      // Revalidate paths
      revalidatePath("/app/quiz");
      revalidatePath(`/app/quiz/${quiz.id}`);

      return NextResponse.json({
        quizId: quiz.id,
        success: true,
        questionCount: quizCards.length,
      });
    } catch (error) {
      console.error("Error generating quiz questions:", error);

      // Mark the quiz as failed
      await supabase
        .from("quizzes")
        .update({
          status: "failed",
          error_message:
            error instanceof Error ? error.message : "Unknown error",
        })
        .eq("id", quiz.id);

      return NextResponse.json(
        {
          error: "Failed to generate quiz questions",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in quiz generation:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
