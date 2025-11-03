"use server"
import { PlayerKickPayload } from "@/lib/models/Player";
import { supabaseDelete } from "@/lib/api/supabase";
import { GetPlayer } from "../get";
import { GetFullRoom } from "../../room/get";

/**
 * Kick a player associated with the user which admin has choosed.
 *
 * @return An object indicating success status and message.
 */
export async function KickPlayer(userId: string) {

    const { success, message, player } = await GetPlayer();

    if (!success) {
        return {
            success : false,
            message : "Error while getting player: " + message,
        }
    }

    if (player?.user_id === userId){
        return {
            success : false,
            message : "You cannot kick yourself man :)"
        }
    }

    const playerKickPayload: PlayerKickPayload = {
        user_id: userId,
    }

    const { room } = await GetFullRoom();

    const kickedUser = room?.players?.find((p) => p.users.id === userId)

    if (player?.player_number === 1 && kickedUser) {

        const { data, error } = await supabaseDelete('users', playerKickPayload )

        return {
            success: !error,
            message: data ? "OK" : error?.message,
            player: kickedUser
        };
    }
    return {
        success : false,
        message: "Unknown error occured.",
        player: null
    }

}


