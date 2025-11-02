import { z } from 'zod';

export const RoomcodeSchema = z.string().regex(/^[A-Z0-9]+$/).min(8).max(8);

export const ROOM_PLAYER_LIMIT = 10;

export const MRoomSchema = z.object({
    id: z.uuidv4(),
    creator_id: z.uuidv4(),
    room_name: z.string(),
    short_code: RoomcodeSchema,
    round_count: z.int(),
    player_count: z.int(),
    current_round: z.int(),
    round_ends_at: z.iso.datetime(),
    created_at: z.iso.datetime(),
})

export const RoomJoinPayloadSchema = MRoomSchema.pick({
    short_code: true,
})

export const RoomCreatePayloadSchema = MRoomSchema.omit({
    id: true,
    current_round: true,
    round_count: true,
    round_ends_at: true,
    player_count: true,
    created_at: true,
})



// --- Type Exports ---
export type RoomCode = z.infer<typeof RoomcodeSchema>;
export type MRoom = z.infer<typeof MRoomSchema>;
export type RoomJoinPayload = z.infer<typeof RoomJoinPayloadSchema>;
export type RoomCreatePayload = z.infer<typeof RoomCreatePayloadSchema>;
