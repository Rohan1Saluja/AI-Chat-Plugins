import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ChatSessionModel, MessageModel } from "@/types/chat-interface";
import { getAccessTokenFromCookie } from "@/utils/authCookies";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

async function authenticateChatRequest(
  supabaseClient: ReturnType<typeof createSupabaseServerClient>
) {
  const accessToken = await getAccessTokenFromCookie(); // Reads from request cookies

  if (!accessToken) {
    return { user: null, error: "Chat API: Missing session cookie" };
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser(accessToken);
  // NOTE: This doesn't handle token refresh for chat APIs.
  // If token is expired, this will fail. For a better UX, chat APIs might also need
  // to attempt refresh like the /api/auth/user endpoint or redirect to login.
  // For simplicity now, we'll assume token is valid or /api/auth/user refreshed it recently.

  if (userError || !user) {
    console.error(
      "authenticateChatRequest: supabase.auth.getUser Error or no user:",
      userError?.message || "No user object"
    );

    return {
      user: null,
      error: userError?.message || "Chat API: Invalid session",
    };
  }
  return { user, error: null };
}

// ----------------------------------------------------
// GET all chat sessions for the authenticated user
// ----------------------------------------------------

export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient();

  const { user, error: authError } = await authenticateChatRequest(supabase);

  if (authError || !user) {
    return NextResponse.json(
      { error: `Chat API Unauthorized: ${authError}` },
      { status: 401 }
    );
  }

  const userId = user.id;

  try {
    const { data: sessionsData, error: sessionsError } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("last_updated_at", { ascending: false });

    if (sessionsError) throw sessionsError;

    const sessions: ChatSessionModel[] = [];

    if (sessionsData) {
      for (const sessionRow of sessionsData) {
        const { data: messagesData, error: messagesError } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("session_id", sessionRow.id)
          .order("timestamp", { ascending: true });

        if (messagesError)
          console.warn(
            `API: Error loading messages for session ${sessionRow.id}`,
            messagesError
          );

        const messages: MessageModel[] = (messagesData || []).map((msg) => ({
          id: msg.id,
          sender: msg.sender,
          content: msg.content,
          timestamp: msg.timestamp,
          type: msg.type,
          pluginName: msg.plugin_name,
          pluginData: msg.plugin_data,
          errorMessage: msg.error_message,
        }));
        sessions.push({
          id: sessionRow.id,
          user_id: sessionRow.user_id,
          name: sessionRow.name,
          messages: messages,
          createdAt: sessionRow.created_at,
          lastUpdatedAt: sessionRow.last_updated_at,
        });
      }
    }
    return NextResponse.json(sessions);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load sessions" },
      { status: 500 }
    );
  }
}

// --------------------------------------------------------------
// POST a new chat session for the authenticated user
// --------------------------------------------------------------

async function validateTokenAndGetUser(
  accessToken: string,
  supabaseForAuthValidation: SupabaseClient
): Promise<{ user: User | null; error: string | null }> {
  const {
    data: { user },
    error: userError,
  } = await supabaseForAuthValidation.auth.getUser(accessToken);
  if (userError || !user) {
    const errorMessage = userError
      ? userError.message
      : "Chat API: Invalid session (no user object from token)";
    console.warn("validateTokenAndGetUser failed:", errorMessage);
    return { user: null, error: errorMessage };
  }
  return { user, error: null };
}

export async function POST(request: Request) {
  const accessToken = await getAccessTokenFromCookie();

  if (!accessToken) {
    return NextResponse.json(
      { error: "Chat API Unauthorized: Missing session cookie" },
      { status: 401 }
    );
  }

  const tempSupabaseClientForAuth = createSupabaseServerClient();
  const { user, error: authValidationError } = await validateTokenAndGetUser(
    accessToken,
    tempSupabaseClientForAuth
  );

  if (authValidationError || !user) {
    console.error(
      "POST /api/chat/sessions: Authentication failed:",
      authValidationError
    );
    return NextResponse.json(
      { error: `Chat API Unauthorized: ${authValidationError}` },
      { status: 401 }
    );
  }

  const userId = user.id;

  const supabaseDataClient = createSupabaseServerClient(accessToken);
  try {
    const body = await request.json();
    const sessionNumber = body.sessionNumber as number;

    if (typeof sessionNumber !== "number") {
      return NextResponse.json(
        { error: "sessionNumber is required and must be a number" },
        { status: 400 }
      );
    }
    const newSessionId = uuidv4();
    const now = new Date().toISOString();
    const newSessionData = {
      id: newSessionId,
      user_id: userId,
      name: `Chat ${sessionNumber + 1}`,
      created_at: now,
      last_updated_at: now,
    };

    const { data: created, error: insertError } = await supabaseDataClient
      .from("chat_sessions")
      .insert(newSessionData)
      .select()
      .single();

    if (insertError) {
      console.error(
        "POST /chat/sessions - Supabase insertError (RLS or other DB error):",
        JSON.stringify(insertError, null, 2)
      );
      throw insertError;
    }
    if (!created) throw new Error("Session creation failed, no data returned.");

    const newSession: ChatSessionModel = {
      id: created.id,
      user_id: created.user_id,
      name: created.name,
      messages: [],
      createdAt: created.created_at,
      lastUpdatedAt: created.last_updated_at,
    };
    return NextResponse.json(newSession, { status: 201 });
  } catch (error: any) {
    console.error("API POST /sessions Error:", error);
    // Check for RLS violation specifically
    if (error.code === "42501") {
      return NextResponse.json(
        {
          error: "Row-level security policy violation.",
          details: error.message,
        },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create session" },
      { status: 500 }
    );
  }
}
