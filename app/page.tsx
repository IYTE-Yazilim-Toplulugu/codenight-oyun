"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import Cookies from "js-cookie"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import LoginUser from "./api/user/login/page"
import { checkApiKey } from "@/lib/util/fal"
import Link from "next/link"
import UserRegister from "./api/user/register/page"
import { MUser } from "@/lib/models/User"

export default function LoginPage() {

    const router = useRouter()

    const [name, setName] = useState("")
    const [apiKey, setApiKey] = useState("")

    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {

        const checkApiKeyAsync = async () => {
            const apiKey = Cookies.get("apiKey")
            console.log("Stored API Key:", apiKey)

            const isValid = await checkApiKey(apiKey || "")
            console.log("API Key valid:", isValid)

            if (isValid) {
                router.push("/join")
            }
        }

        checkApiKeyAsync()
    }, [])

    const handleLogin = async (e: React.FormEvent) => {

        e.preventDefault()
        setIsLoading(true)

        const { success, message } = await UserRegister({ username: name, api_key: apiKey } as MUser)

        if (success) {
            // Store credentials in localStorage
            Cookies.set("username", name)
            Cookies.set("apiKey", apiKey)

            router.push("/join")
        }

        setIsLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-400 via-pink-400 to-blue-400 p-4">
            <Card className="w-full max-w-md shadow-xl border-2">
                <CardHeader className="space-y-2 text-center">
                    <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-2">
                        <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                        </svg>
                    </div>
                    <CardTitle className="text-3xl font-bold text-balance">Welcome to Draw & Guess!</CardTitle>
                    <CardDescription className="text-base">Enter your details to start playing</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Your Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="apiKey" className="text-sm font-medium">
                                API Key
                            </Label>
                            <Input
                                id="apiKey"
                                type="password"
                                placeholder="Enter your API key"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                required
                                className="h-11"
                            />
                            <Link
                                href={"https://fal.ai/dashboard/keys"}
                                target="_blank"
                                className="text-gray-500 hover:underline"
                            >
                                Get your api key here
                            </Link>
                        </div>
                        <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Continue"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

