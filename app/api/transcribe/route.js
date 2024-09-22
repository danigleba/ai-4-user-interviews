import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

function processTranscription(segments) {
  let processedText = ""
  let lastTimeLog = 0
  let currentSentence = ""

  segments.forEach((segment, index) => {
    const startTime = segment.start
    currentSentence += segment.text.trim() + " "

    if (segment.text.trim().endsWith(".") || segment.text.trim().endsWith("?") || segment.text.trim().endsWith("!")) {
      if (startTime - lastTimeLog >= 20) {
        processedText += currentSentence.trim() + "\n" + formatTime(startTime) + "\n"
        lastTimeLog = startTime
      } else {
        processedText += currentSentence.trim() + "\n"
      }
      currentSentence = ""
    }
  })

  if (currentSentence) {
    processedText += currentSentence.trim() + "\n"
  }

  return processedText.trim()
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `**${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}**`
}

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get("file")

    const buffer = Buffer.from(await file.arrayBuffer())
    const blob = new Blob([buffer], { type: file.type })
    const fileObject = new File([blob], file.name, { type: file.type })

    const transcription = await openai.audio.transcriptions.create({
      file: fileObject,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
      speaker_detection: 2
    })
  
    const processedTranscript = processTranscription(transcription.segments)

    console.log(processedTranscript)
    return NextResponse.json({ transcript: processedTranscript })
  } catch (error) {
    console.error("Error transcribing audio:", error)
    return NextResponse.json({ error: "An error occurred during transcription" }, { status: 500 })
  }
}