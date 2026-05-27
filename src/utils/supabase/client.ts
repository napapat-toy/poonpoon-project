import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase Browser Client for client-side queries.
 * Returns null if not configured to prevent client-side crashes in mock mode.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
