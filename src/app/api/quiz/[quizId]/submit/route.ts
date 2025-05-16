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

    // Validate answers
    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: "Answers must be a non-empty array" },
        { status: 400 }
      );
    }

    if (answers.length !== quiz.questions.length) {
      return NextResponse.json(
        {
          error: `Expected ${quiz.questions.length} answers but received ${answers.length}`,
        },
        { status: 400 }
      );
    }

    if (
      answers.some((answer) => typeof answer !== "string" || !answer.trim())
    ) {
      return NextResponse.json(
        { error: "All answers must be non-empty strings" },
        { status: 400 }
      );
    }

    // Grade each answer using OpenAI
    const feedbackPromises = quiz.questions.map(
      async (question: string, index: number) => {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo-1106",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are a helpful AI tutor grading a quiz answer. Provide detailed feedback and a score out of 10. Your response must be valid JSON with exactly two fields: 'score' (number 0-10) and 'feedback' (string).",
            },
            {
              role: "user",
              content: `Question: ${question}\nStudent's Answer: ${answers[index]}\n\nGrade this answer out of 10 points and provide constructive feedback.`,
            },
          ],
        });

        // With response_format: "json_object", the content is guaranteed to be valid JSON
        const content = completion.choices[0].message.content;
        if (!content) {
          console.error("Empty response from OpenAI");
          return { score: 0, feedback: "Error: Empty grading response" };
        }

        const result = JSON.parse(content);

        // Additional type safety check
        if (
          typeof result.score !== "number" ||
          typeof result.feedback !== "string"
        ) {
          console.error("Invalid response format from OpenAI:", result);
          return {
            score: 0,
            feedback: "Error: Invalid grading response format",
          };
        }

        return result;
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
