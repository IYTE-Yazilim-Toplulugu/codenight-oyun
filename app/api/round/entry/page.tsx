"use server"

import {MRoundEntry} from "@/lib/models/Round";
import {getUserIdFromCookie} from "@/lib/util/auth";
import supabase from "@/lib/api/supabase/supabase";

export default async function EntryRound(entry: Omit<MRoundEntry, "round_id" | "id" | "author_id">){
    const userId = await getUserIdFromCookie();

    if (!userId)
        return {
            success: false,
            message: "Forbidden"
        };

    const { error: errorFetch, data: dataFetch } = await supabase.from("rooms")
        .select<"current_round", number>()
        .eq("id", entry.room_id).single();

    if (errorFetch){
        return {
            success: false,
            message: "Error while fetching the room: " + errorFetch.message
        };
    }

    if (!entry.image.startsWith("https://v3b.fal.media/files/b")){
        return {
            success: false,
            message: "The image must indicate a fal ai url."
        };
    }

    const entryToAdd = { ...entry,
        round_id: dataFetch,
        author_id: userId,
        room_id: entry.room_id,
    };

    const { error } = await supabase
        .from("round_entries")
        .insert(entryToAdd);

    if (error){
        return {
            success: false,
            message: error.message
        };
    }

    return {
        success: true,
        message: "OK"
    };
}