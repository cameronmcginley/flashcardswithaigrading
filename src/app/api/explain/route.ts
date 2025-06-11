import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { front } = await req.json();

    if (!front) {
      return NextResponse.json(
        { error: "Question is missing." },
        { status: 400 }
      );
    }

    const prompt = `
    You are a knowledgeable tutor explaining a concept in detail.
    
    ### Question
    ${front}
    
    ### Instructions:
    Provide a comprehensive explanation that:
    1. **Directly answers the question**
    2. **Gives relevant background context** to reinforce understanding
    3. **Includes clear, concrete examples**
    4. **Explains practical applications or implications** (real-world use cases, why it matters)
    5. **Uses precise, accessible language** (avoid fluff, no jargon unless explained)
    6. **Uses full markdown formatting**, including:
       - Headings
       - Bullet points
       - Code blocks (if relevant)
       - Diagrams (if relevant)
       - Math via LaTeX (surround with \`$...$\` or use \`$$...$$\` for blocks)
       - Anything else that is relevant or may be helpful to the user
    7. **Include details on real world applicability** including whether you think this is important or not
    8. **Include links to more information** if you think it is relevant
    9. **Be sure to mention technical specifics and terms** if they are relevant
    
    ### Additional Notes:
    - Use LaTeX for **mathematical notation** or formulas when needed.
    - Structure the explanation clearly with sections if the topic has multiple components.
    - Keep the response **focused but thorough**, roughly **200–400 words**.
    
    Respond in a way that is **educational and engaging**, as if you're walking a student through the concept 1-on-1.
    `.trim();

    const response = await openai.chat.completions.create({
      model: "o3",
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0].message.content;

    return NextResponse.json({ explanation: content });
  } catch (error) {
    console.error("Error generating explanation:", error);
    return NextResponse.json(
      { error: `Failed to generate explanation: ${error}` },
      { status: 500 }
    );
  }
}
