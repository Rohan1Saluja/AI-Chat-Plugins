import { createSupabaseServerClient } from "@/lib/supabase/server";
import { setAuthCookies } from "@/utils/authCookies";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  try {
    const { email, password, options } = await req.json(); // `options` might contain `data` for user_metadata

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check Supabase project settings for "Confirm email"
    // If "Confirm email" is ON, session will be null initially.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options, // Pass through any additional options like user_metadata
    });

    if (error) {
      console.error("Signup API Error:", error.message);
      return NextResponse.json(
        { error: error.message || "Signup failed" },
        { status: 400 }
      );
    }

    if (data.session && data.user) {
      setAuthCookies(data.session.access_token, data.session.refresh_token);
      return NextResponse.json(
        {
          user: { id: data.user.id, email: data.user.email },
          message: "Signup successful and logged in.",
        },
        { status: 201 }
      );
    } else if (data.user && !data.session) {
      // User created, but needs email confirmation (session is null)
      return NextResponse.json(
        {
          user: { id: data.user.id, email: data.user.email },
          message: "Signup successful. Please check your email to confirm.",
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: "Signup process incomplete" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Signup API Unhandled Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
