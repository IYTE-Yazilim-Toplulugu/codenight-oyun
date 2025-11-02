"use server";

import { supabaseFetcherSingle } from "@/lib/api/supabase";
import { GetPlayer, GetPlayers } from "../../player/get/page";
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

export async function GetFullRoom() {

    const { success, message, player } = await GetPlayer()

    if (!player) {
        return {
            success: success,
            message: message,
            room: null
        }
    }

    const roomGetPayload: RoomGetPayload = {
        id: player.room_id
    };

    const { data, error } = await supabaseFetcherSingle('rooms', MRoomSchema, roomGetPayload);

    if (error) {
        return {
            success: false,
            message: error.message,
            room: null
        };
    }

    const resultPlayers = await GetPlayers({ id: player.room_id });

    if (!resultPlayers.success) {
        return {
            success: false,
            message: resultPlayers.message,
            room: null
        };
    }

    const fullRoom = {
        ...data,
        players: resultPlayers.players
    };

    return {
        success: true,
        message: "OK",
        room: fullRoom
    }
}
