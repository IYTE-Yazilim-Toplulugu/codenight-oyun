import { z } from 'zod';

export const MRoomSchema = z.object({
    id: z.uuid(),
    creator_id: z.uuid(),
    room_name: z.string(),
    short_code: z.int(),
    round_count: z.int(),
    current_round: z.int(),
    round_ends_at: z.iso.datetime(),
    create_date: z.iso.datetime()
})



// --- Type Exports ---
export type MRoom = z.infer<typeof MRoomSchema>;
