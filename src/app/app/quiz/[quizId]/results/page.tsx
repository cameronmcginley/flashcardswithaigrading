import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface FeedbackItem {
  score: number;
  feedback: string;
}

export default async function QuizResultsPage({
  params,
}: {
  params: { quizId: string };
}) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();

  if (authError || !session) {
    redirect("/login");
  }

  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", params.quizId)
    .eq("user_id", session.user.id)
    .single();

  if (quizError || !quiz) {
    redirect("/app");
  }

  if (quiz.status !== "completed") {
    redirect(`/app/quiz/${params.quizId}`);
  }

  if (
    !quiz.feedback ||
    !quiz.questions ||
    !quiz.answers ||
    quiz.feedback.length !== quiz.questions.length ||
    quiz.answers.length !== quiz.questions.length
  ) {
    console.error("Invalid quiz data structure:", {
      feedbackLength: quiz.feedback?.length,
      questionsLength: quiz.questions?.length,
      answersLength: quiz.answers?.length,
    });
    redirect("/app");
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="bg-card rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Quiz Results</h1>
          <div className="text-right">
            <p className="text-lg font-semibold">
              Overall Score:{" "}
              <span
                className={
                  quiz.score >= 8
                    ? "text-green-600"
                    : quiz.score >= 6
                    ? "text-yellow-600"
                    : "text-red-600"
                }
              >
                {Math.round(quiz.score * 10)}%
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {quiz.questions.map((question: string, index: number) => {
            const feedback = quiz.feedback[index] as FeedbackItem;
            const uniqueKey = `${quiz.id}-question-${index + 1}`;

            return (
              <div
                key={uniqueKey}
                className="border rounded-lg p-4 space-y-4 bg-background"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Question {index + 1} of {quiz.questions.length}
                  </h3>
                  <span
                    className={
                      feedback.score >= 8
                        ? "text-green-600"
                        : feedback.score >= 6
                        ? "text-yellow-600"
                        : "text-red-600"
                    }
                  >
                    Score: {feedback.score}/10
                  </span>
                </div>

                <div>
                  <p className="font-medium">Question:</p>
                  <p className="mt-1">{question}</p>
                </div>

                <div>
                  <p className="font-medium">Your Answer:</p>
                  <p className="mt-1">{quiz.answers[index]}</p>
                </div>

                <div>
                  <p className="font-medium">Feedback:</p>
                  <p className="mt-1 text-muted-foreground">
                    {feedback.feedback}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <Link href="/app">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
