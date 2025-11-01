import { z } from 'zod';

export * from './Execution';

// --- API Endpoint Schemas ---

export const LoginRequestSchema = z.object({
    name: z.string().max(45),
    api_key: z.string().optional(),
    admin_pass: z.string().optional()
});

export const LogoutRequestSchema = z.object({
    // TODO: implement in future
});

export const RefreshTokenRequestSchema = z.object({
    token: z.string(),
    refresh_token: z.string(),
});

export const RegisterStatusSchema = z.enum({
    SendError: 0,
    OAuthVerificationError: 1,
    LowAge: 2,
    HighAge: 3,
});

export const RefreshStatusSchema = z.enum({
    Expired: 0,
});

/**
 * Status codes for the /register/complete frontend page.
 */
export const RegisterCompleteStatusSchema = z.enum({
    InternalError: -1,
    UserNotFound: -2,
    Success: 0,
    FailedParse: 1,
});



// --- Type Exports ---
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
