"use server"
import { getUserIdFromCookie } from "@/lib/util/auth";
import { MPlayerSchema, PlayerGetPayload, PlayersGetPayload } from "@/lib/models/Player";
import { supabaseFetcher, supabaseFetcherSingle } from "@/lib/api/supabase";
import { MRoom } from "@/lib/models/Room";

/**
 * Retrieves the players associated with the room.
 *
 * @return An object indicating success status, message, and the player data if successful.
 */
export async function GetPlayers(room: Pick<MRoom, 'id'>) {

    const userId = await getUserIdFromCookie();

    if (!userId)
        return {
            success: false,
            message: "Forbidden",
            roomCode: null
        };

    const playersGetPayload: PlayersGetPayload = {
        room_id: room.id,
    }

    const { data, error } = await supabaseFetcher('players', MPlayerSchema, playersGetPayload);

    return {
        success: !error,
        message: data ? "OK" : error?.message,
        players: data ? data : null,
    };
}

/**
 * Retrieves the player associated with the current user.
 *
 * @return An object indicating success status, message, and the player data if successful.
 */
export async function GetPlayer() {

    const userId = await getUserIdFromCookie();

    if (!userId) {
        return {
            success: false,
            message: "Forbidden",
            player: null
        }
    }

    const playerGetPayload: PlayerGetPayload = {
        user_id: userId
    }

    const { data, error } = await supabaseFetcherSingle('players', MPlayerSchema, playerGetPayload);

    return {
        success: !error,
        message: data ? "OK" : error?.message,
        player: data ? data : null,
    }
}
