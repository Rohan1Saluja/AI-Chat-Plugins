"use client";

import React, { useReducer, useEffect, useCallback } from "react";
import { MessageModel, ChatSessionModel } from "@/types/chat-interface"; // Adjust path
import { v4 as uuidv4 } from "uuid"; // For message IDs
import {
  findPluginForMessage,
  ProcessedMessageResult,
} from "@/lib/pluginManager"; // Adjust path
import {
  chatWindowReducer,
  initialChatState,
} from "@/store/chatWindow/reducer"; // Adjust path
import { useChatService } from "@/hooks/useChatData"; // Adjust path
import ChatWindowView from "./ChatWindowView"; // The presentational component we just created
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
    session,
    isLoading: isAuthLoading,
    isInitialized: isAuthInitialized,
  } = useSelector((state: RootState) => state.auth);
  const {
    currentMessages,
    activeSessionId,
    allSessions,
    isInitialized: isChatLogicInitialized,
    isAssistantProcessing,
  } = chatState;

  // --- Internal Logic for Creating a New Session ---
  const handleCreateNewSessionInternal = useCallback(
    async (currentListOfSessions: ChatSessionModel[]) => {
      chatDispatchAction({ type: "SET_ASSISTANT_PROCESSING", payload: true }); // Indicate work
      try {
        const newSession = await chatService.createSession(
          currentListOfSessions.length
        );
        const updatedAllSessions = [
          ...currentListOfSessions.filter((s) => s.id !== newSession.id),
          newSession,
        ];

        chatDispatchAction({
          type: "CREATE_NEW_SESSION_SUCCESS",
          payload: { newSession, updatedAllSessions },
        });

        await chatService.saveAllSessions(updatedAllSessions, newSession.id);
        console.log(
          "Orchestrator: New session created and saved:",
          newSession.id
        );
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
    [chatService, chatDispatchAction]
  );

  // ---------------------------------------------------------------------

  // --- Effect for Initial Load ---
  useEffect(() => {
    if (!isAuthInitialized || isChatLogicInitialized) return;

    const initializeChat = async () => {
      const { sessions: loadedSessions, activeSessionId: loadedActiveId } =
        await chatService.loadInitialData();
      chatDispatchAction({
        type: "INITIALIZATION_LOADED",
        payload: { sessions: loadedSessions, activeSessionId: loadedActiveId },
      });

      let sessionToLoad = loadedSessions.find((s) => s.id === loadedActiveId);

      if (sessionToLoad) {
        chatDispatchAction({
          type: "SET_ACTIVE_SESSION_AND_MESSAGES",
          payload: {
            sessionId: sessionToLoad.id,
            messages: sessionToLoad.messages,
          },
        });
      } else if (loadedSessions.length > 0) {
        sessionToLoad = loadedSessions.sort(
          (a, b) =>
            new Date(b.lastUpdatedAt).getTime() -
            new Date(a.lastUpdatedAt).getTime()
        )[0];
        if (sessionToLoad) {
          chatDispatchAction({
            type: "SET_ACTIVE_SESSION_AND_MESSAGES",
            payload: {
              sessionId: sessionToLoad.id,
              messages: sessionToLoad.messages,
            },
          });
        } else {
          // Should be unreachable if loadedSessions.length > 0
          await handleCreateNewSessionInternal(loadedSessions);
        }
      } else {
        await handleCreateNewSessionInternal([]);
      }
      chatDispatchAction({ type: "MARK_INITIALIZED" });
    };

    initializeChat();
  }, [
    chatService,
    isChatLogicInitialized,
    handleCreateNewSessionInternal,
    user,
    isAuthInitialized,
  ]);

  // ------------------------------------------------------------

  // --- Effect for Saving Active Session's Messages ---
  useEffect(() => {
    if (!isChatLogicInitialized || !activeSessionId) return;
    // We want to save even if currentMessages is empty, especially if it's a newly created session
    // or if all messages were deleted (future feature).
    // The `saveSession` in the service should handle the actual "is there something to save" logic.

    const activeSessionFromState = allSessions.find(
      (s) => s.id === activeSessionId
    );

    if (activeSessionFromState) {
      // Construct the session object to save using the latest currentMessages from state
      const sessionToSave: ChatSessionModel = {
        ...activeSessionFromState, // Base metadata from allSessions
        messages: currentMessages, // Latest messages for this session
        lastUpdatedAt: new Date().toISOString(),
      };

      // Avoid saving if messages haven't actually changed from what's in allSessions for this session
      // This is a shallow check, for true equality you might need to stringify or deep-compare,
      // but this can prevent some redundant saves.
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
        .then(() => {
          console.log(
            `Orchestrator: Session ${activeSessionId} saved successfully.`
          );
          // If saveSession in the service updated the persistent store,
          // we need to ensure our `allSessions` state reflects at least the `lastUpdatedAt`
          // and any other metadata that might have changed.
          chatDispatchAction({
            type: "UPDATE_SESSION_IN_ALL_SESSIONS",
            payload: sessionToSave, // Send the complete session data that was saved
          });
        })
        .catch((error) => {
          console.error("Orchestrator: Failed to save session:", error);
        });
    }
  }, [currentMessages, activeSessionId, chatService, isChatLogicInitialized]);

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
  const handleLogout = () => {
    dispatch(signOutUser());
  };

  // --- UI Rendering ---
  if (!isAuthInitialized || (!user && !isChatLogicInitialized)) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-background-900">
        <p className="text-textColor text-xl">Initializing Chat...</p>
        {/* Consider adding a visual spinner component here */}
      </div>
    );
  }

  if (user && !isChatLogicInitialized && !isAuthLoading) {
    return (
      <div className="flex h-screen w-fit items-center justify-center bg-background-900">
        <p className="text-xl">Loading your chats...</p>
      </div>
    );
  }

  const activeSessionName = activeSessionId
    ? allSessions.find((s) => s.id === activeSessionId)?.name ||
      `Session ${activeSessionId.substring(0, 4)}...`
    : "New Chat";

  return (
    <ChatWindowView
      currentMessages={currentMessages}
      activeSessionId={activeSessionId}
      activeSessionName={activeSessionName}
      isAssistantProcessing={isAssistantProcessing}
      onSendMessage={handleSendMessage}
      onNewChatClick={handleNewChatButtonClick}
      isAuthenticated={!!session}
      userEmail={user?.email}
      onLogoutClick={handleLogout}
    />
  );
}
