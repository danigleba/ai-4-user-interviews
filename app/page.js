"use client"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"
import supabaseAdmin from "@/utils/supabaseAdmin"
import { v4 as uuidv4 } from "uuid"
import Cookies from "js-cookie"
import { useDropzone } from "react-dropzone"
import Header from "@/components/Header"

export default function Home() {
  const router = useRouter()
  const [userData, setUserData] = useState(null)
  const [userCalls, setUserCalls] = useState([])
  const [file, setFile] = useState(null)
  const [transcript, setTranscript] = useState("")
  const [gptResponse, setGptResponse] = useState("")
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [interviewQuestions, setInterviewQuestions] = useState([])

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })


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

  const getUserPosts = async () => {
    try {
      const response = await fetch("/api/db/getUserCalls", {
          method: "POST",
          headers: {
          "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: userData?.uuid })
      })
      const data = await response.json()
      setUserCalls(data.data)      
  } catch (error) {
      console.log("Error fetching data")
  } 
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
          transcript: transcript,
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
        body: JSON.stringify({ transcript: transcript, gptResponse: gptResponse, publicUrl: publicUrl, userId: userData.uuid, callName: gptResponse.call_name})
      })
      const data = await response.json()
      getUserPosts()
    } catch (error) {
      console.error("Error saving transcript:", error)
    }
  }

  useEffect(() => {
    getAuth()
  }, [])

  useEffect(() => {
    if (userData) getUserPosts()
  }, [userData])

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
      <div className="w-full mx-auto px-4 md:px-24 py-8">
        {userCalls && (
          <div className="mb-12 space-y-6">
            <div className="flex flex-col">
              <h2 className="text-2xl font-extrabold text-gray-900">My Calls</h2>
              <p className="text-gray-600">These are all the calls recorded by you</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {userCalls.map((call, index) => (
                <div 
                  key={index} 
                  onClick={() => router.push(`/user/${userData?.uuid}/call/${call?.id}`)} 
                  className="rounded-lg cursor-pointer transition-all duration-300 space-y-3"
                >
                  <div className="relative pt-[56.25%] hover:shadow-md ">
                    <video 
                      className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
                      muted
                      playsInline
                      onMouseEnter={(e) => {
                        e.target.currentTime = 1
                        e.target.play()
                      }}
                      onMouseLeave={(e) => {
                        e.target.pause()
                      }}
                      onEnded={(e) => {
                        e.target.pause()
                        e.target.currentTime = 1
                      }}
                    >
                      <source src={`${call?.video_url}#t=1,6`} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-xl text-gray-800">{call?.analysis?.interviewee_name}</h3>
                        <h3 className="font-light text-sm text-gray-800">{call?.analysis?.company}</h3>
                      </div>
                      <p className="flex-box gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7M5 12h16" />
                        </svg>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Add a new Call</h2>
          <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer">
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the file here ...</p>
            ) : (
              <p>Drag and drop a file here, or click to select a file</p>
            )}
          </div>
          {file && <p className="mt-2 text-sm text-gray-600">Selected file: {file.name}</p>}
          <button 
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors duration-200 cursor-pointer" 
            onClick={handleTranscribe}
            disabled={isTranscribing || isAnalyzing || !file}
          >
            {isTranscribing ? "Transcribing..." : isAnalyzing ? "Analyzing..." : "Analyze Call"}
          </button>
        </div>
        {gptResponse && (
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">{gptResponse.interviewee_name}</h2>
            {gptResponse.company && <p className="mb-4"><strong>Company:</strong> {gptResponse.company}</p>}
            {gptResponse.answers && gptResponse.answers.map((qa, index) => (
              <div key={index} className="mb-6">
                <h3 className="font-semibold mb-2">{qa.question}</h3>
                <p className="text-gray-700">{qa.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}