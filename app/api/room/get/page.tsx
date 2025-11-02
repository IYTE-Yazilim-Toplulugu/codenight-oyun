"use server";

import { supabaseFetcherSingle } from "@/lib/api/supabase";
import { GetPlayer } from "../../player/get/page";
import { MRoomSchema, RoomGetPayload } from "@/lib/models/Room";


export default async function GetRoom() {

    const { success, message, player } = await GetPlayer()

    if (player) {
        const roomGetPayload: RoomGetPayload = {
            id: player.room_id
        };

        const { data, error } = await supabaseFetcherSingle('rooms', MRoomSchema, roomGetPayload);

        return {
            success: data != null,
            message: data ? "OK" : error?.message || "Unknown error",
            room: data ? data : null
        }
    }

    return {
        success: success,
        message: message,
        room: null
    }
}
