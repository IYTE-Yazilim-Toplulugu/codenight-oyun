import { z } from 'zod';

/**
 * Represents a user profile.
 */
export const MUserSchema = z.object({
    id: z.number(),
    username: z.string(),
    api_key: z.string(),
    avatar: z.int(),
    is_admin: z.boolean(),
    admin_pass: z.string()
});

// --- Type Exports ---
export type MUser = z.infer<typeof MUserSchema>;
