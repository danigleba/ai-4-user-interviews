import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get("file")

    const buffer = Buffer.from(await file.arrayBuffer())
    const blob = new Blob([buffer], { type: file.type })
    const fileObject = new File([blob], file.name, { type: file.type })

    const transcription = await openai.audio.transcriptions.create({
      file: fileObject,
      model: "whisper-1"
    })
  
    return NextResponse.json({ transcript: transcription.text })
  } catch (error) {
    console.error("Error transcribing audio:", error)
    return NextResponse.json({ error: "An error occurred during transcription" }, { status: 500 })
  }
}