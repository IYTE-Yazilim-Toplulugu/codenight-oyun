"use server"
import { getUserIdFromCookie } from "@/lib/util/auth";
import { PlayerDeletePayload } from "@/lib/models/Player";
import { supabaseDelete, supabaseUpdate } from "@/lib/api/supabase";
import { MRoomSchema } from "@/lib/models/Room";
import GetRoom from "../../room/get";

/**
 * Deletes a player associated with the current user.
 *
 * @return An object indicating success status and message.
 */
export default async function DeletePlayer(userId?: string) {

    const localUserId = await getUserIdFromCookie();

    if (!localUserId)
        return {
            success: false,
            message: "Forbidden",
            roomCode: null
        };

    userId ??= localUserId;

    const playerDeletePayload: PlayerDeletePayload = {
        user_id: userId,
    }

    const { success, message, room } = await GetRoom();

    if (!success || !room) {
        return {
            success: false,
            message: "Could not find room: " + message,
        }
    }
    const oldData = room;

    const { data, error } = await supabaseDelete('players', playerDeletePayload);

    if (error) {
        return {
            success: false,
            message: error.message,
        }
    }

    if (!data) {
        const { error } = await supabaseUpdate(
            'rooms',
            MRoomSchema, { id: oldData.id },
            { player_count: oldData.player_count - 1 }
        );

        return {
            success: !error,
            message: !error ? "OK" : error?.message,
        }
    }

    return {
        success: !error,
        message: data ? "OK" : error,
    };
}
