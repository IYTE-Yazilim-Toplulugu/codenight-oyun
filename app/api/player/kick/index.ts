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
export async function KickPlayer(user_id: string) {

    const { success, message, player } = await GetPlayer();

    if (!success) {
        return {
            success : success,
            message : message,
            player : null,
        }
    }

    const playerKickPayload: PlayerKickPayload = {
    user_id: user_id,
    }

    const { room } = await GetFullRoom();

    const  kickedUser = room?.players?.find((p) => p.users.id === user_id)

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


