"use server"
import { getUserIdFromCookie } from "@/lib/util/auth";
import { PlayerDeletePayload } from "@/lib/models/Player";
import { supabaseDelete } from "@/lib/api/supabase";

/**
 * Deletes a player associated with the current user.
 *
 * @return An object indicating success status and message.
 */
export default async function DeletePlayer() {

    const userId = await getUserIdFromCookie();

    if (!userId)
        return {
            success: false,
            message: "Forbidden",
            roomCode: null
        };

    const playerDeletePayload: PlayerDeletePayload = {
        user_id: userId,
    }

    const { data, error } = await supabaseDelete('players', playerDeletePayload);

    return {
        success: !error,
        message: data ? "OK" : error?.message,
    };
}
