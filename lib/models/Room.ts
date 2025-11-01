import { z } from 'zod';

export const MRoomSchema = z.object({
    id: z.uuidv4(),
    creator_id: z.uuid(),
    room_name: z.string(),
    short_code: z.string(),
    round_count: z.int(),
    current_round: z.int(),
    round_ends_at: z.iso.datetime(),
    created_at: z.iso.datetime()
})

export const RoomCreatePayloadSchema = MRoomSchema.omit({
    id: true,
    current_round: true,
    round_ends_at: true,
})



// --- Type Exports ---
export type MRoom = z.infer<typeof MRoomSchema>;
export type RoomCreatePayload = z.infer<typeof RoomCreatePayloadSchema>;
