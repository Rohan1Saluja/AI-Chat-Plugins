// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  clearAuthCookies,
  getAccessTokenFromCookie,
} from "@/utils/authCookies";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();

  // Optional: Invalidate session on Supabase side if possible

  const accessToken = await getAccessTokenFromCookie();
  let signOutError = null;

  if (accessToken) {
    // Sign out the user from Supabase (no access token parameter needed)
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn(
        "Logout API: Error signing out from Supabase:",
        error.message
      );
      signOutError = error;
    }
  } else {
    console.warn(
      "Logout API: No access token cookie found to invalidate Supabase session explicitly."
    );
    // If no token, Supabase's signOut without a token is a no-op for server-side invalidation.
    // We primarily rely on clearing the client's cookies.
  }

  // Always clear HttpOnly cookies on the response
  await clearAuthCookies();

  if (signOutError) {
    // Inform client if Supabase signout failed, but cookies are cleared
    return NextResponse.json({
      message:
        "Logged out (cookies cleared), but Supabase session invalidation might have failed.",
    });
  }

  return NextResponse.json({ message: "Successfully logged out" });
}
