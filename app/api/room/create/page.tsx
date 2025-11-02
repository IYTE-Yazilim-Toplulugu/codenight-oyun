"use server"

import { MRoom, RoomCreatePayload, RoomCreatePayloadSchema } from "@/lib/models/Room";
import { getUserIdFromCookie } from "@/lib/util/auth";
import supabase from "@/lib/api/supabase/supabase";
import { randomInt } from "node:crypto";
import { supabaseInsert } from "@/lib/api/supabase";

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

export default async function CreateRoom(
    room: Pick<MRoom, "room_name">
) {

    const userId = await getUserIdFromCookie();

    if (!userId)
        return {
            success: false,
            message: "Forbidden",
            roomCode: null
        };

    const roomCreatePayload: RoomCreatePayload = {
        ...room,
        creator_id: userId,
        short_code: generateCode(),
    };


    const { data, error } = await supabaseInsert('rooms', RoomCreatePayloadSchema, roomCreatePayload);

    return {
        success: !error,
        message: data ? "OK" : error?.message,
        roomCode: data ? roomCreatePayload.short_code : null
    };
}
