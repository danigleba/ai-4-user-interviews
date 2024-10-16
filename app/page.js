"use client"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import Header from "@/components/Header"
import NewCallModal from "@/components/NewCallModal"

export default function Home() {
  const router = useRouter()
  const [userData, setUserData] = useState(null)
  const [userCalls, setUserCalls] = useState([])

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
          if (data.data) setUserData(data.data)
          else router.push("/login")
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

  useEffect(() => {
    getAuth()
  }, [])

  useEffect(() => {
    if (userData) getUserPosts()
  }, [userData])
  return (
    <>
      <Header userData={userData}/>
      <NewCallModal userData={userData} getUserPosts={getUserPosts}/>
      <div className="bg-[#F5F5F2] w-full mx-auto px-4 md:px-6 py-8 pb-24">
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
                  className="rounded-2xl cursor-pointer space-y-3 hover:bg-white p-3"
                >
                  <div className="relative pt-[56.25%]">
                    <video 
                      className="absolute top-0 left-0 w-full h-full object-cover rounded-xl"
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="bg-white py-12 rounded-xl">
          <div className="flex-box flex-col text-center gap-6">
            <div className="space-y-3">
              <p className="text-2xl font-bold text-gray-900">Upload a new Call</p>
              <p className="text-gray-600 font-medium">Upload the mp4 file of your call to get it's AI analysis, Q&As and transcript.</p>
            </div>
            <button onClick={() => document.getElementById("newCall").showModal()} className="button-primary w-max">Add Call</button>
          </div>
        </div>
      </div>
    </>
  )
}