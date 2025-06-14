import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { logAction } from "src/lib/log";

const gradingDifficulties: Record<number, string> = {
  1: "Beginner: Lenient grading for new topics",
  2: "Adept: Balanced grading for practice",
  3: "Expert: Strict grading for mastery ",
};

const gradingRubrics: Record<number, string> = {
  1: `#### Grading Rubric (Beginner)

- **100** – Mostly correct or clear attempt with only minor confusion or casual errors  
- **90–95** – Clear answer with small gaps or slightly mixed terminology  
- **80–85** – Partial understanding, missing a key idea but directionally right  
- **70–75** – Some relevant parts, but lacking structure or clarity  
- **60–65** – Confused but trying; vague phrasing or weak understanding  
- **40–55** – Rough attempt with very limited correctness  
- **20–35** – Very unclear or mostly wrong, but some effort  
- **0–15** – No real attempt or completely off-base

➤ Bias toward encouragement. Don't penalize casual language or slight technical looseness.
`,
  2: `#### Grading Rubric (Adept)

- **100** – Accurate, well-phrased, clear; casual but correct is fine  
- **90–95** – Mostly correct, missing only a minor detail or phrased imprecisely  
- **80–85** – Good direction, but one key element is missing or confused  
- **70–75** – Multiple gaps or fuzzy logic, but has a base understanding  
- **60–65** – Significant omissions or errors, but shows effort  
- **40–55** – Confused and only partially relevant content  
- **20–35** – Poor grasp of the concept, but not a blank answer  
- **0–15** – No attempt or completely irrelevant

➤ This is standard college-level strictness. Don't dock for casual phrasing if meaning is correct.
`,
  3: `#### Grading Rubric (Expert)

- **100** – Fully correct, well-phrased, and includes any essential nuance  
- **90–95** – Correct with very minor issues, e.g. missing nuance or light ambiguity  
- **80–85** – Decent grasp but missing a critical idea or misusing a key term  
- **70–75** – Multiple important errors or shallow explanation  
- **60–65** – Demonstrates effort but lacks conceptual mastery  
- **40–55** – Incomplete and significantly incorrect  
- **20–35** – Wrong direction, but at least attempts the topic  
- **0–15** – No attempt or completely unrelated

➤ Prioritize precision and depth. Expect domain-level terminology and explanation.
`,
};

export async function POST(req: NextRequest) {
  try {
    const { front, back, userAnswer, gradingDifficulty } = await req.json();

    if (!userAnswer) {
      return NextResponse.json({ error: "Back is missing." }, { status: 400 });
    }

    const filteredUserBack = userAnswer.substring(0, 2000);

    const prompt = `
    You are an **exam grader**.
    
    ### Inputs
    Front: ${front}
    CorrectBack: ${back}
    StudentBack: ${filteredUserBack}
    Difficulty: ${gradingDifficulties[gradingDifficulty]}   // Easy | Medium | Hard
    
    ### Grading Rules
    **Score** from 0–100 (increments of 5).  
       • Beginner → give benefit of doubt.  
       • Adept → standard college‑level strictness.  
       • Expert → require full precision and relevant nuance.

    ### Scoring Philosophy (Important)

    - Do **not** reserve 100 for perfection. If an answer is essentially correct, even if casual or missing minor polish, **100 is appropriate**.
    - Use 95 or 90 for answers that are mostly right but slightly incomplete or unclear.
    - Don't downgrade too harshly for casual tone, missing nuance, or minor phrasing issues.
    - Assume the student is answering quickly, not writing an essay. Grade for **conceptual correctness**, not formality.
    - If the user is flatly incorrect, or did not answer, give a score of 0.
    - The user's answer length does not matter, the grade should not be focused on telling them to add more details.
    - If the user is correct, but did not mention a specific detail mentioned on the card back, it is not a big deal.

    
    ${gradingRubrics[gradingDifficulty]}
    

    **Feedback**  
       • Usually ≤50 words total. For complex fronts, feel free to increase or make short paragraphs.
       • Speak directly to the student.  
       • The answers are meant to be casual, short, and not perfect as if they were spoken in a quick chat. Do not grade harshly for small mistakes, tiny missing details, or casual language or terms.
       • Do not be overly harsh when assigning a score, giving a 100 sometimes is fine even if it could technically be a little better.
       • Highlight *one* thing correct (if any) and *one–two* specific gaps.  
       • Provide a concrete study tip; **do not** say "just answer the front."  
       • **Never quote the entire CorrectBack.** Paraphrase or hint instead.
       • Free to use Markdown formatting inside the response, use code blocks as necessary.
       • Feel free to add onto the correctBack that was provided if needed.
       • Provide actual feedback on specifics, DO NOT just say "You missed elaborating on the importance of..." or "Review the concept...". Explain more specifically what was missed.
    
    3. **Format**  
    \`\`\`json
    { "grade": <number>, "response": "response text" }
    \`\`\`
    `.trim();

    const response = await openai.chat.completions.create({
      model: "o3",
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0].message.content;

    try {
      const result = JSON.parse(
        content?.replace(/^```json\s*|\s*```$/g, "").trim() ?? "{}"
      );
      logAction({
        event: "AI Grade",
        tags: {
          front: front.substring(0, 50),
          gradingDifficulty,
          grade: result.grade,
        },
      });
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
