import { z } from 'zod';
import { TimestampSchema } from './Common';

export const RoomCodeSchema = z.string().regex(/^[A-Z0-9]+$/).min(8).max(8);

export const ROOM_PLAYER_LIMIT = 10;

export const MRoomSchema = z.object({
    id: z.uuidv4(),
    creator_id: z.uuidv4(),
    room_name: z.string(),
    short_code: RoomCodeSchema,
    round_count: z.int().nullable(),
    player_count: z.int(),
    submit_count: z.int().nullable(),
    current_round: z.int().nullable(),
    round_ends_at: TimestampSchema.nullable(),
    created_at: TimestampSchema,
})

export const RoomJoinPayloadSchema = MRoomSchema.pick({
    short_code: true,
})


export const RoomCreatePayloadSchema = MRoomSchema.omit({
    id: true,
    current_round: true,
    round_count: true,
    round_ends_at: true,
    created_at: true,
    submit_count: true,
})

export const RoomGetPayloadSchema = MRoomSchema.pick({
    id: true,
})


// --- Type Exports ---
export type RoomCode = z.infer<typeof RoomCodeSchema>;
export type MRoom = z.infer<typeof MRoomSchema>;
export type RoomJoinPayload = z.infer<typeof RoomJoinPayloadSchema>;
export type RoomCreatePayload = z.infer<typeof RoomCreatePayloadSchema>;
export type RoomGetPayload = z.infer<typeof RoomGetPayloadSchema>;
