"use client";

import { ChatSessionModel, MessageModel } from "@/types/chat-interface";
import React, { useReducer } from "react";
import { v4 as uuidv4 } from "uuid";
import MessageList from "./MessageList";
import InputBox from "./InputBox";
import { findPluginForMessage } from "@/lib/pluginManager";
import {
  chatWindowReducer,
  initialChatState,
} from "@/store/chatWindow/reducer";
import { useChatService } from "@/hooks/useChatData";

export default function ChatWindow() {
  const chatService = useChatService();
  const [state, dispatch] = useReducer(chatWindowReducer, initialChatState);
  const {
    currentMessages,
    activeSessionId,
    allSessions,
    isInitialized,
    isAssistantProcessing,
  } = state;

  const handleCreateNewSessionInternal = React.useCallback(
    async (currentListOfSessions: ChatSessionModel[]) => {
      const newSession = await chatService.createSession(
        currentListOfSessions.length
      );
      // The service's createSession might or might not save it directly.
      // We need to ensure our local state of allSessions is updated and then persist the whole structure.
      const updatedAllSessions = [
        ...currentListOfSessions.filter((s) => s.id !== newSession.id),
        newSession,
      ];

      dispatch({
        type: "CREATE_NEW_SESSION_SUCCESS",
        payload: { newSession, updatedAllSessions },
      });

      // Persist the new session list and active ID using saveAllSessions
      // This is crucial especially for localStorage to know the new session exists in the list
      await chatService.saveAllSessions(updatedAllSessions, newSession.id);
      console.log("Dispatched create new session success:", newSession.id);
    },
    [chatService]
  );

  React.useEffect(() => {
    // --- Effect for Initial Load ---
    if (isInitialized) return;

    const initializeChat = async () => {
      const { sessions: loadedSessions, activeSessionId: loadedActiveId } =
        await chatService.loadInitialData();
      dispatch({
        type: "INITIALIZATION_LOADED",
        payload: { sessions: loadedSessions, activeSessionId: loadedActiveId },
      });

      let sessionToLoad = loadedSessions.find((s) => s.id === loadedActiveId);

      if (sessionToLoad) {
        dispatch({
          type: "SET_ACTIVE_SESSION_AND_MESSAGES",
          payload: {
            sessionId: sessionToLoad.id,
            messages: sessionToLoad.messages,
          },
        });
      } else if (loadedSessions.length > 0) {
        // Fallback: load most recent or first (for simplicity, first for now)
        sessionToLoad = loadedSessions.sort(
          (a, b) =>
            new Date(b.lastUpdatedAt).getTime() -
            new Date(a.lastUpdatedAt).getTime()
        )[0];
        if (sessionToLoad) {
          dispatch({
            type: "SET_ACTIVE_SESSION_AND_MESSAGES",
            payload: {
              sessionId: sessionToLoad.id,
              messages: sessionToLoad.messages,
            },
          });
        } else {
          // Should not happen if loadedSessions.length > 0
          await handleCreateNewSessionInternal(loadedSessions);
        }
      } else {
        await handleCreateNewSessionInternal([]);
      }
      dispatch({ type: "MARK_INITIALIZED" });
    };

    initializeChat();
  }, [chatService, isInitialized, handleCreateNewSessionInternal]);

  React.useEffect(() => {
    // --- Effect for Saving Active Session's Messages ---
    if (!isInitialized || !activeSessionId || !currentMessages.length) return;

    const activeSession = allSessions.find((s) => s.id === activeSessionId);

    if (activeSession) {
      const updatedSessionData: ChatSessionModel = {
        ...activeSession,
        messages: currentMessages, // currentMessages is from state, already up-to-date
        lastUpdatedAt: new Date().toISOString(),
      };

      // Debounce this save in a real app if messages are added very frequently
      chatService
        .saveSession(updatedSessionData)
        .then(() => {
          // Update allSessions in our local state to reflect the save
          // This is important if saveSession doesn't return the full list or if other parts rely on allSessions state

          if (
            JSON.stringify(activeSession) !== JSON.stringify(updatedSessionData)
          ) {
            dispatch({
              type: "UPDATE_SESSION_IN_ALL_SESSIONS",
              payload: updatedSessionData,
            });
          }
        })
        .catch((error) => {
          console.error("Failed to save session:", error);
          // Optionally dispatch an error action to update UI
        });
    }
  }, [currentMessages, activeSessionId, chatService, isInitialized]);

  // --------------------------------------------------------------
  // ! REFACTORED TILL THIS POINT
  // --------------------------------------------------------------

  // --- Public handler for the "New Chat" button ---
  const handleNewChatButtonClick = () => {
    if (isAssistantProcessing) return; // Don't allow new chat while processing
    handleCreateNewSessionInternal(allSessions); // Pass current allSessions state
  };

  // --- handleSendMessage (Uses dispatch) ---
  const handleSendMessage = async (text: string) => {
    if (!activeSessionId && !isInitialized) {
      // Still initializing
      console.warn("Chat not fully initialized, please wait.");
      return;
    }
    const currentActiveSessionId = activeSessionId; // Capture current activeSessionId

    if (!currentActiveSessionId) {
      console.warn("No active session, creating one before sending message.");
      // This part is tricky with async session creation and immediate message sending.
      // For simplicity, let's assume `handleCreateNewSessionInternal` will set one
      // but in a real app, you might need to queue the message or await session creation fully.
      // For now, this might lead to the message being associated with the *next* activeSessionId
      // if the dispatch for CREATE_NEW_SESSION_SUCCESS hasn't updated `activeSessionId` from `state` yet.
      // A better way is to get the new session ID from the return of handleCreateNewSessionInternal.
      // However, handleCreateNewSessionInternal dispatches, it doesn't return the ID to this scope directly.

      // Let's ensure a session is active, then proceed.
      // The button click will use handleCreateNewSessionInternal(allSessions);
      // For now, if a message is sent when no active session, it's an edge case.
      // A simple fix is to ensure the "send" button is disabled if !activeSessionId
      if (!currentActiveSessionId) {
        alert("Please start a new chat first or wait for initialization."); // Placeholder
        return;
      }
    }

    const userMessage: MessageModel = {
      id: uuidv4(),
      sender: "user",
      content: text,
      timestamp: new Date().toISOString(),
      type: "text",
    };
    dispatch({ type: "ADD_MESSAGE", payload: userMessage });
    dispatch({ type: "SET_ASSISTANT_PROCESSING", payload: true });

    const processedResult = findPluginForMessage(text);
    const loadingMessageId = uuidv4(); // Generate ID for potential loading message

    if (processedResult.type === "plugin_match") {
      const { plugin, args } = processedResult;
      dispatch({
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
          finalMessage = {
            id: loadingMessageId,
            sender: "assistant",
            content: executionResult.error || "Error",
            timestamp: new Date().toISOString(),
            type: "error",
            pluginName: plugin.name,
            errorMessage: executionResult.error,
          };
        }
        dispatch({ type: "REPLACE_MESSAGE", payload: finalMessage });
      } catch (e) {
        dispatch({
          type: "REPLACE_MESSAGE",
          payload: {
            id: loadingMessageId,
            sender: "assistant",
            content: "Critical Error",
            timestamp: new Date().toISOString(),
            type: "error",
            pluginName: plugin.name,
            errorMessage: (e as Error).message,
          },
        });
      }
    } else {
      // No plugin matched
      dispatch({
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
    dispatch({ type: "SET_ASSISTANT_PROCESSING", payload: false });
  };

  if (!isInitialized) {
    return (
      <div className="flex flex-col h-screen max-w-3xl mx-auto items-center justify-center bg-background-900">
        <p className="text-textColor text-xl">Initializing Chat...</p>
        {/* Add a spinner here */}
      </div>
    );
  }

  console.log("Rendering ChatWindow with state:", isInitialized);

  return (
    <div className="flex flex-col h-screen w-full mx-auto bg-background-900 shadow-2xl overflow-hidden">
      <header className="p-4 bg-background-800 border-b border-background-700 rounded-b-lg mx-1 flex items-center justify-between">
        <h1 className="sm:text-lg md:text-xl font-semibold text-primary">
          AI Chat -{" "}
          {activeSessionId
            ? allSessions.find((s) => s.id === activeSessionId)?.name ||
              `Session ${activeSessionId.substring(0, 4)}...`
            : "New Chat"}
        </h1>
        <button
          onClick={handleNewChatButtonClick}
          disabled={isAssistantProcessing}
          className="px-4 py-2 border border-primary hover:border-primary-600 text-white font-semibold rounded-lg transition-colors duration-150 disabled:opacity-10 hover:cursor-pointer text-sm sm:text-base"
        >
          New Chat
        </button>
      </header>
      <main className="h-full w-4/5 mx-auto relative bg-background-800 my-10 rounded-lg">
        <MessageList
          messages={currentMessages}
          isTyping={isAssistantProcessing}
        />
        <InputBox
          onSendMessage={handleSendMessage}
          isSending={isAssistantProcessing || !activeSessionId} // Also disable if no active session
        />
      </main>
    </div>
  );
}
