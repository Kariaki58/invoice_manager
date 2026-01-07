# Supabase Setup Guide for invoiceme

This guide will walk you through setting up Supabase for the invoiceme application.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Node.js and npm installed
3. Your Next.js application ready

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in:
   - **Name**: invoiceme (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development
4. Click "Create new project"
5. Wait for the project to be provisioned (2-3 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll need:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon/public key**: Safe for client-side use
   - **service_role key**: ⚠️ **NEVER expose this to the client!**

## Step 3: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Open the file `supabase/schema.sql` from this project
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click "Run" to execute
6. Verify tables were created:
   - Go to **Table Editor** → You should see:
     - `profiles`
     - `settings`
     - `bank_accounts`
     - `invoices`

## Step 4: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. **Important**: Add `.env.local` to `.gitignore` (should already be there)

## Step 5: Install Dependencies

```bash
npm install @supabase/ssr @supabase/supabase-js
```

## Step 6: Configure Authentication

### Email Authentication (Default)

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. **Email** should be enabled by default
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize confirmation and password reset emails

### Optional: Social Auth Providers

1. Go to **Authentication** → **Providers**
2. Enable providers you want (Google, GitHub, etc.)
3. Follow the setup instructions for each provider
4. Add redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

## Step 7: Set Up Row Level Security (RLS)

RLS policies are already included in the schema.sql file. Verify they're active:

1. Go to **Table Editor** → Select any table
2. Click on **Policies** tab
3. You should see policies like:
   - "Users can manage own invoices"
   - "Users can manage own settings"
   - etc.

## Step 8: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try signing up a new user
3. Check Supabase dashboard:
   - **Authentication** → **Users**: Should see your new user
   - **Table Editor** → **profiles**: Should have a profile entry
   - **Table Editor** → **settings**: Should have default settings

## Step 9: Generate TypeScript Types (Optional but Recommended)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Generate types:
   ```bash
   supabase gen types typescript --linked > lib/supabase/database.types.ts
   ```

   Or manually:
   - Go to **Settings** → **API** → **TypeScript types**
   - Copy the generated types
   - Paste into `lib/supabase/database.types.ts`

## Troubleshooting

### "Invalid API key" error
- Check that your `.env.local` file has the correct keys
- Restart your development server after changing env vars
- Ensure keys don't have extra spaces or quotes

### "Row Level Security policy violation"
- Verify RLS policies are enabled on all tables
- Check that you're authenticated (user session exists)
- Ensure policies match your user's `user_id`

### "Table does not exist"
- Run the schema.sql file again
- Check that all tables were created in Table Editor

### Authentication not working
- Check redirect URLs in Supabase dashboard
- Verify email provider is enabled
- Check browser console for errors

## Security Checklist

- ✅ Never commit `.env.local` to git
- ✅ Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
- ✅ RLS policies are enabled on all tables
- ✅ All tables have appropriate RLS policies
- ✅ Service role key only used in server-side code
- ✅ Anon key is safe for client-side use

## Next Steps

After setup is complete:

1. Implement authentication UI (login/signup pages)
2. Update `InvoiceContext` to use Supabase instead of localStorage
3. Add middleware for protected routes
4. Test all CRUD operations
5. Set up production environment variables

## Production Deployment

When deploying to production:

1. Create a new Supabase project for production (or use the same one)
2. Set environment variables in your hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
   - Others: Check their documentation
3. Update redirect URLs in Supabase dashboard:
   - Add your production domain to allowed redirect URLs
4. Test authentication flow in production

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: Create an issue in the project repository

