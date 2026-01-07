# Supabase Backend Implementation for invoiceme

## Overview

This document provides a complete guide to the Supabase backend implementation for the invoiceme invoice management application.

## Architecture

### Database Schema

The application uses the following main tables:

1. **profiles** - User profile information (extends auth.users)
2. **settings** - User business settings and preferences
3. **bank_accounts** - User's bank account details for payments
4. **invoices** - Invoice records with items stored as JSONB

### Authentication Flow

1. User signs up → Supabase Auth creates user
2. Trigger creates profile and default settings
3. User logs in → Session stored in cookies
4. Middleware validates session on protected routes
5. RLS policies ensure users only access their own data

## File Structure

```
lib/
  supabase/
    client.ts          # Browser client (client-side)
    server.ts         # Server client (server-side)
    middleware.ts     # Middleware client (route protection)
    database.types.ts # TypeScript types

supabase/
  schema.sql          # Complete database schema

middleware.ts         # Next.js middleware for auth
```

## Environment Variables

Required environment variables (set in `.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- All operations (SELECT, INSERT, UPDATE, DELETE) are restricted by user_id
- Service role key bypasses RLS (only used server-side)

### API Keys

- **Anon Key**: Safe for client-side, respects RLS
- **Service Role Key**: Server-side only, bypasses RLS (never expose!)

## Database Functions

### `generate_invoice_number(user_uuid)`

Automatically generates invoice numbers in format: `INV-YYYY-XXX`

### `handle_new_user()`

Trigger function that:
- Creates user profile on signup
- Creates default settings
- Runs automatically when user signs up

### `ensure_single_default_account()`

Ensures only one bank account can be marked as default per user.

## Usage Examples

### Client-Side (React Components)

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Get invoices
const { data: invoices } = await supabase
  .from('invoices')
  .select('*')
  .order('created_at', { ascending: false });
```

### Server-Side (Server Components/Actions)

```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

### Middleware (Route Protection)

Already configured in `middleware.ts`. Protects routes:
- `/create`
- `/invoices`
- `/settings`

## Migration from LocalStorage

The current implementation uses localStorage. To migrate:

1. User logs in → Fetch their data from Supabase
2. Replace all `localStorage` operations with Supabase queries
3. Update `InvoiceContext` to use Supabase client
4. Handle loading states during data fetch

## Next Steps

1. ✅ Database schema created
2. ✅ RLS policies configured
3. ✅ Supabase clients set up
4. ⏳ Create authentication pages (login/signup)
5. ⏳ Update InvoiceContext to use Supabase
6. ⏳ Add error handling and loading states
7. ⏳ Test all CRUD operations

## Support

- See `SUPABASE_SETUP.md` for detailed setup instructions
- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com

