"use client"
import { useEffect, useState, useCallback } from "react"
import ReactMarkdown from "react-markdown"
import { useDropzone } from "react-dropzone"

export default function Home() {
  const [file, setFile] = useState(null)
  const [transcript, setTranscript] = useState("")
  const [gptResponse, setGptResponse] = useState("")
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleTranscribe = async () => {    
    if (!file) {
      console.error("No file selected")
      return
    }

    setIsTranscribing(true)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData
      })
      const data = await response.json()
      setTranscript(data.transcript)
    } catch (error) {
      console.error("Error transcribing video:", error)
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleGptQuery = async () => {
    if (!transcript) return
    const customPrompt = `Analyze this video transcript of a user interview for a software product and provide the following:
    1. A short summary of the interview
    2. Main user pain points identified
    3. Key user requests or feature suggestions
    4. Any bug reports or issues mentioned

    Please structure your response clearly with these four sections.`
    
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: customPrompt,
          transcript: transcript
        })
      })
      const data = await response.json()
      console.log(JSON.parse(data.answer))
      setGptResponse(JSON.parse(data.answer))
    } catch (error) {
      console.error("Error querying GPT:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  useEffect(() => {
    if (transcript) {
      handleGptQuery()
    }
  }, [transcript])

  useEffect(() => {
    console.log(gptResponse.company)
  }, [gptResponse])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full border border-gray-300">
        <div className="flex flex-col space-y-6 items-center">
          <div {...getRootProps()} className="w-full cursor-pointer">
            <input {...getInputProps()} />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {isDragActive ? (
                <p>Drop the file here ...</p>
              ) : (
                <p>Drag and drop a file here, or click to select a file</p>
              )}
            </div>
          </div>
          {file && <p className="text-sm text-gray-600">Selected file: {file.name}</p>}
          <button 
            className="bg-gray-900 text-white" 
            onClick={handleTranscribe}
            disabled={isTranscribing || isAnalyzing || !file}
          >
            {isTranscribing ? (
              <div className="flex-box">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Transcribing
              </div>
            ) : isAnalyzing ? (
              <div className="flex-box">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing
              </div>
            ) : (
              "Analyze Interview"
            )}
          </button>
        </div>
      </div>
      {gptResponse && (
        <div className="mt-8 bg-white rounded-xl p-8 max-w-2xl w-full border border-gray-300">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">{gptResponse.interviewee_name}</h2>
          <div className="space-y-3">
            {gptResponse.company && <ReactMarkdown className="prose max-w-none">{`**Company:** ${gptResponse.company}`}</ReactMarkdown>}
            {gptResponse.overview && <ReactMarkdown className="prose max-w-none">{`**Overview:** ${gptResponse.overview}`}</ReactMarkdown>}
            {gptResponse.problems && <ReactMarkdown className="prose max-w-none">{`**Problems:** ${gptResponse.problems}`}</ReactMarkdown>}
            {gptResponse.feedback && <ReactMarkdown className="prose max-w-none">{`**Feedback:** ${gptResponse.feedback}`}</ReactMarkdown>}
            {gptResponse.bugs && <ReactMarkdown className="prose max-w-none">{`**Bugs:** ${gptResponse.bugs}`}</ReactMarkdown>}
          </div>
        </div>
      )}
    </div>
  )
}