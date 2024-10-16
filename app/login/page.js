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
        <div className="bg-[#F5F5F2] min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-3">
                <div href="/" className="text-xl font-bold text-gray-800 w-full text-center pb-6">🙊 User Talk</div>
                <h2 className="text-3xl font-bold text-gray-900 text-center w-full">Login</h2>
                <form className="space-y-6" onSubmit={(e) => login(e)}>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <span>Email</span>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="example@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <span>Password</span>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="button-primary w-full py-2 px-4 rounded-md">
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
