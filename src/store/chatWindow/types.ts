import { ChatSessionModel, MessageModel } from "@/types/chat-interface";

// 1. Define State Shape
export interface ChatWindowState {
  currentMessages: MessageModel[];
  currentSessionUserId?: string | null;
  activeSessionId: string | null;
  allSessions: ChatSessionModel[];
  isInitialized: boolean;
  isAssistantProcessing: boolean;
  isLoading?: boolean;
  // error: string | null; // Optional: for displaying UI-level errors
}

export type ChatWindowAction =
  | { type: "SET_LOADING"; payload: boolean }
  | {
      type: "INITIALIZATION_LOADED";
      payload: { sessions: ChatSessionModel[]; activeSessionId: string | null };
    }
  | {
      type: "SET_ACTIVE_SESSION_AND_MESSAGES";
      payload: { sessionId: string; messages: MessageModel[] };
    }
  | {
      type: "CREATE_NEW_SESSION_SUCCESS";
      payload: {
        newSession: ChatSessionModel;
        updatedAllSessions: ChatSessionModel[];
      };
    }
  | { type: "ADD_MESSAGE"; payload: MessageModel }
  | { type: "REPLACE_MESSAGE"; payload: MessageModel } // For updating loading message to final
  | { type: "SET_ASSISTANT_PROCESSING"; payload: boolean }
  | { type: "MARK_INITIALIZED" }
  | { type: "UPDATE_SESSION_IN_ALL_SESSIONS"; payload: ChatSessionModel } // When a single session is updated
  | { type: "RESET_CHAT_STATE_FOR_NEW_CONTEXT" };
