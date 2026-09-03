import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

/**
 * Server-only Supabase client with Service Role Key.
 * Bypasses RLS for trusted server-side flows:
 * - High-speed redirect lookups
 * - Non-blocking click events ingestion
 * - Calling atomic RPC counter functions
 *
 * NEVER import or expose this in client components.
 */
export function createAdminClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ''
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    ''

  if (!supabaseUrl || !serviceRoleKey) {
    // Fallback to anon/publishable key in local development if service role key is not yet configured
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      ''
    return createClient<Database>(supabaseUrl, anonKey || 'placeholder-key', {
      auth: { persistSession: false },
    })
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
