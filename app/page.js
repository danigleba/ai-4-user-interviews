"use client"
import { useEffect, useState, useCallback } from "react"
import ReactMarkdown from "react-markdown"
import supabaseAdmin from "@/utils/supabaseAdmin"
import { v4 as uuidv4 } from "uuid"
import Cookies from "js-cookie"
import { useDropzone } from "react-dropzone"
import Header from "@/components/Header"

export default function Home() {
  const [userData, setUserData] = useState(null)
  const [file, setFile] = useState(null)
  const [transcript, setTranscript] = useState("")
  const [gptResponse, setGptResponse] = useState("")
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [interviewQuestions, setInterviewQuestions] = useState([])

  const getAuth = async () => {
      try {
          const response = await fetch("/api/auth/getAuth", {
              method: "POST",
              headers: {
              "Content-Type": "application/json",
              },
              body: JSON.stringify({ access_token: Cookies.get("sb-access-token") })
          })
          const data = await response.json()
          setUserData(data.data)
          
      } catch (error) {
          console.log("Error fetching data")
      } 
  }

  useEffect(() => {
      getAuth()
  }, [])

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
      await setTranscript(data.transcript)
    } catch (error) {
      console.error("Error transcribing video:", error)
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleGptQuery = async () => {
    if (!transcript) return
    const customPrompt = `Analyze this video transcript of a user interview for a software product and provide the following answers to these questions:
    ${interviewQuestions.join("\n")}
    
    Please structure your response clearly with these questions and answers.`
    
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
      await setGptResponse(JSON.parse(data.answer))
    } catch (error) {
      console.error("Error querying GPT:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveVideoAnalysis = async () => {
    try {
      const fileExt = file.path.split(".").pop()
      const fileNameID = `/${ userData.email }/${uuidv4()}.${fileExt}`
      const formData = new FormData()
      formData.append("file", file)

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from("recordings")
          .upload(fileNameID, formData, {
              contentType: "video/mp4"
          })

      const { data: { publicUrl } } = supabaseAdmin.storage
          .from("recordings")
          .getPublicUrl(fileNameID)

      const response = await fetch("/api/db/saveVideoAnalysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transcript: transcript, gptResponse: gptResponse, publicUrl: publicUrl})
      })
      const data = await response.json()
    } catch (error) {
      console.error("Error saving transcript:", error)
    }
  }

  useEffect(() => {
    if (transcript) {
      handleGptQuery()
    }
  }, [transcript])

  useEffect(() => {
    if (gptResponse) saveVideoAnalysis()
  }, [gptResponse])

  return (
    <>
      <Header userData={userData}/>
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="bg-white rounded-xl p-8 max-w-2xl w-full border border-gray-300">
          <div className="flex flex-col space-y-6 items-center">
            <div {...getRootProps()} className="w-full cursor-pointer">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Upload Interview Video</h2>
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
            <div className="space-y-6">
              {gptResponse.company && <ReactMarkdown className="prose max-w-none">{`**Company:** ${gptResponse.company}`}</ReactMarkdown>}
              {gptResponse.answers && gptResponse.answers.map((qa, index) => (
                <div key={index} className="mb-4">
                  <ReactMarkdown className="prose max-w-none">{`**${qa.question}**`}</ReactMarkdown>
                  <ReactMarkdown className="prose max-w-none">{qa.answer}</ReactMarkdown>
                  <button className="bg-black text-white" onClick={() => saveVideoAnalysis()}>{file?.path}</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}