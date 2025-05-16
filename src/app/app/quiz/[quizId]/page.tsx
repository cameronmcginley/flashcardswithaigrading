import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import QuizForm from "@/components/quiz-form";

export default async function QuizPage({
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
    .single();

  if (quizError || !quiz) {
    redirect("/app");
  }

  if (quiz.status === "pending") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Generating Your Quiz</h2>
        <p className="text-muted-foreground text-center">
          Please wait while we prepare your questions...
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="bg-card rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Quiz</h1>
        <QuizForm quizId={params.quizId} questions={quiz.questions} />
      </div>
    </div>
  );
}
