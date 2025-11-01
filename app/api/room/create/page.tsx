"use server"

import {MRoom} from "@/lib/models/Room";
import {getUserIdFromCookie} from "@/lib/util/auth";
import supabase from "@/lib/api/supabase/supabase";
import {randomInt} from "node:crypto";

const POSSIBLE_KEY_CHARS = "ABCDEFGHIJKLMNPRSTUVYZQWX23456789";
const KEY_LENGTH = 8;

function generateCode(){
    let code = "";
    
    for (let i = 0; i < KEY_LENGTH; i++){
        const char = POSSIBLE_KEY_CHARS[randomInt(POSSIBLE_KEY_CHARS.length)];
        code += char;
    }
    
    return code;
}

export default async function CreateRoom(room: Omit<MRoom, "id" | "create_date" | "current_round" | "creator_id" | "round_ends_at" | "short_code">){
    const userId = await getUserIdFromCookie();

    if (!userId)
        return {
            success: false,
            message: "Forbidden",
            roomCode: null
        };

    const roomToAdd = {...room,
        creator_id: userId,
        short_code: generateCode(),
        created_at: new Date()
    };
    

    const { error } = await supabase
        .from("rooms")
        .insert(roomToAdd);

    return {
        success: !error,
        message: error ? error.message : "OK",
        roomCode: error ? null : roomToAdd.short_code
    };
}