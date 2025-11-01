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
    WritePrompt: 'WritePrompt',

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
    None: 'None',
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
    userId: z.number().optional(),
    role: RoleSchema,
    permissions: z.array(PermissionSchema),
});
export type AuthContext = z.infer<typeof AuthContextSchema>;


// We can define a default "Guest" context for when no user is logged in.
export const NONE_CONTEXT: AuthContext = {
    userId: undefined,
    role: RoleSchema.enum.None,
    permissions: [],
};
