"use server"

import {getUserIdFromCookie} from "@/lib/util/auth";
import supabase from "@/lib/api/supabase/supabase";
import {ROUND_TIMESPAN} from "@/lib/models/Round";
import {getUTCDate} from "@/lib/utils";

export default async function RoundRoom(roomId: string) {
    const userId = await getUserIdFromCookie();

    if (!userId)
        return {
            success: false,
            message: "Forbidden",
            isDone: false,
            isEarly: false
        };

    const { error: errorFetch, data: dataFetch } = await supabase.from("rooms")
        .select("round_ends_at,current_round,round_count,id")
        .eq("id", roomId).single();

    if (errorFetch){
        return {
            success: false,
            message: "Error while fetching room: " + errorFetch.message,
            isDone: false,
            isEarly: false
        };
    }

    if (!dataFetch || dataFetch.current_round == null) {
        return {
            success: false,
            message: "Invalid room.",
            isDone: false,
            isEarly: false
        };
    }

    console.log(dataFetch.round_ends_at > getUTCDate());
    if (dataFetch.round_ends_at > getUTCDate()){

        return {
            success: false,
            message: "OK",
            isDone: false,
            isEarly: true
        };
    }

    if (dataFetch.current_round === -1){
        return {
            success: true,
            message: "OK",
            isDone: true,
            isEarly: false
        };
    }

    const isDone = dataFetch.current_round >= dataFetch.round_count;

    const { error } = await supabase.from("rooms")
        .update({
            round_ends_at: isDone ? null : new Date(getUTCDate().getTime() + ROUND_TIMESPAN),
            current_round: isDone ? -1 : dataFetch.current_round + 1,
        }).eq("id", dataFetch.id);

    if (error){
        return {
            success: false,
            message: error.message,
            isDone: false,
            isEarly: false
        };
    }

    return {
        success: true,
        isDone: isDone,
        isEarly: false,
        message: "OK"
    };
}