'use server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { cookies } from 'next/headers';
import supabase from './supabase/supabase';

// Initialize Supabase clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || '';

// Regular client for frontend operations (respects RLS)
// export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Service client for backend operations (bypasses RLS)
// export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
//     auth: {
//         persistSession: false,
//         autoRefreshToken: false,
//     },
// });

// Supabase Auth wrapper functions that integrate with your existing authentication system

/**
 * Supabase login function that integrates with existing cookie-based auth
 * @param email User's email
 * @param password User's password
 */
export const supabaseLogin = async (username: string, apiKey: string) => {
    const { error } = await supabase.from("users")
        .select("id", {
            count: "exact",
            head: true
        }).eq("username", username).eq("api_key", apiKey);



    if (error) {
        return {
            success: false,
            message: error.message
        }
    }

    const cks = await cookies();

    cks.set('apiKey', apiKey);

    return {
        success: true,
        message: "OK"
    };
};

//
// /**
//  * Supabase signup function
//  * @param email User's email
//  * @param password User's password
//  * @param userData Additional user data to store
//  */
// export const supabaseSignUp = async (email: string, password: string, userData?: Record<string, any>) => {
//     const { data, error } = await supabase.auth.signUp({
//         email,
//         password,
//         options: {
//             data: userData,
//         },
//     });
//
//     if (error) {
//         throw new Error(`Supabase signup error: ${error.message}`);
//     }
//
//     // Store session data in cookies if user is automatically signed in
//     if (data.session) {
//         Cookies.set('authToken', data.session.access_token, {
//             path: '/',
//             maxAge: 60 * 60 * 24 * 30, // 30 days
//         });
//
//         if (data.session.refresh_token) {
//             Cookies.set('refreshToken', data.session.refresh_token, {
//                 path: '/',
//                 maxAge: 60 * 60 * 24 * 30, // 30 days
//             });
//         }
//     }
//
//     return data;
// };

/**
 * Supabase logout function that clears cookies
 */
export const supabaseLogout = async () => {

    // Clear cookies to integrate with existing auth system
    const data = (await cookies()).delete("apiKey");

    if (!data) {
        console.error(`Supabase logout error: No cookie found to delete.`);
        return { success: false };
    }

    return { success: true };
};

/**
 * Get current Supabase user
 */
export const getSupabaseUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
        throw new Error(`Supabase get user error: ${error.message}`);
    }

    return user;
};


// Supabase-specific wrapper functions that integrate with your existing API structure

/**
 * Supabase fetcher for GET requests with Zod schema validation
 * @param from The table name or view to query
 * @param schema The Zod schema for the expected data payload
 * @param filters Optional filters to apply to the query
 */
export const supabaseFetcher = async <T extends z.ZodTypeAny>(
    from: string,
    schema: T,
    filters?: Record<string, any>
): Promise<MutatorResponse<z.infer<T>[]>> => {
    let query = supabase.from(from).select('*');

    // Apply filters if provided
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
        });
    }

    const { data, error } = await query;

    // Handle Supabase error first
    if (error) {
        return {
            data: null,
            error: new Error(`Supabase error: ${error.message}`)
        };
    }

    // Validate each item in the response against the schema
    try {
        if (data) {
            const parsedData = data.map(item => schema.parse(item)) as z.infer<T>[];
            return {
                data: parsedData,
                error: null
            };
        }

        return {
            data: [],
            error: null
        };
    } catch (validationError) {
        // Catch Zod validation errors
        return {
            data: null,
            error: validationError instanceof Error
                ? validationError
                : new Error(`Zod validation failed: ${String(validationError)}`)
        };
    }
};

/**
 * Supabase fetcher for single record GET requests
 * @param from The table name or view to query
 * @param schema The Zod schema for the expected data payload
 * @param filters Filters to apply to the query (should result in a single record)
 */
