import { z } from 'zod';

/**
 * Defines all possible granular permissions in the system.
 * These are the building blocks for roles.
 */
export const PermissionSchema = z.enum({
    // Standard
    Authorization: 'Authorization',
    UseAccountSettings: 'UseAccountSettings',
    CreateRoom: 'CreateRoom',
    WritePrompt: 'WriteComment',

    // Creator
    KickUser: 'KickUser',

    // Admin
    UseModerationPanel: 'UseModerationPanel',
    Administrator: 'Administrator',
});
export type Permission = z.infer<typeof PermissionSchema>;

/**
 * Defines the user roles. The hierarchy (e.g., ModeratorCompany includes Standard)
 * should be resolved on the backend, which then provides a flat list of all
 * applicable permissions to the client.
 */
export const RoleSchema = z.enum({
    Standard: 'Standard',
    Creator: 'Creator',
    Admin: 'Admin',
});
export type Role = z.infer<typeof RoleSchema>;

/**
 * This is the main object representing the user's session and permissions.
 * It should be fetched from the backend after a user authenticates.
 */
export const AuthContextSchema = z.object({
    isAuthenticated: z.boolean(),
    userId: z.number().optional(),
    role: RoleSchema,
    permissions: z.array(PermissionSchema),
});
export type AuthContext = z.infer<typeof AuthContextSchema>;


// export const STANDARD_CONTEXT: AuthContext = {
//     isAuthenticated: false,
//     role: RoleSchema.enum.Standard,
//     permissions: [],
// };
