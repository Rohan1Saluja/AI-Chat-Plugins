import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // VERY IMPORTANT: This tells Supabase to use cookies/localStorage
    autoRefreshToken: true,
    // detectSessionInUrl: true, // Only if using OAuth redirects
  },
});
