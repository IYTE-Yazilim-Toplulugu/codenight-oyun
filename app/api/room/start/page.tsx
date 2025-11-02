import {getUserIdFromCookie} from "@/lib/util/auth";
import supabase from "@/lib/api/supabase/supabase";
import {MRoom} from "@/lib/models/Room";
import {ROUND_TIMESPAN} from "@/lib/models/Round";

export default async function StartRoom(roomCode: string){
    const userId = await getUserIdFromCookie();

    if (!userId)
        return {
            success: false,
            message: "Forbidden",
            roomCode: null
        };

    const { error: errorFetch, data: dataFetch } = await supabase.from("rooms")
        .select<"*", MRoom>()
        .eq("secret_code", roomCode).single();

    if (errorFetch){
        return {
            success: false,
            message: "Error while fetching room: " + errorFetch.message
        };
    }

    if (!dataFetch){
        return {
            success: false,
            message: "Room could not be found."
        };
    }

    const currentDate = new Date(Date.now() + ROUND_TIMESPAN);

    const { error: errorUpdate } = await supabase.from("rooms")
        .update({
            current_round: 1,
            round_count: dataFetch.player_count,
            round_ends_at: currentDate,
        }).eq("id", dataFetch.id);

    if (errorUpdate){
        return {
            success: false,
            message: "Error while updating room: " + errorUpdate.message
        };
    }

    return {
        success: true,
        message: "OK"
    };
}