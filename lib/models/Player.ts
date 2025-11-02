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

export const PlayersGetPayloadSchema = MPlayerSchema.pick({
    room_id: true
})

export const PlayerGetPayloadSchema = MPlayerSchema.pick({
    user_id: true
})

export const PlayerKickPayloadSchema = MPlayerSchema.pick({
    user_id: true
})

export const PlayerMetaPayloadSchema = MPlayerSchema.pick({
   user_id: true,
   player_number: true
}).and(z.object({
    users: z.object({
        username: z.string()
    })
}));

// --- Type Exports ---
export type MPlayer = z.infer<typeof MPlayerSchema>;
export type PlayerCreatePayload = z.infer<typeof PlayerCreatePayloadSchema>;
export type PlayerDeletePayload = z.infer<typeof PlayerDeletePayloadSchema>;
export type PlayersGetPayload = z.infer<typeof PlayersGetPayloadSchema>;
export type PlayerGetPayload = z.infer<typeof PlayerGetPayloadSchema>;
export type PlayerMetaPayload = z.infer<typeof PlayerMetaPayloadSchema>;
export type PlayerKickPayload = z.infer<typeof PlayerKickPayloadSchema>;
