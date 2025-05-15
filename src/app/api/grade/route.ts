import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

const gradingDifficulties: Record<number, string> = {
  1: "Beginner: Lenient grading for new topics",
  2: "Adept: Balanced grading for practice",
  3: "Expert: Strict grading for mastery ",
};

export async function POST(req: NextRequest) {
  try {
    const { question, answer, userAnswer, gradingDifficulty } =
      await req.json();

    if (!userAnswer) {
      return NextResponse.json(
        { error: "Answer is missing." },
        { status: 400 }
      );
    }

    const filteredUserAnswer = userAnswer.substring(0, 2000);

    const prompt = `
    You are an **exam grader**.
    
    ### Inputs
    Question: ${question}
    CorrectAnswer: ${answer}
    StudentAnswer: ${filteredUserAnswer}
    Difficulty: ${gradingDifficulties[gradingDifficulty]}   // Easy | Medium | Hard
    
    ### Grading Rules
    1. **Score** from 0–100 (increments of 5).  
       • Beginner → give benefit of doubt.  
       • Adept → standard college‑level strictness.  
       • Expert → require full precision and relevant nuance.
    
    2. **Feedback**  
       • Usually ≤35 words total. For complex questions, feel free to increase or make short paragraphs.
       • Speak directly to the student.  
       • Highlight *one* thing correct (if any) and *one–two* specific gaps.  
       • Provide a concrete study tip; **do not** say “just answer the question.”  
       • **Never quote the entire CorrectAnswer.** Paraphrase or hint instead.
       • Free to use Markdown formatting inside the response, use code blocks as necessary.
       • Feel free to add onto the correctAnswer that was provided if needed.
       • Don't just say something like "You missed elaborating on the importance of...". Explain more specifically what was missed.
    
    3. **Format**  
    \`\`\`json
    { "grade": <number>, "response": "response text" }
    \`\`\`
    `.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0].message.content;

    try {
      const result = JSON.parse(
        content?.replace(/^```json\s*|\s*```$/g, "").trim() ?? "{}"
      );
      return NextResponse.json(result);
    } catch (err) {
      return NextResponse.json(
        {
          error: `OpenAI returned invalid JSON: ${err}\n\nContent: ${content}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error grading answer:", error);
    return NextResponse.json(
      { error: `Failed to grade answer: ${error}` },
      { status: 500 }
    );
  }
}
