"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { floor } from "@floating-ui/utils";

import { Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Cookie from "js-cookie";

import { GameHeader } from "@/components/GameHeader"
import { PlayerCard } from "@/components/shared/PlayerCard"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import GetRoom, { GetFullRoom } from "@/app/api/room/get/page";
import { GetPlayerMeta, PlayerMeta } from "@/app/api/player/get/page";
import EntryRound from "@/app/api/round/entry/page";
import GetUserID from "@/app/api/user/get/page";
import StartRoom from "@/app/api/room/start/page";
import RoundRoom from "@/app/api/room/round/page";
import KickPlayer from "@/app/api/player/kick/page"
import { MRoom } from "@/lib/models/Room";
import { MRoundEntry } from "@/lib/models/Round";
import { toast } from "@/lib/hooks/toastHooks";
import { configure, generateImage } from "@/lib/util/fal";
import { getUTCDate } from "@/lib/utils";

type GameState = "WAITING" | "GUESSING" | "RESULTS"

type RoomPageProps = {
    params: {
        roomId: string;
    }
};

async function submit(prompt: string, roomId: string, image: string) {
    const { success, message } = await EntryRound({
        image: image,
        prompt: prompt,
        room_id: roomId
    });

    if (!success) {
        console.error("Submit error: ", message);
        toast({
            title: "Submission Failed",
            description: "There was an error submitting your entry. Please try again.",
            variant: "destructive",
        })
    }

    return success;
}

async function fetchPlayers(roomId: string) {
    const { success, message, players } = await GetPlayerMeta({ id: roomId });

    if (!success) {
        console.error("Player meta fetch failed: ", message);
        toast({
            title: "Player Fetch Failed",
            description: "There was an error fetching player data. Please try again.",
            variant: "destructive",
        })
        return;
    }

    return players;
}

async function fetchRoom() {
    const { success, message, room } = await GetRoom();

    if (!success) {
        console.error("Room fetch failed: ", message);
        toast({
            title: "Room Fetch Failed",
            description: "There was an error fetching room data. Please try again.",
            variant: "destructive",
        })
        return;
    }

    return room;
}

async function roundRoom(roomCode: string) {
    const { success, message, isDone } = await RoundRoom(roomCode);

    if (!success) {
        console.error("Rounding room failed: ", message);
        toast({
            title: "Round Failed",
            description: "There was an error progressing to the next round. Please try again.",
            variant: "destructive",
        })
        return;
    }

    if (!isDone) {
        setTimeout(async () => await roundRoom(roomCode), 1000);
    }
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

    const [userId, setUserId] = useState<string | null>(null);

    const { roomId } = useParams()

    const apiKey = Cookie.get("apiKey");

    function getRemainingTime() {
        if (room == null || room.round_ends_at == null) {
            return -2;
        }

        console.log(room.round_ends_at.getTime());
        console.log(getUTCDate());

        return floor((room.round_ends_at.getTime() - getUTCDate().getTime()) / 1000);
    }

    async function handleStartRoom() {

        if (!room) {
            return;
        }

        const { success, message } = await StartRoom(room.short_code);

        if (!success) {
            console.error("Room could not be started: ", message);
            toast({
                title: "Start Room Failed",
                description: "There was an error starting the room. Please try again.",
                variant: "destructive",
            })
            return
        }
        setGameState("GUESSING");
    }

    async function handleKickPlayer(kikcuser_id: string) {

        const { success, message } = await KickPlayer(kikcuser_id);

        if (!success) {
            console.error("Player couldn't kicked.", message);
            toast({
                title: "Kick Failed",
                description: "There was an error kicking the player. Please try again.",
                variant: "destructive",
            })
        }
    }

    useEffect(() => {
        if (apiKey) {
            configure(apiKey);
        }

        GetUserID().then(setUserId);

        fetchRoom().then(room => {
            setRoom(room);

            if (!room) {
                console.error("Room not found.");
                toast({
                    title: "Room Not Found",
                    description: "The specified room could not be found. Please check the room code and try again.",
                    variant: "destructive",
                })
                return;
            }

            if (room.current_round != null) {
                setGameState("GUESSING");
            }
            fetchPlayers(room.id).then(setPlayers);
        });
    }, [])

    useEffect(() => {
        const timer = window.setInterval(() => {
            if (room == null)
                return;

            const r = getRemainingTime();

            if (r >= 0)
                setRemaining(r);
            else if (remaining != 0)
                setRemaining(0);
        }, 1000);

        return () => window.clearInterval(timer);
    })

    useEffect(() => {
        const timer = window.setInterval(async () => {
            if (room == null)
                return;

            if (room.current_round == null) {
                const newRoom = await fetchRoom();
                setRoom(newRoom);
            }

            console.log("wide interval room accepted");

            const players = await fetchPlayers(room.id);
            setPlayers(players);

            if (room.current_round == null && gameState != "WAITING") {
                setGameState("WAITING");
            }

            if (room.creator_id === userId && remaining <= 0 && room.current_round != null) {
                //await roundRoom(room.short_code);
            }

            if (remaining <= 0 && submitted) {
                const success = await submit(guess, room.id, image!);
                if (!success) {
                    // toast
                }


            }

            //setGameState(remaining <= 0 ? "RESULTS" : "GUESSING");
        }, 5000);

        return () => window.clearInterval(timer);
    })

    const handleSubmitGuess = async () => {
        const finalGuess = guess.trim();

        if (finalGuess) {
            const image = await generateImage(finalGuess, (status) => {
                console.log(status.status);
            });

            if (image) {
                setImage(image);
            }
            else {
                console.error("Image could not be fetched.");
                toast({
                    title: "Image Generation Failed",
                    description: "There was an error generating the image. Please try again.",
                    variant: "destructive",
                })
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
                <aside className="w-64 shrink-0">
                    <div className="bg-card rounded-2xl border-2 border-border p-4 shadow-sm sticky top-6">
                        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            Players
                        </h2>

                        <div className="space-y-3">
                            {players &&
                                players.map((player) => (
                                    <motion.div
                                        key={player.users.id}
                                        className="relative flex items-center justify-between bg-muted/40 p-2 rounded-xl overflow-hidden"
                                        whileHover="hovered"
                                        initial="initial"
                                    >
                                        {/* Sol taraf: Player bilgisi */}
                                        <PlayerCard
                                            name={player.users.username}
                                            num={player.player_number}
                                        />

                                        {/* Sağ taraf: Kick butonu */}
                                        {room?.creator_id === userId && (
                                            <AnimatePresence>
                                                <motion.div
                                                    variants={{
                                                        initial: { opacity: 0, x: 40 },
                                                        hovered: { opacity: 1, x: 0 },
                                                    }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                                >
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="rounded-xl"
                                                        onClick={() => handleKickPlayer(player.users.id)}
                                                    >
                                                        Kick
                                                    </Button>
                                                </motion.div>
                                            </AnimatePresence>
                                        )}
                                    </motion.div>
                                ))}
                        </div>
                    </div>
                </aside>


                {/* Right Column - Image Container */}
                <main className="flex-1 flex flex-col">
                    <div className="flex-1 bg-card rounded-2xl border-2 border-border p-8 shadow-sm flex items-center justify-center">
                        {gameState === "GUESSING" && (
                            <div className="w-full max-w-2xl space-y-6">
                                <h3 className="text-2xl font-bold text-center text-foreground mb-6">What do you see?</h3>
                                <div className="rounded-2xl overflow-hidden border-4 border-primary/20 shadow-lg">
                                    <Image src={image} alt="image-guess" className="w-full h-auto" fill />
                                </div>
                            </div>
                        )}

                        {gameState === "WAITING" && (
                            <div className="text-center space-y-4">
                                <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
                                <h3 className="text-2xl font-bold text-foreground">Waiting for players...</h3>
                                <p className="text-muted-foreground">The game will start soon!</p>
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
                        <div className="flex flex-row items-center justify-center gap-4">
                            <div className="opacity-50">
                                <Textarea placeholder="Your guess will appear here..." disabled className="max-w-2xl rounded-xl" />
                            </div>
                            <div>
                                <Button size="lg" disabled className="rounded-xl px-8">
                                    Submit
                                </Button>
                            </div>
                            {room?.creator_id === userId && (
                                <div>
                                    <Button size="lg"
                                        className="rounded-xl"
                                        onClick={handleStartRoom}
                                    >
                                        Start the game!
                                    </Button>
                                </div>)}
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
