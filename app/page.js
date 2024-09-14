"use client"
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"

export default function Home() {
  const [file, setFile] = useState(null)
  const [transcript, setTranscript] = useState("")
  const [gptResponse, setGptResponse] = useState("")
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)

  const handleFileUpload = (event) => {
    setFile(event.target.files[0])
  }

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
    setShowAnalysis(true)
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
      setGptResponse(data.answer)
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-green-100 flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-2xl w-full border border-blue-200 transition-all duration-300 hover:shadow-lg">
        <div className="flex flex-col space-y-6 items-center">
          <input 
            type="file" 
            onChange={handleFileUpload} 
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          <button 
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-3 rounded-full hover:from-blue-600 hover:to-green-600 transition duration-300 ease-in-out flex items-center shadow-md hover:shadow-lg" 
            onClick={handleTranscribe}
            disabled={isTranscribing || isAnalyzing}
          >
            {isTranscribing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Transcribing...
              </>
            ) : isAnalyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              "Transcribe and Analyze Video"
            )}
          </button>
        </div>
      </div>
      {gptResponse && (
        <div className="mt-8 bg-white rounded-xl shadow-md p-8 max-w-2xl w-full border border-blue-200 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">GPT Analysis:</h2>
          <ReactMarkdown className="prose max-w-none">{gptResponse}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}