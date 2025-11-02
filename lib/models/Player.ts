import { z } from 'zod';

export const MPlayerSchema = z.object({
    user_id: z.uuidv4(),
    room_id: z.uuidv4(),
    player_number: z.int()
})

export const PlayerCreatePayloadSchema = MPlayerSchema

export const PlayerDeletePayloadSchema = MPlayerSchema.pick({
    user_id: true
})

export const PlayerGetPayloadSchema = MPlayerSchema.pick({
    room_id: true
})


// --- Type Exports ---
export type MPlayer = z.infer<typeof MPlayerSchema>;
export type PlayerCreatePayload = z.infer<typeof PlayerCreatePayloadSchema>;
export type PlayerDeletePayload = z.infer<typeof PlayerDeletePayloadSchema>;
export type PlayerGetPayload = z.infer<typeof PlayerGetPayloadSchema>;
