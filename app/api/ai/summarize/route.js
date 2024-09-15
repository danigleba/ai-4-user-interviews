import { NextResponse } from "next/server"
import OpenAI from "openai"
import { zodResponseFormat } from "openai/helpers/zod"
import { z } from "zod"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req) {
  try {
    const { prompt, transcript } = await req.json()

    const responseFormat = z.object({
      interviewee_name: z.string(),
      company: z.string(),
      answers: z.array(z.object({
        question: z.string(),
        answer: z.string()
      }))
    })

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that analyzes video transcripts." },
        { role: "user", content: `${prompt}\n\nTranscript: ${transcript}` }
      ],
      response_format: zodResponseFormat(responseFormat, "response_format"),
    })

    const answer = completion.choices[0].message.content

    return NextResponse.json({ answer })
  } catch (error) {
    console.error("Error summarizing transcript:", error)
    return NextResponse.json({ error: "An error occurred during summarization" }, { status: 500 })
  }
}
