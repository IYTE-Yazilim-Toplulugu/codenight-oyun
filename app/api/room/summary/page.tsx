"use server";
import { getUserIdFromCookie } from "@/lib/util/auth";
import supabase from "@/lib/api/supabase/supabase";
import { MRoundEntry } from "@/lib/models/Round";

export default async function SummaryRoom(roomCode: string) {
    const userId = await getUserIdFromCookie();

    if (!userId)
        return {
            success: false,
            message: "Forbidden",
            data: null
        };

    const { error: errorFetch, data: dataFetch } = await supabase.from("rooms")
        .select("current_round,round_count,id")
        .eq("short_code", roomCode).single();

    if (errorFetch) {
        return {
            success: false,
            message: "Error while fetching room: " + errorFetch.message,
            data: null
        };
    }

    if (!dataFetch || dataFetch.current_round != -1) {
        return {
            success: false,
            message: "Invalid room.",
            data: null
        };
    }

    const { error, data } = await supabase.from("room_entries")
        .select<"*", MRoundEntry>()
        .eq("room_id", dataFetch.id)
        .order("created_at");

    if (error) {
        return {
            success: false,
            message: "Error while fetching entries: " + error.message,
            data: null
        };
    }

    return {
        success: true,
        message: "OK",
        data: Object.groupBy(data, (item, index) => item.round_id)
    };
}
