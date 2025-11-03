"use server"
import { getUserIdFromCookie } from "@/lib/util/auth";
import { MPlayerSchema, PlayerCreatePayload } from "@/lib/models/Player";
import { supabaseInsert } from "@/lib/api/supabase";

/**
 * Creates a new player in the specified room.
 * Should be called in a server context.
 * 
 * @param playerNumber - The number assigned to the player.
 * @param roomId - The ID of the room where the player will be created.
 * @returns An object indicating success status, message, and the created player data if successful.
 */
export default async function CreatePlayer(playerNumber: number, roomId: string) {

    const userId = await getUserIdFromCookie();

    if (!userId)
        return {
            success: false,
            message: "Forbidden",
            roomCode: null
        };

    const playerCreatePayload: PlayerCreatePayload = {
        user_id: userId,
        room_id: roomId,
        player_number: playerNumber,
    }

    const { data, error } = await supabaseInsert('players', MPlayerSchema, playerCreatePayload);

    return {
        success: !error,
        message: data ? "OK" : error?.message,
        player: data ? data : null
    };
}
