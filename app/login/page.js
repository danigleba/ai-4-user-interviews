"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

export default function Login() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const login = async (e) => {
        e.preventDefault()

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: email, password: password })
            })
            const data = await response.json()
            if (data) {
                Cookies.set("sb-access-token", data.data.user.id, {expires: 30})            
                router.push("/")
            }
        } catch (error) {
          console.error("Error fetching data:", error)
        }  
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Sign in to your account</h2>
                <form className="space-y-4" onSubmit={(e) => login(e)}>
                    <div>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-gray-900 text-white rounded-md">
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
