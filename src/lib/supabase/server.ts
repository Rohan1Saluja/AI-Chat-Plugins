// utils/supabase/server.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
// cookies import from 'next/headers' is not directly used by supabase-js for auth here,
// but you'll use it in API routes to get the token.

export function createSupabaseServerClient(jwt?: string): SupabaseClient {
  const options: {
    global?: { headers?: Record<string, string> };
    auth?: { persistSession?: boolean };
  } = {};

  if (jwt) {
    options.global = {
      headers: {
        ...options.global?.headers,
        Authorization: `Bearer ${jwt}`,
      },
    };
  }
  // When providing a JWT directly, Supabase client won't try to manage session persistence via cookies/localStorage
  // for THIS instance, it will just use the provided token.
  // options.auth = { persistSession: false }; // Often recommended when manually setting JWT
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    options
  );
}
