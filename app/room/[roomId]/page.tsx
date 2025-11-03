"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

import { Loader2 } from "lucide-react"

import { GameHeader } from "@/components/GameHeader"
import { PlayerCard } from "@/components/shared/PlayerCard"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {MRoom} from "@/lib/models/Room";
import {GetFullRoom} from "@/app/api/room/get/page";
import {GetPlayerMeta, PlayerMeta} from "@/app/api/player/get/page";
import EntryRound from "@/app/api/round/entry/page";
import {configure, generateImage} from "@/lib/util/fal";
import Cookie from "js-cookie";
import {MRoundEntry} from "@/lib/models/Round";

type GameState = "WAITING" | "GUESSING" | "RESULTS"

type RoomPageProps = {
    params: {
        roomId: string; // This 'roomId' must match the folder name [roomId]
    }
};

async function submit(prompt: string, roomId: string, image: string){
    const { success, message } = await EntryRound({
        image: image,
        prompt: prompt,
        room_id: roomId
    });

    if (!success){
        console.error("Submit error: ", message);
    }

    return success;
}

async function fetchPlayers(roomId: string){
    const { success, message, players } = await GetPlayerMeta({id: roomId});

    if (!success){
        console.error("Player meta fetch failed: ", message);
        return;
    }

    return players;
}

export default function GameRoomPage({ params }: RoomPageProps) {
    const [room, setRoom] = useState<MRoom | null>();
    const [players, setPlayers] = useState<PlayerMeta[] | null>();
    const [remaining, setRemaining] = useState<number>(0);
    const [gameState, setGameState] = useState<GameState>("WAITING");
    const [entry, setEntry] = useState<MRoundEntry | null>();

    const [image, setImage] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [guess, setGuess] = useState("")

    const { roomId } = useParams()

    const apiKey = Cookie.get("apiKey");

    function getRemainingTime(){
        if (room == null || room.round_ends_at == null){
            return -2;
        }

        return (room.round_ends_at.getTime() - Date.now()) / 1000.0;
    }

    useEffect(() => {
        if (apiKey){
            configure(apiKey);
        }

        GetFullRoom().then(x => {
            if (!x.success){
                console.error("Room fetch failed: ", x.message);
                return;
            }

            const room = x.room;
            setRoom(room);

            if (room?.current_round != null){
                setGameState("GUESSING");
            }
            fetchPlayers(room!.id).then(setPlayers);
        });
    }, [])

    useEffect(() => {
        const timer = window.setInterval(() => {
            if (room == null)
                return;

            const r = getRemainingTime();

            if (r >= 0)
                setRemaining(r);
        }, 1000);

        return () => window.clearInterval(timer);
    })

    useEffect(() => {
        const timer = window.setInterval(async () => {
            if (room == null)
                return;

            const players = await fetchPlayers(room.id);
            setPlayers(players);

            if (room.current_round == null && gameState != "WAITING"){
                setGameState("WAITING");
            }

            if (remaining <= 0 && submitted){
                const success = await submit(guess, room.id, image!);
                if (!success){
                    // toast
                }


            }

            setGameState(remaining <= 0 ? "RESULTS" : "GUESSING");
        }, 5000);

        return () => window.clearInterval(timer);
    })

    const handleSubmitGuess = async () => {
        const finalGuess = guess.trim();
        if (finalGuess) {
            console.log("Submitted guess:", finalGuess)
            const image = await generateImage(finalGuess, (status) => {
                console.log(status.status);
            });

            if (image){
                setImage(image);
            }
            else{
                console.error("Image could not be fetched.");

                // toast
            }
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Header Area */}
            <GameHeader roomCode={roomId as string} currentRound={room?.current_round ?? 0} totalRounds={room?.round_count ?? 0} timeRemaining={remaining} />

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
                            {players && players.map((player) => <PlayerCard key={player.users.id} name={player.users.username} num={player.player_number} />)}
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

                        {/*gameState === "RESULTS" && <ResultBook results={mockResults} />*/}
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
                                onKeyDown={async (e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        await handleSubmitGuess();
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
                            {/*<Button size="lg" onClick={handlePlayAgain} className="rounded-xl px-12 py-6 text-lg font-semibold">
                                Play Again
                            </Button>*/}
                        </div>
                    )}
                </div>
            </footer>
        </div>
    )
}
