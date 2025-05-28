import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ChatSessionModel, MessageModel } from "@/types/chat-interface";
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
  const { sessionId } = await params;

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

    if (sessionToSave.id !== sessionId || sessionToSave.user_id !== userId) {
      return NextResponse.json(
        { error: "Session Id or User Id mismatch" },
        { status: 403 }
      );
    }

    const { messages: messagesFromRequest, ...sessionMeta } = sessionToSave;

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: updatedSession, error: sessionUpsertError } =
      await supabaseClient
        .from("chat_sessions")
        .update({
          name: sessionMeta.name,
          last_updated_at: new Date().toISOString(), // Or use sessionMeta.lastUpdatedAt if client sends it reliably
          // Add any other updatable session fields
        })
        .eq("id", sessionId)
        .eq("user_id", user.id) // Important: ensure user owns the session
        .select()
        .single();

    if (sessionUpsertError) {
      console.error("API PUT sessionUpsertError:", sessionUpsertError);
      throw new Error(
        `Failed to update session metadata ${sessionUpsertError.message}`
      );
    }

    if (!updatedSession) {
      return NextResponse.json(
        { error: "Session not found or access denied" },
        { status: 404 }
      );
    }

    if (messagesFromRequest && messagesFromRequest.length > 0) {
      const messagesToUpsert = messagesFromRequest.map((msg: MessageModel) => ({
        id: msg.id, // Crucial: this is the primary key for chat_messages
        session_id: sessionId,
        user_id: user.id, // Assuming messages also have user_id for RLS/ownership
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp,
        type: msg.type,
        plugin_name: msg.pluginName,
        plugin_data: msg.pluginData,
        error_message: msg.errorMessage,
        // Add any other fields your chat_messages table has
      }));

      // Use Supabase 'upsert'.
      // 'id' should be your primary key for 'chat_messages'.
      // If 'id' is not the PK, adjust 'onConflict'.
      // If your PK is composite (e.g., id, session_id), specify both in onConflict.
      // For a simple message `id` as PK:
      const { error: messagesUpsertError } = await supabaseClient
        .from("chat_messages")
        .upsert(messagesToUpsert, {
          onConflict: "id", // Assumes 'id' is the PK of chat_messages
          // if your primary key is (id, session_id) you might need to be more specific or ensure IDs are globally unique.
          // If 'id' is unique across all messages regardless of session, 'onConflict: id' is fine.
        });

      if (messagesUpsertError) {
        console.error("API PUT messagesUpsertError:", messagesUpsertError);
        // The original error location:
        // 127 |       if (messagesInsertError) { // This was your old variable name
        // 128 |         console.error("API PUT messagesInsertError:", messagesInsertError);
        // > 129 |         throw new Error(
        //       |              ^
        // 130 |           `Failed to insert messages: ${messagesInsertError.message}`
        throw new Error(
          `Failed to upsert messages: ${messagesUpsertError.message}`
        );
      }
    } else {
      // Optional: Handle case where messagesFromRequest is empty or undefined
      // You might want to delete all messages for the session if an empty array is passed,
      // or do nothing. Current upsert logic will simply not upsert anything if the array is empty.
    }

    // Return the fully updated session (metadata + messages that were just processed)
    // You might want to fetch the messages again from DB to ensure consistency or just return what was processed.
    // For simplicity, returning the session metadata and assuming client already has messages.
    // Or, construct the full session object to return.
    const finalSessionResponse = {
      ...updatedSession,
      messages: messagesFromRequest, // Or fetch fresh messages from DB for this session
    };

    return NextResponse.json(finalSessionResponse, { status: 200 });
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