export const supabaseFetcherSingle = async <T extends z.ZodTypeAny>(
    from: string,
    schema: T,
    filters: Record<string, any>
): Promise<MutatorResponse<z.infer<T> | null>> => {
    let query = supabase.from(from).select('*');

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
    });

    const { data, error } = await query.single();

    if (error) {
        if (error.code === 'PGRST116') {
            // No rows returned
            return {
                data: null,
                error: null
            };
        }
        return {
            data: null,
            error: new Error(`Supabase error: ${error.message}`)
        };
    }

    // Validate the response against the schema
    try {
        if (data) {
            const parsedData = schema.parse(data) as z.infer<T>;
            return {
                data: parsedData,
                error: null
            };
        }

        return {
            data: null,
            error: null
        };
    } catch (validationError) {
        // Catch Zod validation errors
        return {
            data: null,
            error: validationError instanceof Error
                ? validationError
                : new Error(`Zod validation failed: ${String(validationError)}`)
        };
    }
};

export type MutatorResponse<T> = {
    data: T | null;
    error: Error | null;
};

/**
 * Supabase mutator for INSERT operations
 * @param from The table name to insert into
 * @param schema The Zod schema for the *expected response*
 * @param data The data to insert
 */
export const supabaseInsert = async <T extends z.ZodTypeAny>(
    from: string,
    schema: T,
    data: any
): Promise<MutatorResponse<z.infer<T>>> => {
    const { data: responseData, error } = await supabase
        .from(from)
        .insert(data)
        .select()
        .single();

    // Handle Supabase error first
    if (error) {
        return {
            data: null,
            error: new Error(`Supabase error: ${error.message}`)
        };
    }

    // Handle case where Supabase returns no data (e.g., RLS)
    if (!responseData) {
        return {
            data: null,
            error: new Error('Supabase error: No data returned after insert.')
        };
    }

    // Try to parse the data
    try {
        // Zod parse will validate the shape of responseData
        const parsedData = schema.parse(responseData);
        return {
            data: parsedData,
            error: null
        };
    } catch (validationError) {
        // Catch Zod validation errors
        return {
            data: null,
            error: validationError instanceof Error
                ? validationError
                : new Error(`Zod validation failed: ${String(validationError)}`)
        };
    }
};

/**
 * Supabase mutator for UPDATE operations
 * @param from The table name to update
 * @param schema The Zod schema for the expected response
 * @param filters Filters to identify which records to update
 * @param data The data to update
 */
export const supabaseUpdate = async <T extends z.ZodTypeAny>(
    from: string,
    schema: T,
    filters: Record<string, any>,
    data: any
): Promise<MutatorResponse<z.infer<T>>> => {
    let query = supabase.from(from).update(data).select().single();

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
    });

    const { data: responseData, error } = await query;

    // Handle Supabase error first
    if (error) {
        return {
            data: null,
            error: new Error(`Supabase error: ${error.message}`)
        };
    }

    // Handle case where Supabase returns no data
    if (!responseData) {
        return {
            data: null,
            error: new Error('Supabase error: No data returned from update operation')
        };
    }

    // Try to parse the data
    try {
        // Zod parse will validate the shape of responseData
        const parsedData = schema.parse(responseData);
        return {
            data: parsedData,
            error: null
        };
    } catch (validationError) {
        // Catch Zod validation errors
        return {
            data: null,
            error: validationError instanceof Error
                ? validationError
                : new Error(`Zod validation failed: ${String(validationError)}`)
        };
    }
};

/**
 * Supabase mutator for DELETE operations
 * @param from The table name to delete from
 * @param filters Filters to identify which records to delete
 */
export const supabaseDelete = async (
    from: string,
    filters: Record<string, any>
): Promise<MutatorResponse<boolean>> => {
    let query = supabase.from(from).delete();

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
    });

    const { error } = await query;

    if (error) {
        return {
            data: null,
            error: new Error(`Supabase error: ${error.message}`)
        };
    }

    return {
        data: true,
        error: null
    };
};

