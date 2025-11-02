import { z } from 'zod';

export const MPlayerSchema = z.object({
    user_id: z.uuid(),
    room_id: z.uuid(),
    player_number: z.int()
})



// --- Type Exports ---
export type MPlayer = z.infer<typeof MPlayerSchema>;
