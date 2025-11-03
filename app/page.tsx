"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import Cookies from "js-cookie"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import LoginUser from "./api/user/login"
import { checkApiKey } from "@/lib/util/fal"
import Link from "next/link"
import UserRegister from "./api/user/register"
import { MUser } from "@/lib/models/User"
import Loading from "@/components/shared/Loading"
import { toast } from "@/lib/hooks/toastHooks"

export default function LoginPage() {

    const router = useRouter()

    const [name, setName] = useState("")
    const [apiKey, setApiKey] = useState("")
    const [apiKeyPopUp, setApiKeyPopUp] = useState<any>(false)

    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {

        const checkApiKeyAsync = async () => {
            const apiKey = Cookies.get("apiKey")

            if (apiKey) {
                const isValid = await checkApiKey(apiKey)
                if (isValid) {
                    router.push("/join")
                    return
                }
            }

            setIsLoading(false)
        }

        checkApiKeyAsync()
    }, [])

    const handleLogin = async (e: React.FormEvent) => {

        e.preventDefault()
        setIsSubmitting(true)

        const { success, message } = await UserRegister({ username: name, api_key: apiKey } as MUser)

        if (success) {
            Cookies.set("apiKey", apiKey)
            Cookies.set("username", name)
            router.push("/join")
            return
        }

        if (message === "API Key was wrong.") {

            setApiKeyPopUp(true)
        }
        if (message === "User not found.") {
            toast({
                title: "Login Failed",
                description: message,
                variant: "destructive",
            })
        }


        setIsSubmitting(false)
    }

    if (isLoading) return <Loading />

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-400 via-pink-400 to-blue-400 p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className=" shadow-xl border-2">
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
                        <CardTitle className="flex flex-row items-baseline justify-center text-3xl font-bold text-balance">
                            Welcome to <span className="ml-1 font-extrabold text-4xl text-purple-400">Drovi</span>!
                        </CardTitle>
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
                                {apiKeyPopUp && (
                                    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
                                        <Card className="w-full max-w-md">
                                            <CardHeader>
                                                <CardTitle > Geçerli bir api key girin! </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex justify-center">
                                                    <Link
                                                        href={"https://fal.ai/dashboard/keys"}
                                                        target="_blank"
                                                        className="text-gray-500 hover:underline"
                                                    >
                                                        Get your api key here
                                                    </Link>
                                                </div>
                                            </CardContent>
                                            <div className="flex justify-center p-4">
                                                <Button
                                                    className="flex justify-center items-center"
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setApiKeyPopUp(false)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                <Link
                                    href={"https://fal.ai/dashboard/keys"}
                                    target="_blank"
                                    className="text-gray-500 hover:underline"
                                >
                                    Get your api key here
                                </Link>
                            </div>
                            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isSubmitting}>
                                {isSubmitting ? "Logging in..." : "Continue"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}

