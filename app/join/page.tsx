"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import Cookie from "js-cookie"
import { motion } from "framer-motion"

import Loading from "@/components/shared/Loading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MRoom, MRoomSchema, RoomcodeSchema } from "@/lib/models/Room"
import CreateRoom from "@/app/api/room/create/page"

export default function JoinRoomPage() {
    const router = useRouter()

    const [roomCode, setRoomCode] = useState("")
    const [playerName, setPlayerName] = useState("")

    const [createRoomPopUp, setCreateRoomPopUp] = useState<any>(false)

    const [isJoning, setIsJoning] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [isLoading, setIsLoading] = useState(true)


    useEffect(() => {
        // Check if user is logged in
        const name = Cookie.get("username")
        const apiKey = Cookie.get("apiKey")

        if (!name || !apiKey) {
            router.push("/")
            return
        }

        setPlayerName(name)
        setIsLoading(false)
    }, [router])

    const handleJoinRoom = (e: React.FormEvent) => {
        e.preventDefault()

        // Validate room code with Zod
        const result = RoomcodeSchema.safeParse(roomCode)
        if (!result.success) {
            // Handle validation error (you might want to show a user-friendly error message)
            console.error("Invalid room code:", result.error)
            alert("Please enter a valid 8-character room code")
            return
        }

        setIsJoning(true)

        // Navigate to game room
        setTimeout(() => {
            router.push(`/room/${roomCode}`)
        }, 500)
    }

    const handleCreateRoom = async (room: MRoom) => {
        setIsCreating(true)
        // Generate a random room code
        const { success, message, roomCode } = await CreateRoom(room)

        console.log({ success, message, roomCode })

        if (success && roomCode) {
            router.push(`/room/${roomCode}`)
        }

        setIsCreating(false)
        setCreateRoomPopUp(false)
    }

    if (isLoading) return <Loading />

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-400 via-pink-400 to-blue-400 p-4"
        >
            <Card className="w-full max-w-md shadow-xl border-2">
                <CardHeader className="space-y-2 text-center">
                    <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-2">
                        <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                    </div>
                    <CardTitle className="text-3xl font-bold text-balance">Hey, {playerName}!</CardTitle>
                    <CardDescription className="text-base">Join an existing room or create a new one</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleJoinRoom} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="roomCode" className="text-sm font-medium">
                                Room Code
                            </Label>
                            <Input
                                id="roomCode"
                                type="text"
                                placeholder="Enter room code"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                maxLength={8}
                                className="h-11 text-center text-lg font-mono tracking-widest"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-semibold"
                            disabled={isLoading || roomCode.length !== 8}
                        >
                            {isJoning ? "Joining..." : "Join Room"}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">Or</span>
                        </div>
                    </div>

                    <Button
                        onClick={() => setCreateRoomPopUp(true)}
                        variant="outline"
                        className="w-full h-11 text-base font-semibold border-2 bg-transparent"
                        disabled={isCreating}
                    >
                        Create New Room
                    </Button>
                    {createRoomPopUp && (
                        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
                            <Card className="w-full max-w-md">
                                <CardHeader>
                                    <CardTitle>Create New Room</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.target as HTMLFormElement);
                                        const roomName = formData.get('roomName') as string;
                                        handleCreateRoom({ room_name: roomName } as MRoom);
                                        setCreateRoomPopUp(false);
                                    }}>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="roomName">Room Name</Label>
                                                <Input
                                                    id="roomName"
                                                    name="roomName"
                                                    type="text"
                                                    placeholder="Enter room name"
                                                    required
                                                />
                                            </div>
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    disabled={isCreating}
                                                    onClick={() => setCreateRoomPopUp(false)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button type="submit" disabled={isCreating}
                                                >
                                                    Create Room
                                                </Button>
                                            </div>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
