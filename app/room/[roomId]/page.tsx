"use client"
import { useState, useEffect, useRef } from "react"
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
import { GetFullRoom } from "@/app/api/room/get/page";
import { GetPlayerMeta, PlayerMeta } from "@/app/api/player/get/page";
import EntryRound from "@/app/api/round/entry/page";
import GetUserID from "@/app/api/user/get/page";
import StartRoom from "@/app/api/room/start/page";
import RoundRoom from "@/app/api/room/round/page";
import KickPlayer from "@/app/api/player/kick/page"
import { MRoom } from "@/lib/models/Room";
import { toast } from "@/lib/hooks/toastHooks";
import { configure, generateImage } from "@/lib/util/fal";
import GetRound from "@/app/api/round/get/page";
import SummaryRoom from "@/app/api/room/summary/page";
import { MRoundEntry } from "@/lib/models/Round";

type GameState = "WAITING" | "GUESSING" | "RESULTS"

type RoomPageProps = {
    params: {
        roomId: string;
    }
};

async function fetchPlayers(roomId: string) {
    const { success, message, players } = await GetPlayerMeta({ id: roomId });

    if (!success) {
        console.error("Player meta fetch failed: ", message);
        toast({
            title: "Player Fetch Failed",
            description: "There was an error fetching player data. Please try again.",
            variant: "destructive",
        })
        return null;
    }

    return players;
}

async function fetchRoom() {
    const { success, message, room } = await GetFullRoom();

    if (!success) {
        console.error("Room fetch failed: ", message);
        toast({
            title: "Room Fetch Failed",
            description: "There was an error fetching room data. Please try again.",
            variant: "destructive",
        })
        return null;
    }

    return room;
}

