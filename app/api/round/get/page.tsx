"use server"

import {getUserIdFromCookie} from "@/lib/util/auth";
import supabase from "@/lib/api/supabase/supabase";
import {MRoom} from "@/lib/models/Room";
import {getUTCDate} from "@/lib/utils";

function getNextRoundNumber(playerNumber: number, totalRounds: number): number {
    let num = playerNumber - 1;

    if (num <= 0){
        num = totalRounds;
    }

    return num;
}

async function pullNextEntry(playerNumber: number, room: MRoom){
    const pullPlayerNumber = getNextRoundNumber(playerNumber, room.round_count!);

    const { error: errorEntryFetch, data: dataEntry } = await getEntry(room.id, room.current_round! - 1, pullPlayerNumber);

    if (errorEntryFetch){
        return {
            success: false,
            error: errorEntryFetch.message,
            entry: null
        };
    }

    if (dataEntry == null){
        const otherNum = getNextRoundNumber(pullPlayerNumber, room.round_count!);

        return await pullNextEntry(otherNum, room);
    }

    return {
        success: true,
        entry: dataEntry.image as string | null
    };
}

function getEntry(roomId: string, roundNum: number, num: number){
    return supabase.from("round_entries")
        .select("image, players!inner(player_number)")
        .eq("players.player_number", num)
        .eq("round_id", roundNum)
        .eq("room_id", roomId).single();
}

export default async function GetRound(roomId: string){
    const userId = await getUserIdFromCookie();

    if (!userId)
        return {
            success: false,
            message: "Forbidden",
            roundInfo: null
        };

    const { data: dataRoom, error: errorRoomFetch } = await supabase.from("rooms")
        .select<"*", MRoom>().eq("id", roomId).maybeSingle();

    if (errorRoomFetch){
        return {
            success: false,
            message: "Error while fetching room: " + errorRoomFetch.message,
            roundInfo: null
        };
    }

    if (!dataRoom || dataRoom.current_round == null || dataRoom.current_round <= 0 || dataRoom.round_ends_at! < getUTCDate()){
        return {
            success: false,
            message: "Invalid room.",
            roundInfo: null
        };
    }

    if (dataRoom.current_round == 1){
        return {
            success: true,
            message: "First round.",
            roundInfo: null
        };
    }

    const { data: playerData, error: errorPlayerFetch } = await supabase
        .from("players")
        .select("player_number")
        .eq("user_id", userId)
        .eq("room_id", dataRoom.id).single();

    if (errorPlayerFetch){
        return {
            success: false,
            message: "Error while fetching player: " + errorPlayerFetch.message,
            roundInfo: null
        };
    }

    const playerNumber = playerData?.player_number as number | null;

    if (!playerNumber || playerNumber <= 0){
        return {
            success: false,
            message: "Player could not be found.",
            roundInfo: null
        };
    }

    const { success: entryPullSuccess, entry, error: entryPullError } = await pullNextEntry(playerNumber, dataRoom);

    return {
        success: entryPullSuccess,
        message: entryPullSuccess ? "OK" : "Error while pulling the next entry: " + entryPullError,
        roundInfo: entryPullSuccess ? {
            roundNumber: dataRoom.current_round,
            image: entry
        } : null
    };
}