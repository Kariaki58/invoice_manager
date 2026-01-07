# Supabase Client Utilities

This directory contains Supabase client configurations for different contexts in Next.js.

## Files

### `client.ts`
Browser client for client-side React components.
- Uses `createBrowserClient` from `@supabase/ssr`
- Respects Row Level Security (RLS)
- Safe to use in components, hooks, and client-side code

**Usage:**
```typescript
'use client';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
```

### `server.ts`
Server client for Server Components and API Routes.
- Uses `createServerClient` from `@supabase/ssr`
- Manages cookies for session handling
- Respects RLS policies
- Use in Server Components, Server Actions, and API Routes

**Usage:**
```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
```

### `middleware.ts`
Middleware client for Next.js middleware.
- Handles session refresh
- Protects routes
- Redirects unauthenticated users

**Usage:**
Already configured in `middleware.ts` at project root.

### `database.types.ts`
TypeScript type definitions for the database.
- Generated from Supabase schema
- Provides type safety for all database operations
- Update when schema changes

## Best Practices

1. **Never use service role key in client code**
   - Only use in server-side code
   - Service role bypasses RLS

2. **Always use the correct client for the context**
   - Client components → `client.ts`
   - Server components → `server.ts`
   - Middleware → `middleware.ts`

3. **Handle errors properly**
   ```typescript
   const { data, error } = await supabase.from('invoices').select('*');
   if (error) {
     console.error('Error:', error);
     return;
   }
   ```

4. **Check authentication before queries**
   ```typescript
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) {
     // Handle unauthenticated state
   }
   ```

