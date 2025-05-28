import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getAccessTokenFromCookie,
  getRefreshTokenFromCookie,
  setAuthCookies,
} from "@/utils/authCookies";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createSupabaseServerClient();

  const accessToken = await getAccessTokenFromCookie();

  if (!accessToken) {
    return NextResponse.json(
      { user: null, error: "No active session cookie" },
      { status: 401 }
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);

  if (userError) {
    const refreshTokenCookie = await getRefreshTokenFromCookie();

    if (refreshTokenCookie) {
      const { data: refreshData, error: refreshError } =
        await supabase.auth.refreshSession({
          refresh_token: refreshTokenCookie,
        });

      if (refreshError || !refreshData.session || !refreshData.user) {
        return NextResponse.json(
          { user: null, error: "Session expired or invalid, refresh failed" },
          { status: 401 }
        );
      }
      // Successfully refreshed session, set new cookies and return new user
      await setAuthCookies(
        refreshData.session.access_token,
        refreshData.session.refresh_token
      );
      return NextResponse.json({
        user: { id: refreshData.user.id, email: refreshData.user.email },
      });
    }
    return NextResponse.json(
      { user: null, error: "Session expired or invalid, no refresh token" },
      { status: 401 }
    );
  }
  // Access token is valid
  return NextResponse.json({
    user: { id: user?.id, email: user?.email },
  });
}
