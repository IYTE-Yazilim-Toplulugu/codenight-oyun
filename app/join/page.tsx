"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import Cookie from "js-cookie"
import { motion } from "framer-motion"

import Loading from "@/components/shared/Loading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MRoom, RoomCode, RoomCodeSchema } from "@/lib/models/Room"
import CreateRoom from "@/app/api/room/create/page"
import { useToast } from "@/lib/hooks/toastHooks"
import JoinRoom from "../api/room/join/page"
import { GetPlayer } from "../api/player/get/page"
import GetRoom from "../api/room/get/page"

export default function JoinRoomPage() {
    const router = useRouter()

    const [playerName, setPlayerName] = useState<string | null>(null)

    const [roomCode, setRoomCode] = useState("")
    const [roomCodeError, setRoomCodeError] = useState<string | null>(null)

    const [createRoomPopUp, setCreateRoomPopUp] = useState(false)

    const [isJoning, setIsJoning] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const { toast } = useToast()

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            // Check if user is logged in
            const name = Cookie.get("username")
            const apiKey = Cookie.get("apiKey")

            if (!name || !apiKey) {
                router.push("/")
                return
            }

            const { room } = await GetRoom()

            if (room) {
                router.push(`/room/${room.short_code}`)
            }

            setPlayerName(name)
            setIsLoading(false)
        }


        checkUserLoggedIn()
    }, [router])

    const handleRoomCodeChange = (value: string) => {
        // Convert to uppercase and limit to 8 characters
        const upperValue = value.toUpperCase().slice(0, 8);
        setRoomCode(upperValue);

        // Validate the room code in real-time
        if (upperValue.length === 0) {
            setRoomCodeError(null);
        } else if (upperValue.length < 8) {
            setRoomCodeError("Room code must be 8 characters long");
        } else {
            const result = RoomCodeSchema.safeParse(upperValue);
            if (!result.success) {
                setRoomCodeError("Room code can only contain letters and numbers");
            } else {
                setRoomCodeError(null);
            }
        }
    };

    const handleJoinRoom = async (room: Pick<MRoom, "short_code">) => {
        // Validate room code with Zod
        const result = RoomCodeSchema.safeParse(room.short_code)
        if (!result.success) {
            // Handle validation error (you might want to show a user-friendly error message)
            console.error("Invalid room code:", result.error)
            toast({
                title: "Invalid Room Code",
                description: "Please enter a valid room code.",
                variant: "destructive"
            })
            return
        }

        setIsJoning(true)

        const { success, message, roomCode } = await JoinRoom(room.short_code as RoomCode)
        console.log({ success, message, roomCode })

        if (success && roomCode) {
            router.push(`/room/${roomCode}`)
            return
        }

        if (success && !roomCode) {
            toast({
                title: "Room Not Found",
                description: "The room you are trying to join does not exist.",
                variant: "destructive"
            })
            setIsJoning(false)
            return
        }

        toast({
            title: "Failed to Join Room",
            description: message,
            variant: "destructive"
        })
        setIsJoning(false)
    }

    const handleCreateRoom = async (room: MRoom) => {
        setIsCreating(true)
        // Generate a random room code
        const { success, message, roomCode } = await CreateRoom(room)

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
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();

                            const formData = new FormData(e.target as HTMLFormElement);
                            const roomCode = formData.get('roomCode') as string;

                            handleJoinRoom({ short_code: roomCode } as MRoom);
                        }}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="roomCode" className="text-sm font-medium">
                                Room Code
                            </Label>
                            <Input
                                id="roomCode"
                                name="roomCode"
                                type="text"
                                placeholder="Enter room code"
                                value={roomCode}
                                onChange={(e) => handleRoomCodeChange(e.target.value)}
                                maxLength={8}
                                className={`h-11 text-center text-lg font-mono tracking-widest ${roomCodeError ? 'border-red-500' : ''}`}
                            />
                            {roomCodeError && (
                                <p className="text-sm text-red-500">{roomCodeError}</p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-semibold"
                            disabled={isJoning || !!roomCodeError || roomCode.length === 0}
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
