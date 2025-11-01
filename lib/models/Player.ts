import { z } from 'zod';

export const MRoomSchema = z.object({
    user_id: z.uuid(),
    room_id: z.uuid(),
    player_number: z.int()
})



// --- Type Exports ---
export type MRoom = z.infer<typeof MRoomSchema>;
