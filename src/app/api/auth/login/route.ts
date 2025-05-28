import { createSupabaseServerClient } from "@/lib/supabase/server";
import { setAuthCookies } from "@/utils/authCookies";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();

  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Invalid credentials" },
        { status: 401 }
      );
    }
    if (data.session && data.user) {
      await setAuthCookies(
        data.session.access_token,
        data.session.refresh_token
      );

      return NextResponse.json({
        user: {
          id: data.user.id,
          email: data.user.email /* other safe user fields */,
        },
      });
    }
    return NextResponse.json(
      { error: "Login failed: No session data returned" },
      { status: 500 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
