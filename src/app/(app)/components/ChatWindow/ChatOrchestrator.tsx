"use client";

import React, { useReducer, useEffect } from "react";
import { MessageModel, ChatSessionModel } from "@/types/chat-interface";
import { v4 as uuidv4 } from "uuid";
import { findPluginForMessage } from "@/lib/pluginManager";
import {
  chatWindowReducer,
  initialChatState,
} from "@/store/chatWindow/reducer";
import { useChatService } from "@/hooks/useChatService";
import ChatWindowView from "./ChatWindowView";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { signOutUser } from "@/store/auth/actions";

// It's good practice to keep the reducer and initial state with the orchestrator
// if they are not used elsewhere, or import them as you did.

export default function ChatOrchestrator() {
  const dispatch = useDispatch<AppDispatch>();
  const chatService = useChatService();
  const [chatState, chatDispatchAction] = useReducer(
    chatWindowReducer,
    initialChatState
  );
  const {
    user,
    isLoading: isAuthLoading,
    isInitialized: isAuthInitialized,
  } = useSelector((state: RootState) => state.auth);
  const {
    currentMessages,
    activeSessionId,
    allSessions,
    isInitialized: isChatLogicInitialized,
    isAssistantProcessing,
    isLoading: isChatDataLoading,
  } = chatState;

  // --- Internal Logic for Creating a New Session ---
  const handleCreateNewSessionInternal = React.useCallback(
    async (currentListOfSessions: ChatSessionModel[]) => {
      chatDispatchAction({ type: "SET_ASSISTANT_PROCESSING", payload: true });
      try {
        const newSession = await chatService.createSession(
          currentListOfSessions.length,
          user?.id
        );
        const updatedAllSessions = [
          ...currentListOfSessions.filter((s) => s.id !== newSession.id),
          newSession,
        ];

        chatDispatchAction({
          type: "CREATE_NEW_SESSION_SUCCESS",
          payload: { newSession, updatedAllSessions },
        });

        await chatService.saveActiveSessionIdentifier(newSession.id, user?.id);
      } catch (error) {
        console.error("Error creating new session:", error);
        // dispatch({ type: "SET_ERROR", payload: "Failed to create new session." });
      } finally {
        chatDispatchAction({
          type: "SET_ASSISTANT_PROCESSING",
          payload: false,
        });
      }
    },
    [chatService, chatDispatchAction, user?.id]
  );

  // ---------------------------------------------------------------------

  // --- Effect for Initial Load ---
  React.useEffect(() => {
    if (!isAuthInitialized) return;

    const initializeOrResetChat = async () => {
      chatDispatchAction({ type: "SET_LOADING", payload: true }); // Indicate chat is loading
      chatDispatchAction({ type: "RESET_CHAT_STATE_FOR_NEW_CONTEXT" });

      // ----------------------------------------------
      const {
        sessions: loadedSessions,
        activeSessionId: loadedActiveIdFromStorage,
      } = await chatService.loadInitialData(user?.id);
      chatDispatchAction({
        type: "INITIALIZATION_LOADED",
        payload: {
          sessions: loadedSessions,
          activeSessionId: loadedActiveIdFromStorage,
        },
      });

      let sessionToLoad = loadedSessions.find(
        (s) => s.id === loadedActiveIdFromStorage
      );

      if (sessionToLoad) {
        chatDispatchAction({
          type: "SET_ACTIVE_SESSION_AND_MESSAGES",
          payload: {
            sessionId: sessionToLoad.id,
            messages: sessionToLoad.messages,
          },
        });

        // Ensure active ID in localStorage is up-to-date (might be redundant if loadInitialData already set it)
        await chatService.saveActiveSessionIdentifier(
          sessionToLoad.id,
          user?.id
        );
      } else if (loadedSessions.length > 0 && user?.id) {
        sessionToLoad = loadedSessions.sort(
          (a, b) =>
            new Date(b.lastUpdatedAt).getTime() -
            new Date(a.lastUpdatedAt).getTime()
        )[0];

        chatDispatchAction({
          type: "SET_ACTIVE_SESSION_AND_MESSAGES",
          payload: {
            sessionId: sessionToLoad.id,
            messages: sessionToLoad.messages,
          },
        });

        await chatService.saveActiveSessionIdentifier(
          sessionToLoad.id,
          user?.id
        );
      } else {
        // No sessions loaded (new user, or guest, or user with no sessions)
        await handleCreateNewSessionInternal([]);
      }
      chatDispatchAction({ type: "MARK_INITIALIZED" });
      chatDispatchAction({ type: "SET_LOADING", payload: false });

      // TODO: Need to revisit this part

      if (
        isChatLogicInitialized &&
        (chatState.currentSessionUserId === user?.id ||
          (!chatState.currentSessionUserId && !user?.id))
      ) {
      }
    };

    initializeOrResetChat();
  }, [user?.id, isAuthInitialized]);

  // ------------------------------------------------------------

  // --- Effect for Saving Active Session's Messages ---
  React.useEffect(() => {
    if (!isChatLogicInitialized || !activeSessionId || !user?.id) return;
    // We want to save even if currentMessages is empty, especially if it's a newly created session
    // or if all messages were deleted (future feature).
    // The `saveSession` in the service should handle the actual "is there something to save" logic.

    const activeSessionFromState = allSessions.find(
      (s) => s.id === activeSessionId
    );

    if (activeSessionFromState) {
      if (activeSessionFromState.user_id !== user.id) return;

      // Construct the session object to save using the latest currentMessages from state
      const sessionToSave: ChatSessionModel = {
        ...activeSessionFromState, // Base metadata from allSessions
        messages: currentMessages, // Latest messages for this session
        // lastUpdatedAt: new Date().toISOString(),
      };

      // TODO: might be removed
      if (
        JSON.stringify(activeSessionFromState.messages) ===
          JSON.stringify(currentMessages) &&
        activeSessionFromState.messages.length !== 0
      ) {
        // Don't skip save for initially empty new sessions
        // console.log("Orchestrator: Save skipped, messages unchanged for session", activeSessionId);
        // return;
      }

      chatService
        .saveSession(sessionToSave)
        .then((savedOrUpdatedSession) => {
          if (savedOrUpdatedSession) {
            if (savedOrUpdatedSession.user_id) {
              chatDispatchAction({
                type: "UPDATE_SESSION_IN_ALL_SESSIONS",
                payload: savedOrUpdatedSession, // Use the session returned by the service
              });
            } else {
              // For guest, we still update lastUpdatedAt locally.
              // The saveSession for guest might just return the input session with an updated timestamp.
              // Or ChatService could handle setting lastUpdatedAt for guests before returning.
              // Let's assume saveSession returns the session with potentially updated lastUpdatedAt for guests too.
              chatDispatchAction({
                type: "UPDATE_SESSION_IN_ALL_SESSIONS",
                payload: {
                  ...savedOrUpdatedSession,
                  lastUpdatedAt: new Date().toISOString(), // Or rely on service to set this
                },
              });
            }
          }
        })
        .catch((error) => {
          console.error("Orchestrator: Failed to save session:", error);
        });
    }
  }, [
    currentMessages,
    activeSessionId,
    // chatService,
    isChatLogicInitialized,
    // allSessions,
  ]);

  // --- Public handler for the "New Chat" button ---
  const handleNewChatButtonClick = () => {
    if (isAssistantProcessing) return;
    handleCreateNewSessionInternal(allSessions);
  };

  // --- handleSendMessage Logic ---
  const handleSendMessage = async (text: string) => {
    if (!activeSessionId) {
      // This case should ideally be prevented by disabling the input if no activeSessionId
      console.warn(
        "Orchestrator: No active session to send message to. Attempting to create one."
      );
      // A more robust solution might be to queue the message or inform the user explicitly.
      // Forcing creation here could lead to unexpected UX if initializeChat is still running.
      // It's better if the UI (InputBox disabled state) handles this.
      alert(
        "No active chat session. Please click 'New Chat' or wait for initialization."
      );
      return;
    }

    const userMessage: MessageModel = {
      id: uuidv4(),
      sender: "user",
      content: text,
      timestamp: new Date().toISOString(),
      type: "text",
    };
    chatDispatchAction({ type: "ADD_MESSAGE", payload: userMessage });
    chatDispatchAction({ type: "SET_ASSISTANT_PROCESSING", payload: true });

    const processedResult = findPluginForMessage(text);
    const loadingMessageId = uuidv4();

    if (processedResult.type === "plugin_match") {
      const { plugin, args } = processedResult;
      chatDispatchAction({
        type: "ADD_MESSAGE",
        payload: {
          id: loadingMessageId,
          sender: "assistant",
          content: plugin.isLoadingMessage || "Processing...",
          timestamp: new Date().toISOString(),
          type: "loading",
          pluginName: plugin.name,
        },
      });

      try {
        const executionResult = await plugin.execute(args);

        let finalMessage: MessageModel;
        if (executionResult.success) {
          finalMessage = {
            id: loadingMessageId,
            sender: "assistant",
            content: executionResult.displayText || "",
            timestamp: new Date().toISOString(),
            type:
              executionResult.data && plugin.renderResult ? "plugin" : "text",
            pluginName: plugin.name,
            pluginData: executionResult.data,
          };
        } else {
          /* Error from plugin */
          finalMessage = {
            id: loadingMessageId,
            sender: "assistant",
            content: executionResult.error || "Plugin Error",
            timestamp: new Date().toISOString(),
            type: "error",
            pluginName: plugin.name,
            errorMessage: executionResult.error,
          };
        }
        chatDispatchAction({ type: "REPLACE_MESSAGE", payload: finalMessage });
      } catch (e) {
        /* Critical error during execution */
        chatDispatchAction({
          type: "REPLACE_MESSAGE",
          payload: {
            id: loadingMessageId,
            sender: "assistant",
            content: "Critical Plugin Execution Error",
            timestamp: new Date().toISOString(),
            type: "error",
            pluginName: plugin.name,
            errorMessage: (e as Error).message,
          },
        });
      }
    } else {
      // No plugin matched
      chatDispatchAction({
        type: "ADD_MESSAGE",
        payload: {
          id: uuidv4(),
          sender: "assistant",
          content: "I didn't understand that.",
          timestamp: new Date().toISOString(),
          type: "text",
        },
      });
    }
    chatDispatchAction({ type: "SET_ASSISTANT_PROCESSING", payload: false });
  };

  // --- Logout ---
  const handleLogout = async () => {
    // Before dispatching signOutUser, clear any guest-specific localStorage if needed.
    // If the current active session is a guest session, its ID might be in GUEST_ACTIVE_SESSION_ID_KEY.
    const currentActiveSessionIsGuest =
      activeSessionId &&
      allSessions.find((s) => s.id === activeSessionId && !s.user_id);
    if (currentActiveSessionIsGuest)
      await chatService.saveActiveSessionIdentifier(null);

    dispatch(signOutUser());
  };

  // --- UI Rendering ---
  if (
    isAuthLoading ||
    (isAuthInitialized && isChatDataLoading && !isChatLogicInitialized)
  ) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-background-900">
        <p className="text-text-500 text-lg">Initializing Chat...</p>
        {/* Consider adding a visual spinner component here */}
      </div>
    );
  }

  if (isAuthInitialized && !isChatLogicInitialized && !isChatDataLoading) {
    return (
      <div className="flex h-screen w-fit items-center justify-center bg-background-900">
        <p className="text-xl">Loading your chats...</p>
      </div>
    );
  }

  const activeSessionName = activeSessionId
    ? allSessions.find((s) => s.id === activeSessionId)?.name ||
      (user?.id
        ? `Session ${activeSessionId.substring(0, 4)}...`
        : "Guest Chat")
    : "New Chat";

  return (
    <ChatWindowView
      currentMessages={currentMessages}
      activeSessionId={activeSessionId}
      activeSessionName={activeSessionName}
      isAssistantProcessing={isAssistantProcessing}
      onSendMessage={handleSendMessage}
      onNewChatClick={handleNewChatButtonClick}
      isAuthenticated={!!user}
      userEmail={user?.email}
      onLogoutClick={handleLogout}
    />
  );
}
