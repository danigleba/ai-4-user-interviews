import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req) {
  try {
    const { problem, audience } = await req.json()

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: `You are an expert in creating user interview questions for user interviews based in the book 'The mom test. Follow this instructions when choosing the questions to ask: 
            - **Focus on Past Behavior
            - **Avoid Mentioning Your Idea**
            - **Seek Specific Details**
            - **Explore Current Solutions**
            - **Dig Deeper**
            - **Ask Open-Ended Questions**
            - **Seek Commitments**`
        },
        { role: "user", content: `Generate 5 insightful interview questions for a product solving the following problem: "${problem}". The target audience is: "${audience}".` }
      ],
      temperature: 0.5,
      max_tokens: 500
    })

    const questions = completion.choices[0].message.content.split("\n").filter(q => q.trim() !== "")

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Error generating questions:", error)
    return NextResponse.json({ error: "An error occurred while generating questions" }, { status: 500 })
  }
}
