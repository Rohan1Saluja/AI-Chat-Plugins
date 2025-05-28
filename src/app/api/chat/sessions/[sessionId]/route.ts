import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ChatSessionModel } from "@/types/chat-interface";
import { getAccessTokenFromCookie } from "@/utils/authCookies";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

async function authenticateAndGetContext(request: NextRequest): Promise<{
  user: User | null;
  supabaseClient: SupabaseClient;
  error: string | null;
}> {
  const accessToken = await getAccessTokenFromCookie();
  if (!accessToken) {
    return {
      user: null,
      supabaseClient: createSupabaseServerClient(),
      error: "Missing session cookie",
    };
  }

  // Create client WITH the token for data operations
  const supabase = createSupabaseServerClient(accessToken);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken); // Validate token
  if (userError || !user) {
    return {
      user: null,
      supabaseClient: supabase,
      error: userError?.message || "Invalid session",
    };
  }
  return { user, supabaseClient: supabase, error: null };
}

// --------------------------------------------------------------
// Update the chat session for the authenticated user
// --------------------------------------------------------------

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const { sessionId } = params;

  if (!sessionId || typeof sessionId !== "string") {
    console.error(
      "PUT /api/chat/sessions/ - Error: sessionId not found or invalid in params",
      params
    );
    return NextResponse.json(
      { error: "Invalid or missing sessionId" },
      { status: 400 }
    );
  }

  const {
    user,
    supabaseClient,
    error: authError,
  } = await authenticateAndGetContext(req);

  if (authError || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = user.id;

  try {
    const sessionToSave: ChatSessionModel = await req.json();

    if (sessionToSave.id !== sessionId || sessionToSave.userId !== userId) {
      return NextResponse.json(
        { error: "Session Id or User Id mismatch" },
        { status: 403 }
      );
    }

    const lastUpdatedAt = new Date().toISOString();

    // 1. Upsert session metadata (name, lastUpdatedAt)
    // We trust RLS to ensure the user owns this session.

    const { error: sessionUpsertError } = await supabaseClient
      .from("chat_sessions")
      .update({ name: sessionToSave.name, last_updated_at: lastUpdatedAt })
      .eq("id", sessionId)
      .eq("user_id", userId);

    if (sessionUpsertError) {
      console.error("API PUT sessionUpsertError:", sessionUpsertError);
      throw new Error(
        `Failed to update session metadata ${sessionUpsertError.message}`
      );
    }

    // 2. Handle messages: Delete existing and insert new ones
    // This should ideally be in a transaction if your DB supports it easily via Supabase RPC.
    // For simplicity, we do it sequentially. RLS applies here too.

    const { error: deleteError } = await supabaseClient
      .from("chat_messages")
      .delete()
      .eq("session_id", sessionId);

    if (deleteError) {
      console.error("API PUT deleteError:", deleteError);
      throw new Error(`Failed to delete old messages: ${deleteError.message}`);
    }

    if (sessionToSave.messages && sessionToSave.messages.length > 0) {
      const messagesToInsert = sessionToSave.messages.map((msg) => ({
        id: msg.id,
        session_id: sessionId,
        user_id: userId, // Explicitly set owner
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp,
        type: msg.type,
        plugin_name: msg.pluginName,
        plugin_data: msg.pluginData,
        error_message: msg.errorMessage,
      }));

      const { error: messagesInsertError } = await supabaseClient
        .from("chat_messages")
        .insert(messagesToInsert);

      if (messagesInsertError) {
        console.error("API PUT messagesInsertError:", messagesInsertError);
        throw new Error(
          `Failed to insert messages: ${messagesInsertError.message}`
        );
      }
    }

    const updatedSession: ChatSessionModel = {
      ...sessionToSave,
      lastUpdatedAt,
    };

    return NextResponse.json(updatedSession);
  } catch (error: any) {
    console.error(`API PUT /sessions/${sessionId} Error:`, error);
    if (error.code === "PGRST204") {
      // PostgREST code for no rows updated (could mean session not found or RLS block)
      return NextResponse.json(
        { error: "Session not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to save session" },
      { status: 500 }
    );
  }
}
