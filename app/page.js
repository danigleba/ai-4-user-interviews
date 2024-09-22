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
          <div className="flex-box flex-col text-center gap-6">
            <div className="space-y-3">
              <p className="text-2xl font-bold text-gray-900">Upload a new Call</p>
              <p className="text-gray-600 font-medium">When you upload a new call, it will be transcribed and analyzed to provide valuable insights.</p>
            </div>
            <button onClick={() => document.getElementById("newCall").showModal()} className="button-primary w-max">Upload Call</button>
          </div>
        </div>
      </div>
    </>
  )
}