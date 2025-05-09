import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export async function POST(req: NextRequest) {
  const { question, answer, userAnswer } = await req.json()
  const res = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: `Q: ${question}\nA: ${answer}\nUser: ${userAnswer}` }]
  })
  return NextResponse.json({ feedback: res.choices[0].message.content })
}
