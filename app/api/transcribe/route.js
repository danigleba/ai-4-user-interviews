import { NextResponse } from "next/server"
import OpenAI from "openai"
import ffmpeg from "fluent-ffmpeg"
import fs from "fs/promises"
import path from "path"
import os from "os"
import { createRequire } from "module"

const require = createRequire(import.meta.url)
const ffmpegStaticPath = require("ffmpeg-static") 

ffmpeg.setFfmpegPath(ffmpegStaticPath)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

function convertMp4ToMp3(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .audioBitrate("64k") 
      .on("end", () => {
        resolve()
      })
      .on("error", (err) => {
        console.error("Error converting file:", err)
        reject(err)
      })
      .run()
  })
}

function processTranscription(segments) {
  let processedText = ""
  let lastTimeLog = 0
  let currentSentence = ""

  segments.forEach((segment) => {
    const startTime = segment.start
    currentSentence += segment.text.trim() + " "

    if (
      segment.text.trim().endsWith(".") ||
      segment.text.trim().endsWith("?") ||
      segment.text.trim().endsWith("!")
    ) {
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
  return `**${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}**`
}

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get("file")

    const tmpDir = os.tmpdir()
    const inputPath = path.join(tmpDir, file.name)
    const outputPath = path.join(tmpDir, file.name.replace(".mp4", ".mp3"))

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(inputPath, buffer)

    await convertMp4ToMp3(inputPath, outputPath)

    const mp3Buffer = await fs.readFile(outputPath)
    const blob = new Blob([mp3Buffer], { type: "audio/mpeg" })
    const fileObject = new File([blob], file.name.replace(".mp4", ".mp3"), { type: "audio/mpeg" })

    const transcription = await openai.audio.transcriptions.create({
      file: fileObject,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
      speaker_detection: 2
    })
  
    const processedTranscript = processTranscription(transcription.segments)

    await fs.unlink(inputPath)
    await fs.unlink(outputPath)

    return NextResponse.json({ transcript: processedTranscript })
  } catch (error) {
    console.error("Error processing transcription:", error)
    return NextResponse.json({ error: error.message || "An error occurred during transcription" }, { status: 500 })
  }
}