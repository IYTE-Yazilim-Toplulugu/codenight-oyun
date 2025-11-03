"use server"
import { getUserIdFromCookie } from "@/lib/util/auth";
import { MPlayerSchema, PlayerGetPayload, PlayerMetaPayloadSchema, PlayersGetPayload } from "@/lib/models/Player";
import { supabaseFetcher, supabaseFetcherSingle } from "@/lib/api/supabase";
import { MRoom } from "@/lib/models/Room";
import supabase from "@/lib/api/supabase/supabase";

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
            players: null
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

export type PlayerMeta = {
    player_number: number
    users: {
        id: string,
        username: string,
    }
};

/**
 * Retrieves the player metadata associated with the room.
 *
 * @param room - The room for which to retrieve player metadata.
 * @return An object indicating success status, message, and the player metadata if successful.
 */
export async function GetPlayerMeta(room: Pick<MRoom, 'id'>){
    const userId = await getUserIdFromCookie();

    if (!userId)
        return {
            success: false,
            message: "Forbidden",
            players: null
        };

    const playersGetPayload: PlayersGetPayload = {
        room_id: room.id,
    }

    const { error, data } = await supabase.from("players")
        .select("player_number, users ( id, username )")
        .eq("room_id", room.id);

    //const { error, data } = await supabaseFetcher("players", PlayerMetaPayloadSchema, playersGetPayload);

    return {
        success: !error,
        message: data ? "OK" : error?.message,
        players: data ? data.map<PlayerMeta>(x => x as unknown as PlayerMeta): null,
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
