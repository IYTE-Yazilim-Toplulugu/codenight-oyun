# Supabase Integration

This project includes a Supabase integration that works alongside the existing API infrastructure. The integration provides wrapper functions that follow the same patterns as the existing API functions, with Zod schema validation and error handling.

## Setup

1. Create a Supabase project at https://supabase.io
2. Get your Supabase URL and Anon Key from the project settings
3. Add the following environment variables to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage

The Supabase integration provides several wrapper functions that can be imported from `@/lib/api/supabase`:

### Authentication Functions

- `supabaseLogin(email, password)` - Login with email and password
- `supabaseSignUp(email, password, userData)` - Sign up with email and password
- `supabaseLogout()` - Log out and clear session
- `getSupabaseUser()` - Get the current authenticated user
- `refreshSupabaseSession()` - Refresh the session using the refresh token

### Data Functions

- `supabaseFetcher(table, schema, filters)` - Fetch multiple records with optional filters
- `supabaseFetcherSingle(table, schema, filters)` - Fetch a single record with filters
- `supabaseInsert(table, schema, data)` - Insert a new record
- `supabaseUpdate(table, schema, filters, data)` - Update records matching filters
- `supabaseDelete(table, filters)` - Delete records matching filters

### Example Usage

```typescript
import { supabaseFetcher, supabaseInsert } from '@/lib/api/supabase';
import { z } from 'zod';

// Define a schema for your data
const TodoSchema = z.object({
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
});

type Todo = z.infer<typeof TodoSchema>;

// Fetch todos
const todos = await supabaseFetcher<Todo>('todos', TodoSchema);

// Insert a new todo
const newTodo = await supabaseInsert<Todo>(
  'todos',
  TodoSchema,
  { title: 'Learn Supabase', completed: false }
);
```

## Integration with Existing Auth System

The Supabase authentication functions integrate with the existing cookie-based authentication system. When a user logs in or signs up with Supabase, the access token and refresh token are automatically stored in cookies to maintain compatibility with the existing authentication flow.

## Error Handling

All Supabase wrapper functions throw errors that can be caught and handled in your components or hooks. The errors include descriptive messages from the Supabase client.

## Testing

Two example pages have been created to demonstrate the Supabase integration:

1. `/supabase-test` - Basic integration test
2. `/supabase-crud-example` - Full CRUD example with a todo list

These examples show how to use the Supabase wrapper functions in a React component with proper error handling and loading states.

