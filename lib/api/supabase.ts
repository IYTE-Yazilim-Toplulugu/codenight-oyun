import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import Cookies from 'js-cookie';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Supabase Auth wrapper functions that integrate with your existing authentication system

/**
 * Supabase login function that integrates with existing cookie-based auth
 * @param email User's email
 * @param password User's password
 */
export const supabaseLogin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Supabase auth error: ${error.message}`);
  }

  // Store session data in cookies to integrate with existing auth system
  if (data.session) {
    Cookies.set('authToken', data.session.access_token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    if (data.session.refresh_token) {
      Cookies.set('refreshToken', data.session.refresh_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
  }

  return data;
};

/**
 * Supabase signup function
 * @param email User's email
 * @param password User's password
 * @param userData Additional user data to store
 */
export const supabaseSignUp = async (email: string, password: string, userData?: Record<string, any>) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });

  if (error) {
    throw new Error(`Supabase signup error: ${error.message}`);
  }

  // Store session data in cookies if user is automatically signed in
  if (data.session) {
    Cookies.set('authToken', data.session.access_token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    if (data.session.refresh_token) {
      Cookies.set('refreshToken', data.session.refresh_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
  }

  return data;
};

/**
 * Supabase logout function that clears cookies
 */
export const supabaseLogout = async () => {
  const { error } = await supabase.auth.signOut();

  // Clear cookies to integrate with existing auth system
  Cookies.remove('authToken', { path: '/' });
  Cookies.remove('refreshToken', { path: '/' });

  if (error) {
    throw new Error(`Supabase logout error: ${error.message}`);
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

/**
 * Refresh Supabase session using refresh token from cookies
 */
export const refreshSupabaseSession = async () => {
  const refreshToken = Cookies.get('refreshToken');

  if (!refreshToken) {
    throw new Error('No refresh token found');
  }

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error) {
    throw new Error(`Supabase refresh session error: ${error.message}`);
  }

  // Update cookies with new tokens
  if (data.session) {
    Cookies.set('authToken', data.session.access_token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    if (data.session.refresh_token) {
      Cookies.set('refreshToken', data.session.refresh_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
  }

  return data;
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
): Promise<z.infer<T>[]> => {
  let query = supabase.from(from).select('*');

  // Apply filters if provided
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  // Validate each item in the response against the schema
  if (data) {
    return data.map(item => schema.parse(item)) as z.infer<T>[];
  }

  return [];
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
): Promise<z.infer<T> | null> => {
  let query = supabase.from(from).select('*');

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Supabase error: ${error.message}`);
  }

  if (data) {
    return schema.parse(data) as z.infer<T>;
  }

  return null;
};

/**
 * Supabase mutator for INSERT operations
 * @param from The table name to insert into
 * @param schema The Zod schema for the expected response
 * @param data The data to insert
 */
export const supabaseInsert = async <T extends z.ZodTypeAny>(
  from: string,
  schema: T,
  data: any
): Promise<z.infer<T>> => {
  const { data: responseData, error } = await supabase.from(from).insert(data).select().single();

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  if (responseData) {
    return schema.parse(responseData) as z.infer<T>;
  }

  throw new Error('No data returned from insert operation');
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
): Promise<z.infer<T>> => {
  let query = supabase.from(from).update(data).select().single();

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  const { data: responseData, error } = await query;

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  if (responseData) {
    return schema.parse(responseData) as z.infer<T>;
  }

  throw new Error('No data returned from update operation');
};

/**
 * Supabase mutator for DELETE operations
 * @param from The table name to delete from
 * @param filters Filters to identify which records to delete
 */
export const supabaseDelete = async (
  from: string,
  filters: Record<string, any>
): Promise<boolean> => {
  let query = supabase.from(from).delete();

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  const { error } = await query;

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  return true;
};

