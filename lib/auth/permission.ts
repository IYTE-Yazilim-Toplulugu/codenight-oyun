import { MUser } from "../models/User";
import {
    AuthContext,
    NONE_CONTEXT,
    Permission,
    PermissionSchema,
    Role,
    RoleSchema
} from "../models/Auth";

const rolePermissions: Record<Role, Permission[]> = {
    [RoleSchema.enum.None]: [],
    [RoleSchema.enum.Standard]: [
        PermissionSchema.enum.Authorization,
        PermissionSchema.enum.UseAccountSettings,
        PermissionSchema.enum.CreateRoom,
        PermissionSchema.enum.WritePrompt,
    ],
    [RoleSchema.enum.Creator]: [
        PermissionSchema.enum.Authorization,
        PermissionSchema.enum.UseAccountSettings,
        PermissionSchema.enum.CreateRoom,
        PermissionSchema.enum.WritePrompt,
        PermissionSchema.enum.KickUser,
    ],
    [RoleSchema.enum.Admin]: Object.values(PermissionSchema.enum),
};

/**
 * Constructs the full AuthContext from a user object (or just a role).
 * This is the central mapping logic.
 * @param user The user object from the API, must contain a role.
 * @returns A complete AuthContext object with permissions and authLevel.
 */
export const getAuthContextFromUser = (user: MUser): AuthContext => {
    // Assuming MUser.role is a string that matches a value in the Role enum
    const determineRole = (user: MUser) => {
        if (user.is_admin) {
            return RoleSchema.enum.Admin;
        }

    }
    const role = determineRole(user) as Role;

    if (!role || !rolePermissions[role]) {
        // Fallback to guest if role is unknown or missing
        return NONE_CONTEXT;
    }

    return {
        userId: user.id,
        role: role,
        permissions: rolePermissions[role],
    };
};
