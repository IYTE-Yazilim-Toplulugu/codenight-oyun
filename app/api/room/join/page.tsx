"use server"

import { RoomCode, RoomJoinPayload, RoomJoinPayloadSchema } from "@/lib/models/Room";
import { getUserIdFromCookie } from "@/lib/util/auth";
import { supabaseFetcherSingle } from "@/lib/api/supabase";

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


    const { data, error } = await supabaseFetcherSingle('rooms', RoomJoinPayloadSchema, roomJoinPayload);

    return {
        success: !error,
        message: data ? "OK" : error?.message,
        roomCode: data ? roomJoinPayload.short_code : null
    };
}
