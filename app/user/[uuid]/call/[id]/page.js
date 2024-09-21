"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import ReactMarkdown from "react-markdown"
import Cookies from "js-cookie"
import Header from "@/components/Header"

export default function Home() {
  const router = useRouter()
  const { id } = useParams()
  const [userData, setUserData] = useState(null)
  const [call, setCall] = useState([])

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
      setCall(data.data.find(call => call.id == id))      
  } catch (error) {
      console.log("Error fetching data")
  } 
  }

  useEffect(() => {
    getAuth()
  }, [])

  useEffect(() => {
    if (userData) getUserPosts()
  }, [userData])

  useEffect(() => {
    if (call) console.log(call)
  }, [call])

  return (
    <>
        <Header userData={userData}/>
        <div className="max-w-4xl mx-auto px-4 py-8">
            {call && (
                <div className="space-y-8">
                    <div className="border-b pb-4">
                        <h1 className="text-3xl font-bold text-gray-900">{call?.name}</h1>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Video Interview</h2>
                            {call?.video_url && (
                                <div className="aspect-w-16 aspect-h-9">
                                    <video className="w-full h-full rounded-lg shadow-lg" controls>
                                        <source src={call?.video_url} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            )}
                            <details className="bg-white rounded-lg shadow">
                                <summary className="cursor-pointer p-4 font-semibold text-gray-800">Show Transcript</summary>
                                <div className="p-4">
                                    <p className="text-gray-700 whitespace-pre-wrap">{call?.transcript}</p>
                                </div>
                            </details>
                        </div>
                        
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Interview Details</h2>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <p><span className="font-medium">Company:</span> <ReactMarkdown className="inline">{call?.analysis?.company}</ReactMarkdown></p>
                                <p><span className="font-medium">Interviewee:</span> <ReactMarkdown className="inline">{call?.analysis?.interviewee_name}</ReactMarkdown></p>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Analysis</h2>
                        <div className="space-y-6">
                            {call?.analysis && call?.analysis?.answers.map((qa, index) => (
                                <div key={index} className="bg-white rounded-lg shadow p-4">
                                    <h3 className="font-medium text-gray-900 mb-2">{qa.question}</h3>
                                    <p className="text-gray-700">{qa.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    </>
  )
}