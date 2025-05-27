import { supabase } from "@/lib/supabaseClient";
import {
  ChatHistoryStoreModel,
  ChatSessionModel,
  MessageModel,
} from "@/types/chat-interface";
import React from "react";
import { v4 as uuidv4 } from "uuid";

const GUEST_ACTIVE_SESSION_ID_KEY = "freya-guest-activeSessionId";
const getUserActiveSessionIdKey = (userId: string) =>
  `freya-activeSessionId-${userId}`;

// -------------------------------------------

interface ChatDataService {
  loadInitialData: (userId?: string) => Promise<{
    sessions: ChatSessionModel[];
    activeSessionId: string | null;
  }>;
  saveSession: (session: ChatSessionModel) => Promise<void>;
  saveActiveSessionIdentifier: (
    activeSessionId: string | null,
    userId?: string
  ) => Promise<void>;
  createSession: (
    existingSessionsCount: number,
    userId?: string
  ) => Promise<ChatSessionModel>;
}

// ---- Custom Hook to provide the correct service -----

export const useChatService = (): ChatDataService => {
  const loadInitialData = React.useCallback(
    async (
      userId?: string
    ): Promise<{
      sessions: ChatSessionModel[];
      activeSessionId: string | null;
    }> => {
      if (userId) {
        console.log(`ChatService: Loading initial data for user ${userId}`);
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
              let { data: messagesData, error: messagesError } = await supabase
                .from("chat_messages")
                .select("*")
                .eq("session_id", sessionRow.id)
                .order("timestamp", { ascending: true });

              if (messagesError) {
                // Continue processing other sessions or return partial data
                // For simplicity here, we'll just map empty messages if error
                messagesData = [];
              }

              const messages: MessageModel[] = (messagesData || []).map(
                (msg) => ({
                  id: msg.id,
                  sender: msg.sender,
                  content: msg.content,
                  timestamp: msg.timestamp,
                  type: msg.type,
                  pluginName: msg.plugin_name,
                  pluginData: msg.plugin_data,
                  errorMessage: msg.error_message,
                })
              );
              sessions.push({
                id: sessionRow.id,
                userId: sessionRow.user_id,
                name: sessionRow.name,
                messages: messages,
                createdAt: sessionRow.created_at,
                lastUpdatedAt: sessionRow.last_updated_at,
              });
            }
          }
          const storedActiveId = localStorage.getItem(
            getUserActiveSessionIdKey(userId)
          );

          const activeSessionId = sessions.find((s) => s.id === storedActiveId)
            ? storedActiveId
            : null;

          console.log(
            `ChatService: Loaded ${sessions.length} sessions for user ${userId}. Active ID: ${activeSessionId}`
          );

          return { sessions, activeSessionId };
        } catch (error) {
          console.error(
            "ChatService: Error loading initial data from Supabase for user:",
            error
          );
          return { sessions: [], activeSessionId: null };
        }
      } else {
        console.log(
          "ChatService: Initializing for GUEST. Sessions are ephemeral and not loaded from persistence."
        );
        // For guests, sessions are destroyed on refresh, so we don't load anything.
        // We also don't look for a guest activeSessionId from localStorage here,
        // because a new session will be created by the orchestrator.
        return { sessions: [], activeSessionId: null };
      }
    },
    []
  );

  const createSession = React.useCallback(
    async (
      sessionNumber: number,
      userId?: string
    ): Promise<ChatSessionModel> => {
      const newSessionId = uuidv4();

      const now = new Date().toISOString();

      // Supabase user
      if (userId) {
        console.log(
          `ChatService: Creating new session for user ${userId}, number ${sessionNumber}`
        );
        const newSessionData = {
          id: newSessionId,
          user_id: userId,
          name: `Chat ${sessionNumber + 1} - ${now}`,
          created_at: now,
          last_updated_at: now,
        };

        const { data, error } = await supabase
          .from("chat_sessions")
          .insert(newSessionData)
          .select()
          .single();

        if (error) throw error;

        if (!data)
          throw new Error(
            "Failed to create session in Supabase: No data returned."
          );

        return {
          id: data.id,
          userId: data.user_id,
          name: data.name,
          messages: [],
          createdAt: data.created_at,
          lastUpdatedAt: data.last_updated_at,
        };
      }
      // Guest User
      else {
        console.log(
          `ChatService: Creating new GUEST session, number ${sessionNumber}`
        );

        const guestSession: ChatSessionModel = {
          id: newSessionId,
          name: `Guest Chat ${sessionNumber + 1}`,
          messages: [],
          createdAt: now,
          lastUpdatedAt: now,
        };
        return guestSession;
      }
    },
    []
  );

  const saveSession = React.useCallback(
    async (session: ChatSessionModel): Promise<void> => {
      if (session.userId) {
        console.log(
          `ChatService: Saving session ${session.id} for user ${session.userId} to Supabase.`
        );
        const { id, userId, name, createdAt, messages } = session;
        const lastUpdatedAt = new Date().toISOString();

        const { error: sessionUpsertError } = await supabase
          .from("chat_sessions")
          .upsert({
            id,
            user_id: userId,
            name,
            created_at: createdAt,
            last_updated_at: lastUpdatedAt,
          });

        if (sessionUpsertError) throw sessionUpsertError;

        // Delete existing messages and re-insert (simple strategy)
        //  TODO: why are we not pushing the new message? The current approach seems to be expensive
        await supabase.from("chat_messages").delete().eq("session_id", id);

        if (messages.length > 0) {
          const messagesToInsert = messages.map((msg) => ({
            id: msg.id,
            session_id: id,
            user_id: userId,
            sender: msg.sender,
            content: msg.content,
            timestamp: msg.timestamp,
            type: msg.type,
            plugin_name: msg.pluginName,
            plugin_data: msg.pluginData,
            error_message: msg.errorMessage,
          }));

          const { error: messagesInsertError } = await supabase
            .from("chat_messages")
            .insert(messagesToInsert);
          if (messagesInsertError) throw messagesInsertError;

          console.log(
            `ChatService: Session ${session.id} (user: ${userId}) and its ${messages.length} messages saved.`
          );
        } else {
          console.log(
            `ChatService: Session ${session.id} is a GUEST session. Not saving to persistent store.`
          );
          // Guest sessions are ephemeral; data lives in React state and is lost on refresh.
        }
      }
    },
    []
  );

  // This function ONLY saves the active session ID to localStorage.
  // Session data itself is saved via saveSession (for users) or not at all (for guests).

  const saveActiveSessionIdentifier = React.useCallback(
    async (activeSessionId: string | null, userId?: string): Promise<void> => {
      const key = userId
        ? getUserActiveSessionIdKey(userId)
        : GUEST_ACTIVE_SESSION_ID_KEY;

      if (activeSessionId) {
        localStorage.setItem(key, activeSessionId);
        console.log(
          `ChatService: Active session ID ${activeSessionId} saved to localStorage for ${
            userId ? "user " + userId : "guest"
          }. Key: ${key}`
        );
      } else {
        localStorage.removeItem(key);
        console.log(
          `ChatService: Active session ID removed from localStorage for ${
            userId ? "user " + userId : "guest"
          }. Key: ${key}`
        );
      }
    },
    []
  );

  // ----------------------------------------------------
  // ----------------------------------------------------

  return {
    loadInitialData,
    createSession,
    saveSession,
    saveActiveSessionIdentifier,
  };
};
