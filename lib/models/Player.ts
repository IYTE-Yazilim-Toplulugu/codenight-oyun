import { z } from 'zod';

export const MPlayerSchema = z.object({
    user_id: z.uuidv4(),
    room_id: z.uuidv4(),
    player_number: z.int()
})



// --- Type Exports ---
export type MPlayer = z.infer<typeof MPlayerSchema>;
