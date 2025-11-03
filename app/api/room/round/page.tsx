"use server"

import {getUserIdFromCookie} from "@/lib/util/auth";
import supabase from "@/lib/api/supabase/supabase";
import {ROUND_TIMESPAN} from "@/lib/models/Round";

export default async function RoundRoom(roomCode: string) {
    const userId = await getUserIdFromCookie();

    if (!userId)
        return {
            success: false,
            message: "Forbidden",
            isDone: false
        };

    const { error: errorFetch, data: dataFetch } = await supabase.from("rooms")
        .select("round_ends_at,current_round,round_count,id")
        .eq("short_code", roomCode).single();

    if (errorFetch){
        return {
            success: false,
            message: "Error while fetching room: " + errorFetch.message,
            isDone: false
        };
    }

    if (!dataFetch || dataFetch.round_ends_at > new Date()) {
        return {
            success: false,
            message: "Invalid room.",
            isDone: false
        };
    }

    const isDone = dataFetch.current_round >= dataFetch.round_count;

    const { error } = await supabase.from("rooms")
        .update({
            round_ends_at: isDone ? null : new Date(Date.now() + ROUND_TIMESPAN),
            current_round: isDone ? -1 : dataFetch.current_round + 1,
        }).eq("id", dataFetch.id);

    if (error){
        return {
            success: false,
            message: error.message,
            isDone: false
        };
    }

    return {
        success: true,
        isDone: isDone,
        message: "OK"
    };
}