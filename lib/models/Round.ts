import { z } from 'zod';

export const MRoundEntrySchema = z.object({
    id: z.uuid(),
    round_id: z.uuid(),
    author_id: z.uuid(),
    room_id: z.uuid(),
    is_prompt: z.boolean(),
    data: z.string()
})



// --- Type Exports ---
export type MRoundEntry = z.infer<typeof MRoundEntrySchema>;
