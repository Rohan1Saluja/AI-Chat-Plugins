import {
  ChatHistoryStoreModel,
  ChatSessionModel,
} from "@/types/chat-interface";
import { v4 as uuidv4 } from "uuid";

const LOCAL_STORAGE_KEY = "aiChatAppGuestHistory";

interface ChatDataService {
  loadInitialData: () => Promise<{
    sessions: ChatSessionModel[];
    activeSessionId: string | null;
  }>;
  saveSession: (session: ChatSessionModel) => Promise<void>;
  saveAllSessions: (
    sessions: ChatSessionModel[],
    activeSessionId: string | null
  ) => Promise<void>;
  createSession: (existingSessionsCount: number) => Promise<ChatSessionModel>;
}

interface User {
  id: string;
  isGuest: boolean;
}

const getCurrentUser = (): User => {
  // In the future, this would come from your auth context (e.g., useAuth())
  // For now, let's simulate:
  return { id: "guestUser", isGuest: true };
};

// ---- localStorage implementation -----

const localStorageService: ChatDataService = {
  loadInitialData: async () => {
    if (typeof window === "undefined")
      return { sessions: [], activeSessionId: null };

    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData) as ChatHistoryStoreModel;
        return {
          sessions: parsed.sessions || [],
          activeSessionId: parsed.activeSessionId || null,
        };
      } catch (e) {
        console.error("Failed to parse guest chat history", e);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
    return { sessions: [], activeSessionId: null };
  },

  saveSession: async (session) => {
    if (typeof window === "undefined") return;

    const { sessions: existingSessions, activeSessionId } =
      await localStorageService.loadInitialData();
    const sessionIndex = existingSessions.findIndex((s) => s.id === session.id);

    if (sessionIndex !== -1) existingSessions[sessionIndex] = session;
    else existingSessions.push(session);

    await localStorageService.saveAllSessions(
      existingSessions,
      activeSessionId === session.id ? session.id : activeSessionId
    );
  },

  saveAllSessions: async (sessions, activeSessionId) => {
    if (typeof window === "undefined") return;

    const dataToStore: ChatHistoryStoreModel = { sessions, activeSessionId };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));
  },

  createSession: async (existingSessionsCount) => {
    const newSession: ChatSessionModel = {
      id: uuidv4(),
      messages: [],
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      name: `Chat ${
        existingSessionsCount + 1
      } - ${new Date().toLocaleDateString()}`,
    };
    return newSession;
  },
};

// ---- Backend API implementation (future scope - placeholder) -----

const apiService: ChatDataService = {
  loadInitialData: async () => {
    console.log("API: loading initial data for logged in user");

    return { sessions: [], activeSessionId: null };
  },
  saveSession: async (session) => {
    console.log("API: saving session for logged in user");
  },
  saveAllSessions: async (sessions, activeSessionId) => {
    console.log("API: saving all sessions for logged in user");
  },
  createSession: async (existingSessionsCount) => {
    console.log("API: Creating new session for logged in user");
    const newSessionData = {
      name: `Chat ${
        existingSessionsCount + 1
      } - ${new Date().toLocaleDateString()}`,
    };

    const tempSession: ChatSessionModel = {
      id: uuidv4(),
      messages: [],
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      name: newSessionData.name,
    };
    return tempSession;
  },
};

// ---- Custom Hook to provide the correct service -----

export const useChatService = (): ChatDataService => {
  const user = getCurrentUser();

  if (user.isGuest) return localStorageService;
  return apiService;
};
