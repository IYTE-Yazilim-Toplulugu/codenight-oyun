"use server"
import { getUserIdFromCookie } from "@/lib/util/auth";
import { MPlayerSchema, PlayerGetPayload } from "@/lib/models/Player";
import { supabaseFetcher } from "@/lib/api/supabase";
import { MRoom } from "@/lib/models/Room";

/**
 * Retrieves the players associated with the room.
 *
 * @return An object indicating success status, message, and the player data if successful.
 */
export default async function GetPlayers(room: Pick<MRoom, 'id'>) {

    const userId = await getUserIdFromCookie();

    if (!userId)
        return {
            success: false,
            message: "Forbidden",
            roomCode: null
        };

    const playerGetPayload: PlayerGetPayload = {
        room_id: room.id,
    }

    const { data, error } = await supabaseFetcher('players', MPlayerSchema.array(), playerGetPayload);

    return {
        success: !error,
        message: data ? "OK" : error?.message,
        players: data ? data : null,
    };
}
