import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(
  request: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { answers } = await request.json();

    // Get the quiz
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", params.quizId)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Grade each answer using OpenAI
    const feedbackPromises = quiz.questions.map(
      async (question: string, index: number) => {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful AI tutor grading a quiz answer. Provide detailed feedback and a score out of 10. Format your response as JSON with 'score' and 'feedback' fields.",
            },
            {
              role: "user",
              content: `Question: ${question}\nStudent's Answer: ${answers[index]}\n\nGrade this answer out of 10 points and provide constructive feedback.`,
            },
          ],
        });

        try {
          return JSON.parse(completion.choices[0].message.content || "{}");
        } catch (error) {
          console.error("Error parsing OpenAI response:", error);
          return { score: 0, feedback: "Error grading answer" };
        }
      }
    );

    const feedback = await Promise.all(feedbackPromises);
    const totalScore = feedback.reduce((sum, item) => sum + item.score, 0);
    const averageScore = totalScore / feedback.length;

    // Update the quiz with results
    const { error: updateError } = await supabase
      .from("quizzes")
      .update({
        status: "completed",
        answers,
        feedback,
        score: averageScore,
      })
      .eq("id", params.quizId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to save quiz results" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      score: averageScore,
      feedback,
    });
  } catch (error) {
    console.error("Error in quiz submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
