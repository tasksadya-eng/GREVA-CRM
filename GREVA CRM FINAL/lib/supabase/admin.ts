import { createClient } from "@supabase/supabase-js";

/**
 * Server-only. Use only in Server Actions or Route Handlers.
 * Optional: set SUPABASE_SERVICE_ROLE_KEY to enable "Add employee" from app.
 * Never expose this key to the client.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export function hasAdminKey(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
