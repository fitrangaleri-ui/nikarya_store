import { createClient } from '@supabase/supabase-js'

// Admin client that bypasses RLS — use ONLY in server-side code
// (API routes, webhooks, server actions requiring elevated privileges)
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    )
}
