"use server"

import { MRoomSchema, RoomCode, RoomJoinPayload } from "@/lib/models/Room";
import { getUserIdFromCookie } from "@/lib/util/auth";
import { supabaseFetcherSingle } from "@/lib/api/supabase";
import CreatePlayer from "../../player/create/page";

export default async function JoinRoom(roomCode: RoomCode) {

    const userId = await getUserIdFromCookie();

    if (!userId)
        return {
            success: false,
            message: "Forbidden",
            roomCode: null
        };

    const roomJoinPayload: RoomJoinPayload = {
        short_code: roomCode
    };


    const { data, error } = await supabaseFetcherSingle('rooms', MRoomSchema, roomJoinPayload);

    if (data) {
        const { success, message, player } = await CreatePlayer(data.player_count + 1, data.id);

        return {
            success: success,
            message: player ? "OK" : message,
            roomCode: player ? data.short_code : null
        }
    }


    return {
        success: !error,
        message: data ? "OK" : error?.message,
        roomCode: data ? roomJoinPayload.short_code : null
    };
}
