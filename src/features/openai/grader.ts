import { openai } from "@/lib/openai";
import { MAX_ANSWER_LENGTH } from "./constants";

/**
 * Grade a user's answer using OpenAI.
 * Returns a numeric grade and concise feedback string.
 */
export const gradeAnswer = async (data: {
  question: string;
  answer: string;
  userAnswer: string;
  gradingDifficulty: number;
}) => {
  const { question, answer, userAnswer, gradingDifficulty } = data;

  if (!userAnswer || userAnswer.length > MAX_ANSWER_LENGTH) {
    throw new Error("Answer is missing or exceeds max length.");
  }

  const gradingDifficulties: Record<number, string> = {
    1: "Beginner: Lenient grading for new topics",
    2: "Adept: Balanced grading for practice",
    3: "Expert: Strict grading for mastery ",
  };

  const prompt = `
You are grading a student's flashcard answer.

Question: ${question}
Correct Answer: ${answer}
Your Answer: ${userAnswer}
Selected Grading Difficulty: ${gradingDifficulties[gradingDifficulty]}

Grade the answer:
- Speak directly to the student (avoid "the user" or third-person language).
- Give a grade from 0 to 100 (increments of 5), where 100 is perfect.
- Be specific: state what was correct, what was missing, and how to improve.
- Avoid fluff like “which is a key point.” Focus on clarity and accuracy.
- Mention subtle but important details if they were missed.
- Response should be 2–3 short sentences max.

Respond in JSON format: { "grade": number, "response": string }
`.trim();

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const content = response.choices[0].message.content;

  try {
    return JSON.parse(content ?? "{}");
  } catch (err) {
    throw new Error("OpenAI returned invalid JSON");
  }
};
