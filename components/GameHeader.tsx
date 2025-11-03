"use client"
import { Clock, Users } from "lucide-react"
import { Button } from "./ui/button"
import DeletePlayer from "@/app/api/player/delete/page"
import { toast } from "@/lib/hooks/toastHooks"
import { useRouter } from "next/navigation"

interface GameHeaderProps {
    roomCode: string
    currentRound: number
    totalRounds: number
    timeRemaining: number
}

export function GameHeader({ roomCode, currentRound, totalRounds, timeRemaining }: GameHeaderProps) {
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60

    const router = useRouter()

    return (
        <header className="w-full bg-card border-b-4 border-primary/20 px-6 py-4 rounded-b-2xl shadow-sm">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 px-4 py-2 rounded-xl border-2 border-primary/30">
                        <span className="text-sm font-semibold text-muted-foreground">Room Code</span>
                        <p className="text-xl font-bold text-primary tracking-wider">{roomCode}</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-xl">
                        <Users className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-foreground">
                            Round {currentRound} of {totalRounds}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 bg-accent px-4 py-2 rounded-xl border-2 border-primary/20">
                        <Clock className="w-5 h-5 text-primary" />
                        <span className="text-xl font-bold text-foreground tabular-nums">
                            {minutes}:{seconds.toString().padStart(2, "0")}
                        </span>
                    </div>
                    <Button
                        onClick={async () => {
                            const { success, message } = await DeletePlayer();

                            if (!success) {
                                toast({
                                    title: "Could not leave room",
                                    description: message,
                                    variant: "destructive",
                                })
                                return
                            }

                            router.push("/join")
                        }}
                    >
                        Leave
                    </Button>
                </div>
            </div>
        </header>
    )
}
