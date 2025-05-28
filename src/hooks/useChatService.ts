import { ChatSessionModel } from "@/types/chat-interface";
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
  saveSession: (session: ChatSessionModel) => Promise<ChatSessionModel | void>;
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
        try {
          const response = await fetch("/api/chat/sessions");
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              `Failed to load sessions: ${response.status} ${
                response.statusText
              } - ${errorData.error || ""}`
            );
          }

          const sessions = await response.json();

          const storedActiveId = localStorage.getItem(
            getUserActiveSessionIdKey(userId)
          );

          const activeSessionId = sessions.find(
            (s: any) => s.id === storedActiveId
          )
            ? storedActiveId
            : null;

          // console.log(
          //   `ChatService: Loaded ${sessions.length} sessions for user ${userId}. Active ID: ${activeSessionId}`
          // );

          return { sessions, activeSessionId };
        } catch (error) {
          console.error(
            "ChatService: Error loading initial data from Supabase for user:",
            error
          );
          return { sessions: [], activeSessionId: null };
        }
      } else {
        // console.log(
        //   "ChatService: Initializing for GUEST. Sessions are ephemeral and not loaded from persistence."
        // );
        // For guests, sessions are destroyed on refresh, so we don't load anything.
        // We also don't look for a guest activeSessionId from localStorage here,
        // because a new session will be created by the orchestrator.
        return { sessions: [], activeSessionId: null };
      }
    },
    []
  );

  // -----------------------------------------------------

  const createSession = React.useCallback(
    async (
      sessionNumber: number,
      userId?: string
    ): Promise<ChatSessionModel> => {
      // Supabase authenticated user
      if (userId) {
        // console.log(
        //   `ChatService: Creating new session for user ${userId}, number ${sessionNumber}`
        // );
        const response = await fetch("api/chat/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionNumber }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Failed to create session: ${response.status} ${
              response.statusText
            } - ${errorData.error || errorData.details || ""}`
          );
        }

        const newSession: ChatSessionModel = await response.json();

        return newSession;
      }
      // Guest User
      else {
        const now = new Date().toISOString();

        const guestSession: ChatSessionModel = {
          id: uuidv4(),
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

  // -----------------------------------------------------

  const saveSession = React.useCallback(
    async (session: ChatSessionModel): Promise<ChatSessionModel | void> => {
      if (session.user_id && session.id) {
        //only save if authenticated user
        // console.log(
        //   `ChatService: Saving session ${session.id} for user ${session.userId} to Supabase.`
        // );

        const response = await fetch(`/api/chat/sessions/${session.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(session),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Failed to save session: ${response.status} ${
              response.statusText
            } - ${errorData.error || ""}`
          );
        }

        const updatedSession: ChatSessionModel = await response.json();

        return updatedSession;
      } else {
        console.log(
          `ChatService: Session ${session.id} is a GUEST session. Not saving to persistent store.`
        );
        // Guest sessions are ephemeral; data lives in React state and is lost on refresh.
        return session;
      }
    },
    []
  );

  // -----------------------------------------------------

  // This function ONLY saves the active session ID to localStorage.
  // Session data itself is saved via saveSession (for users) or not at all (for guests).

  const saveActiveSessionIdentifier = React.useCallback(
    async (activeSessionId: string | null, userId?: string): Promise<void> => {
      const key = userId
        ? getUserActiveSessionIdKey(userId)
        : GUEST_ACTIVE_SESSION_ID_KEY;

      if (activeSessionId) {
        localStorage.setItem(key, activeSessionId);
        // console.log(
        //   `ChatService: Active session ID ${activeSessionId} saved to localStorage for ${
        //     userId ? "user " + userId : "guest"
        //   }. Key: ${key}`
        // );
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
