import { z } from 'zod';

export const ROUND_TIMESPAN = 30 * 1000; // 75 seconds

export const MRoundEntrySchema = z.object({
    id: z.uuidv4(),
    round_id: z.int(),
    author_id: z.uuidv4(),
    room_id: z.uuidv4(),
    prompt: z.string(),
    image: z.string(),
})

// --- Type Exports ---
export type MRoundEntry = z.infer<typeof MRoundEntrySchema>;
