import { ChatWindowAction, ChatWindowState } from "./types";

export const initialChatState: ChatWindowState = {
  currentMessages: [],
  activeSessionId: null,
  allSessions: [],
  isInitialized: false,
  isAssistantProcessing: false,
  isLoading: true,
  currentSessionUserId: undefined,
  // error: null,
};

// 4. Create the Reducer Function
export function chatWindowReducer(
  state: ChatWindowState,
  action: ChatWindowAction
): ChatWindowState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "INITIALIZATION_LOADED":
      return {
        ...state,
        allSessions: action.payload.sessions,
        activeSessionId: action.payload.activeSessionId,
        // currentMessages will be set by a subsequent action based on activeSessionId
        currentSessionUserId:
          action.payload.sessions[0]?.userId ||
          (action.payload.sessions.length > 0 ? null : undefined),
      };

    case "SET_ACTIVE_SESSION_AND_MESSAGES":
      const newActiveSession = state.allSessions.find(
        (s) => s.id === action.payload.sessionId
      );
      return {
        ...state,
        activeSessionId: action.payload.sessionId,
        currentMessages: action.payload.messages,
        currentSessionUserId: newActiveSession?.userId || null,
      };

    case "RESET_CHAT_STATE_FOR_NEW_CONTEXT":
      return {
        ...initialChatState,
        isLoading: true,
        isInitialized: false,
      };

    case "CREATE_NEW_SESSION_SUCCESS":
      return {
        ...state,
        allSessions: action.payload.updatedAllSessions,
        activeSessionId: action.payload.newSession.id,
        currentMessages: action.payload.newSession.messages, // New session starts with empty messages
        isAssistantProcessing: false,
        currentSessionUserId: action.payload.newSession.userId || null, //update context
      };

    case "ADD_MESSAGE":
      return {
        ...state,
        currentMessages: [...state.currentMessages, action.payload],
      };

    case "REPLACE_MESSAGE":
      return {
        ...state,
        currentMessages: state.currentMessages.map((msg) =>
          msg.id === action.payload.id ? action.payload : msg
        ),
      };

    case "SET_ASSISTANT_PROCESSING":
      return {
        ...state,
        isAssistantProcessing: action.payload,
      };

    case "MARK_INITIALIZED":
      return {
        ...state,
        isInitialized: true,
      };

    case "UPDATE_SESSION_IN_ALL_SESSIONS": {
      const updatedSession = action.payload;
      const newAllSessions = state.allSessions.map((s) =>
        s.id === updatedSession.id ? updatedSession : s
      );
      // If the session wasn't found, it means it's a new one being added after creation by service
      if (!newAllSessions.find((s) => s.id === updatedSession.id)) {
        newAllSessions.push(updatedSession);
      }
      return {
        ...state,
        allSessions: newAllSessions,
      };
    }

    default:
      // Optional: For exhaustive check at compile time if all actions are handled
      // const _exhaustiveCheck: never = action;
      // return _exhaustiveCheck;
      throw new Error(`Unhandled action type in chatWindowReducer`);
  }
}