export default function GameRoomPage({ params }: RoomPageProps) {
    const roomRef = useRef<MRoom | null>(null);
    const currentTimeRef = useRef(0);
    const userIdRef = useRef<string | null>(null);

    const [players, setPlayers] = useState<PlayerMeta[] | null>();
    const [remaining, setRemaining] = useState<number>(-1);
    const [gameState, setGameState] = useState<GameState>("WAITING");
    const [currentRound, setCurrentRound] = useState<number>(0)
    const [summary, setSummary] = useState<Map<number, MRoundEntry[]> | null>();

    const [entry, setEntry] = useState<string | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [generating, setGenerating] = useState<boolean>(false);
    const [guess, setGuess] = useState("")

    const { roomId } = useParams()

    const apiKey = Cookie.get("apiKey");

    function getRemainingTime() {
        if (roomRef.current == null || roomRef.current.round_ends_at == null) {
            return -1;
        }

        return floor((roomRef.current.round_ends_at.getTime() - currentTimeRef.current) / 1000);
    }

    async function handleStartRoom() {

        if (!roomRef.current) {
            return;
        }

        const { success, message } = await StartRoom(roomRef.current.short_code);

        if (!success) {
            console.error("Room could not be started: ", message);
            toast({
                title: "Start Room Failed",
                description: "There was an error starting the roomRef. Please try again.",
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

    async function reloadRoom() {
        const room = await fetchRoom();
        const changed = room?.current_round != roomRef.current?.current_round;
        roomRef.current = room;
        setPlayers(room?.players);
        setCurrentRound(room?.current_round ?? 0);
        currentTimeRef.current = room?.currentTime ?? 0;

        if (!room) {
            console.error("Room could not be found.");
            toast({
                title: "Room Not Found",
                description: "The specified room could not be found. Please check the roomRef code and try again.",
                variant: "destructive",
            })
            return null;
        }

        console.log("current round " + room.current_round)
        if (room.current_round === -1){
            setGameState("RESULTS")
            if (changed){
                await loadSummary(room.id);
            }
        }
        else if (room.current_round != null) {
            setGameState("GUESSING");

            if (room.current_round != 1 && changed) {
                const { success, message, roundInfo } = await GetRound(room.id);
                if (!success) {
                    console.error("Round could not be fetched: " + message);
                    setEntry(null);
                }
                else {
                    setEntry(roundInfo?.image ?? null);
                }

                console.log("refreshed");
                setImage(null);
                setGenerating(false);
                setSubmitted(false);
                setGuess("");
            }
        }
        else {
            setGameState("WAITING")
        }

        return room;
    }

    async function loadSummary(roomId: string) {
        const { success, message, data } = await SummaryRoom(roomId);

        if (!success) {
            console.error("Summary failed: " + message);
            return;
        }

        setSummary(data);
    }

    async function roundRoom(roomId: string) {
        const { success, message, isDone, isEarly } = await RoundRoom(roomId);

        console.log("rounded");
        if (!success) {
            console.error("Rounding room failed: ", message);
            toast({
                title: "Round Failed",
                description: "There was an error progressing to the next round. Please try again.",
                variant: "destructive",
            })
            return;
        }

        if (isEarly) {
            setTimeout(async () => await roundRoom(roomId), 1000);
            return;
        }

        if (isDone) {

        }
        else {
            await reloadRoom();

            console.log("not done, continue still");
        }
    }

    useEffect(() => {
        if (apiKey) {
            configure(apiKey);
        }

        GetUserID().then(x => userIdRef.current = x);

        // eslint-disable-next-line react-hooks/set-state-in-effect
        reloadRoom().then();
    }, [])

    useEffect(() => {
        const timer = window.setInterval(() => {
            currentTimeRef.current = currentTimeRef.current + 1000;

            if (roomRef == null)
                return;

            const r = getRemainingTime();

            if (r >= 0)
                setRemaining(r);
            else {
                setRemaining(0);

                /*if (r < 0)
                    console.log("Remaining is below zero: ", r);*/
            }
        }, 1000);

        return () => window.clearInterval(timer);
    }, [])

    useEffect(() => {
        let timerId: number;

        const runAsyncCode = async () => {
            try {
                const remaining = getRemainingTime();

                const isDone = remaining <= 0 && submitted;

                if (roomRef.current == null)
                    return;

                const r = await reloadRoom();

                if (r == null)
                    return;

                roomRef.current = r;

                if (
                    roomRef.current.creator_id === userIdRef.current &&
                    remaining != -1 && remaining <= 0 &&
                    roomRef.current.current_round != null &&
                    roomRef.current.current_round > 0) {

                    await roundRoom(roomRef.current.id);
                }

            } catch (error) {
                console.error("Error in interval:", error);
            } finally {
                timerId = window.setTimeout(runAsyncCode, 3000);
            }
        };

        timerId = window.setTimeout(runAsyncCode, 3000);

        return () => {
            window.clearTimeout(timerId);
        };
    }, []);

    const handleSubmitGuess = async () => {
        const finalGuess = guess.trim();

        if (finalGuess) {
            setGenerating(true);

            const image = await generateImage(finalGuess, (status) => {
                toast({
                    title: "Generating image",
                    description: "Status: " + status.status,
                    variant: "default"
                });
            });

            setGenerating(false);

            if (image) {
                setImage(image);
                console.log(image);
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

    const handleSend = async () => {
        const finalGuess = guess.trim();

        if (submitted || !finalGuess || !image || !roomRef.current)
            return;

        const { success, message } = await EntryRound({
            image: image,
            prompt: finalGuess,
            room_id: roomRef.current.id
        });

        if (success) {
            setSubmitted(true);
        }
        else {
            toast({
                title: "Submission Failed",
                description: "There was an error submitting your entry. Please try again.",
                variant: "destructive",
            })

            console.error("Error while sending the submission: ", message);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Header Area */}
            <GameHeader roomName={roomRef.current?.room_name ?? ""} roomCode={roomId as string} currentRound={currentRound} totalRounds={roomRef.current?.round_count ?? 0} showInfo={gameState === "GUESSING"} timeRemaining={remaining} />

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
                                        {roomRef.current?.creator_id === userIdRef.current && (
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
                                <h3 className="text-2xl font-bold text-center text-foreground mb-6">{image ? "What do you see?" : "We are waiting your prompt..."}</h3>
                                <div className="rounded-2xl overflow-hidden border-4 border-primary/20 shadow-lg">
                                    {entry && <Image src={entry} alt="image-guess" width={1080} height={1080} className={"aspect-square"} />}
                                    {image && <Image src={image} alt="image-guess" width={1080} height={1080} className={"aspect-square"} />}
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
                            {roomRef.current?.creator_id === userIdRef.current && (
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
                                disabled={submitted || generating}
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
                                disabled={!guess.trim() || submitted || generating}
                                className="rounded-xl px-8 h-8 text-lg font-semibold"
                            >
                                Submit
                            </Button>

                            <Button onClick={handleSend} size="lg" disabled={!image || generating || !guess.trim() || submitted} className="rounded-xl h-8 px-8">
                                Send
                            </Button>
                        </div>
                    )}

                    {gameState === "RESULTS" && (
                        <div className="flex items-center justify-center">
                            {summary && [...summary.keys()].map(round => {
                                const entries = summary.get(round);
                                return (
                                    <div className="flex flex-col m-4" key={round}>
                                        {entries && [...entries].map((entry, index) => (
                                            <div key={index} className="mb-8">
                                                {entry.prompt && (
                                                    <div className="mb-4">
                                                        <h3 className="text-xl font-semibold mb-2">Prompt: {entry.prompt}</h3>
                                                        <h3>Result: </h3>
                                                        <Image src={entry.image} alt={`Result ${index + 1}`} width={1000} height={1000} className="rounded-lg border-4 border-primary/20 shadow-lg" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </footer>
        </div>
    )
}
