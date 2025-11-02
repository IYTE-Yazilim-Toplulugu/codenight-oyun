"use server"
import { MRoomSchema, RoomCode, RoomJoinPayload } from "@/lib/models/Room";
import { getUserIdFromCookie } from "@/lib/util/auth";
import { supabaseFetcherSingle, supabaseUpdate } from "@/lib/api/supabase";
import CreatePlayer from "../../player/create/page";

const ROOM_MAX_PLAYERS = 10;

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
        let oldData = data;
        if (data.player_count <= ROOM_MAX_PLAYERS) {

            const { success, message } = await CreatePlayer(oldData.player_count + 1, oldData.id);

            if (success) {
                const { data, error } = await supabaseUpdate(
                    'rooms',
                    MRoomSchema, ['id'],
                    { ...oldData, player_count: oldData.player_count + 1 }
                );

                // AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                return {
                    success: data != null && success,
                    message: data != null && success ? "OK" : error?.message,
                    roomCode: data != null && success ? roomJoinPayload.short_code : null
                }
            }
            return {
                success: success,
                message: message,
                roomCode: null
            }
        }
        return {
            success: false,
            message: "Room is full",
            roomCode: null
        }
    }


    return {
        success: !error,
        message: data ? "OK" : error?.message,
        roomCode: data ? roomJoinPayload.short_code : null
    };
}
