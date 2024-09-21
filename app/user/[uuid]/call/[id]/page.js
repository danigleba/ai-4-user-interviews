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
        <div className="min-h-screen flex flex-col items-center justify-start p-8 space-y-12">
            <div className="bg-white rounded-xl p-8 w-full">
                {call && (
                    <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/2 pr-4">
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">{call?.name}</h2>
                            {call?.video_url && (
                                <video className="w-full h-auto rounded-lg mt-2 bg-black" controls>
                                    <source src={call?.video_url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            )}
                            
                            <div className="mt-4">
                                <h3 className="text-xl font-bold mb-2 text-gray-900">Transcript</h3>
                                <p className="text-gray-700">{call?.transcript}</p>
                            </div>
                        </div>
                        <div className="md:w-1/2 pl-4 mt-4 md:mt-0">
                            <h3 className="text-xl font-bold mb-2 text-gray-900">Analysis</h3>
                            <ReactMarkdown className="prose max-w-none">{call?.analysis?.company}</ReactMarkdown>
                            <ReactMarkdown className="prose max-w-none">{call?.analysis?.interviewee_name}</ReactMarkdown>
                            <div className="space-y-4">
                                {call?.analysis && call?.analysis?.answers.map((qa, index) => (
                                    <div key={index} className="mb-4">
                                        <p className="font-bold text-gray-900">{qa.question}</p>
                                        <p className="text-gray-700">{qa.answer}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </>
  )
}