"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

import { Loader2 } from "lucide-react"

import { GameHeader } from "@/components/GameHeader"
import { PlayerCard } from "@/components/shared/PlayerCard"
import { ResultBook } from "@/components/ResultBook"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type GameState = "WAITING" | "GUESSING" | "RESULTS"

interface Player {
    id: string
    name: string
    status: "done" | "active" | "waiting"
}

type RoomPageProps = {
    params: {
        roomId: string; // This 'roomId' must match the folder name [roomId]
    }
};

export default function GameRoomPage({ params }: RoomPageProps) {
    const [gameState, setGameState] = useState<GameState>("WAITING")
    const [guess, setGuess] = useState("")
    const [timeRemaining, setTimeRemaining] = useState(45)
    const { roomId } = useParams()


    // Mock data for demonstration
    const players: Player[] = [
        { id: "1", name: "Alice", status: "done" },
        { id: "2", name: "Bob", status: "active" },
        { id: "3", name: "Carlos", status: "waiting" },
        { id: "4", name: "Diana", status: "waiting" },
    ]

    const mockResults = [
        {
            playerName: "Alice",
            type: "wrote" as const,
            content: "A cat flying a spaceship",
        },
        {
            playerName: "Bob",
            type: "guessed" as const,
            content: "",
            imageUrl: "/placeholder.svg?height=300&width=400",
        },
        {
            playerName: "Carlos",
            type: "guessed" as const,
            content: "A rocket cat",
        },
        {
            playerName: "Diana",
            type: "guessed" as const,
            content: "",
            imageUrl: "/placeholder.svg?height=300&width=400",
        },
    ]

    // Timer countdown
    useEffect(() => {
        if (gameState === "GUESSING" && timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining((prev) => prev - 1)
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [gameState, timeRemaining])

    const handleSubmitGuess = () => {
        if (guess.trim()) {
            console.log("Submitted guess:", guess)
            setGuess("")
            // Transition to results after submission
            setTimeout(() => setGameState("RESULTS"), 500)
        }
    }

    const handlePlayAgain = () => {
        setGameState("WAITING")
        setTimeRemaining(45)
        setGuess("")
        // Simulate starting a new round
        setTimeout(() => setGameState("GUESSING"), 2000)
    }

    // Demo: Auto-transition through states
    useEffect(() => {
        if (gameState === "WAITING") {
            const timer = setTimeout(() => setGameState("GUESSING"), 3000)
            return () => clearTimeout(timer)
        }
    }, [gameState])

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Header Area */}
            <GameHeader roomCode={roomId as string} currentRound={1} totalRounds={8} timeRemaining={timeRemaining} />

            {/* Main Content Area */}
            <div className="flex-1 flex gap-6 p-6 max-w-7xl mx-auto w-full">
                {/* Left Column - Player List */}
                <aside className="w-64 flex-shrink-0">
                    <div className="bg-card rounded-2xl border-2 border-border p-4 shadow-sm sticky top-6">
                        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            Players
                        </h2>
                        <div className="space-y-3">
                            {players.map((player) => (
                                <PlayerCard key={player.id} name={player.name} status={player.status} />
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Right Column - Image Container */}
                <main className="flex-1 flex flex-col">
                    <div className="flex-1 bg-card rounded-2xl border-2 border-border p-8 shadow-sm flex items-center justify-center">
                        {gameState === "WAITING" && (
                            <div className="text-center space-y-4">
                                <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
                                <h3 className="text-2xl font-bold text-foreground">Waiting for players...</h3>
                                <p className="text-muted-foreground">The game will start soon!</p>
                            </div>
                        )}

                        {gameState === "GUESSING" && (
                            <div className="w-full max-w-2xl space-y-6">
                                <h3 className="text-2xl font-bold text-center text-foreground mb-6">What do you see?</h3>
                                <div className="rounded-2xl overflow-hidden border-4 border-primary/20 shadow-lg">
                                    <img src="/placeholder.svg?height=400&width=600" alt="Image to guess" className="w-full h-auto" />
                                </div>
                            </div>
                        )}

                        {gameState === "RESULTS" && <ResultBook results={mockResults} />}
                    </div>
                </main>
            </div>

            {/* Input Footer Area */}
            <footer className="border-t-4 border-primary/20 bg-card">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    {gameState === "WAITING" && (
                        <div className="flex items-center justify-center gap-4 opacity-50">
                            <Textarea placeholder="Your guess will appear here..." disabled className="max-w-2xl rounded-xl" />
                            <Button size="lg" disabled className="rounded-xl px-8">
                                Submit
                            </Button>
                        </div>
                    )}

                    {gameState === "GUESSING" && (
                        <div className="flex items-center justify-center gap-4">
                            <Textarea
                                placeholder="Type your guess here..."
                                value={guess}
                                onChange={(e) => setGuess(e.target.value)}
                                className="max-w-2xl rounded-xl resize-none h-24 text-lg"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSubmitGuess()
                                    }
                                }}
                            />
                            <Button
                                size="lg"
                                onClick={handleSubmitGuess}
                                disabled={!guess.trim()}
                                className="rounded-xl px-8 h-24 text-lg font-semibold"
                            >
                                Submit
                            </Button>
                        </div>
                    )}

                    {gameState === "RESULTS" && (
                        <div className="flex items-center justify-center">
                            <Button size="lg" onClick={handlePlayAgain} className="rounded-xl px-12 py-6 text-lg font-semibold">
                                Play Again
                            </Button>
                        </div>
                    )}
                </div>
            </footer>
        </div>
    )
}
