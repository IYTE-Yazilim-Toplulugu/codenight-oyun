"use server"
import { randomInt } from "node:crypto";

import { supabaseInsert } from "@/lib/api/supabase";
import { MRoom, MRoomSchema, RoomCreatePayload } from "@/lib/models/Room";
import { getUserIdFromCookie } from "@/lib/util/auth";
import CreatePlayer from "../../player/create";

const POSSIBLE_KEY_CHARS = "ABCDEFGHIJKLMNPRSTUVYZQWX23456789";
const KEY_LENGTH = 8;

function generateCode() {
    let code = "";

    for (let i = 0; i < KEY_LENGTH; i++) {
        const char = POSSIBLE_KEY_CHARS[randomInt(POSSIBLE_KEY_CHARS.length)];
        code += char;
    }

    return code;
}

/**
 * Creates a new room with the specified name.
 *
 * @param room - An object containing the room name.
 * @return An object indicating success status, message, and the room code if successful.
 */
export default async function CreateRoom(room: Pick<MRoom, "room_name">) {

    const userId = await getUserIdFromCookie();

    if (!userId)
        return {
            success: false,
            message: "Forbidden",
            roomCode: null
        };

    const roomCreatePayload: RoomCreatePayload = {
        ...room,
        player_count: 1,
        creator_id: userId,
        short_code: generateCode(),
    };

    const { data, error } = await supabaseInsert('rooms', MRoomSchema, roomCreatePayload);

    if (data) {
        const { success, message, player } = await CreatePlayer(1, data.id);

        return {
            success: success,
            message: player ? "OK" : message,
            roomCode: player ? data.short_code : null
        };
    }

    return {
        success: false,
        message: error?.message || "Unknown error",
        roomCode: null
    }
}
