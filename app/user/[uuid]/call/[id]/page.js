"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import ReactMarkdown from "react-markdown"
import Cookies from "js-cookie"
import Header from "@/components/Header"
import NewCallModal from "@/components/NewCallModal"

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
        <NewCallModal userData={userData} getUserPosts={getUserPosts}/>
        <div className="w-full mx-auto px-4 md:px-24 py-8 space-y-6">
            {call && (
                <>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{call?.analysis?.interviewee_name}</h1>
                        <p className="text-gray-500">At {call?.analysis?.company}</p>
                    </div>
                    <div className="flex items-start w-full gap-12">
                        <div className="w-full">
                            <div className="space-y-4 w-full">
                                {call?.video_url && (
                                    <div className="w-full">
                                        <video className="w-full h-full rounded-2xl" controls>
                                            <source src={call?.video_url} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                )}
                                <div className="border border-gray-200 rounded-2xl p-6 max-h-[calc(100vh-100px)] overflow-y-auto">
                                    <ReactMarkdown 
                                    className="text-gray-700 font-base whitespace-pre-wrap"
                                    components={{
                                        p: ({ children }) => <p className="">{children}</p>
                                    }}
                                    >
                                    {call?.transcript?.replace(/\n/g, "\n\n")}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                        <div className="w-full max-w-2xl mx-auto">
                            <h2 className="text-xl font-extrabold mb-4 text-gray-800">Q&A</h2>
                            <div className="space-y-4">
                                {call?.analysis?.answers?.map((qa, index) => (
                                    <div key={index} className="border-b border-gray-200 pb-4">
                                        <h3 className="text-base font-semibold text-gray-900 mb-2">{qa.question}</h3>
                                        <p className="text-sm text-gray-700">{qa.answer}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    </>
  )
}