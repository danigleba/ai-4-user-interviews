import { useEffect, useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import supabaseAdmin from "@/utils/supabaseAdmin"
import { v4 as uuidv4 } from "uuid"

export default function NewCallModal({ userData, getUserPosts }) {
    const [file, setFile] = useState(null)
    const [transcript, setTranscript] = useState("")
    const [gptResponse, setGptResponse] = useState("")
    const [isTranscribing, setIsTranscribing] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [interviewQuestions, setInterviewQuestions] = useState([])

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
              transcript: transcript,
            })
          })
          const data = await response.json()
          console.log(data)
          await setGptResponse(JSON.parse(data.answer))
        } catch (error) {
          console.error("Error querying GPT:", error)
        } finally {
          setIsAnalyzing(false)
        }
    }
    
    const saveVideoAnalysis = async () => {
        setIsSaving(true)
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
          await getUserPosts()
          document.getElementById("newCall").close()
          setIsSaving(false)
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
        <dialog id="newCall" className="modal">
            <div className="modal-box space-y-6">
                <div>
                    <p className="text-2xl font-bold">Upload a recording</p>
                    <p className="text-gray-600 font-medium">Upload the recording of the call you want to analyze</p>
                </div>
                {!file && (
                    <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer">
                        <input {...getInputProps()} />
                        {isDragActive ? (
                        <p>Drop the file here ...</p>
                        ) : (
                        <p>Drag and drop a file here, or click to select a file</p>
                        )}
                    </div>
                )}
                {file &&
                    <div className="flex-box justify-start items-center gap-2">
                        <button onClick={() => setFile(undefined)} className="text-gray-600 hover:text-gray-900 w-max px-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="#6b7280">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-900" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="23 7 16 12 23 17 23 7" />
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </svg>
                            <p className="text-base font-medium text-gray-900">{file.name}</p>
                        </div>
                    </div>
                }
                <button 
                    className={`${!file ? "hidden" : ""} button-primary px-4 py-2 rounded transition-colors duration-200 flex items-center`} 
                    onClick={handleTranscribe}
                    disabled={isTranscribing || isAnalyzing || !file}
                >
                    {(isTranscribing || isAnalyzing || isSaving) && (
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {isTranscribing ? "Transcribing" : isAnalyzing ? "Analyzing" : isSaving ? "Saving" : "Analyze Call"}
                </button>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button id="ClosenewCall">close</button>
            </form>
        </dialog>
    )
  }
  
  /*<div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer">
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
</button>*/