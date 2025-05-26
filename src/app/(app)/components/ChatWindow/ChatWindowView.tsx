"use client";

import React from "react";
import { MessageModel } from "@/types/chat-interface";
import MessageList from "../MessageList";
import InputBox from "../InputBox";
import { useRouter } from "next/navigation";

interface ChatWindowViewProps {
  currentMessages: MessageModel[];
  activeSessionId: string | null; // Needed for disabling input if no active session
  activeSessionName: string;
  isAssistantProcessing: boolean;
  onSendMessage: (text: string) => Promise<void>; // Or (text: string) => void if not async
  onNewChatClick: () => void;
  isAuthenticated?: boolean;
  userEmail?: string | null;
  onLogoutClick?: () => void;
}

export default function ChatWindowView({
  currentMessages,
  activeSessionId,
  activeSessionName,
  isAssistantProcessing,
  onSendMessage,
  onNewChatClick,
  isAuthenticated,
  userEmail,
  onLogoutClick,
}: ChatWindowViewProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen w-full mx-auto bg-background-900 shadow-2xl overflow-hidden">
      <header className="p-4 bg-background-800 border-b border-background-700 rounded-b-lg mx-1 flex items-center justify-between">
        <h1 className="sm:text-lg md:text-xl font-semibold text-primary">
          AI Chat - {activeSessionName}
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={onNewChatClick}
            disabled={isAssistantProcessing}
            className="px-4 py-2 border border-primary hover:border-primary-600 text-white font-medium rounded-lg transition-colors duration-150 disabled:opacity-10 hover:cursor-pointer text-xs sm:text-sm"
          >
            New Chat
          </button>
          {isAuthenticated ? (
            <>
              {userEmail && (
                <span className="text-sm text-text-300 hidden sm:block">
                  {userEmail}
                </span>
              )}
              <button
                onClick={onLogoutClick}
                className="px-3 py-1 sm:px-4 sm:py-2 border border-accent text-accent hover:bg-accent hover:text-white font-semibold rounded-lg text-xs sm:text-sm hover:cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push("/auth")}
              className="px-3 py-1 sm:px-4 sm:py-2 border border-primary text-primary hover:bg-primary hover:text-white font-semibold rounded-lg text-xs sm:text-sm hover:cursor-pointer"
            >
              Login / Sign Up
            </button>
          )}
        </div>
      </header>
      <main className="h-full w-4/5 mx-auto relative bg-background-800 my-10 rounded-lg">
        <MessageList
          messages={currentMessages}
          isTyping={isAssistantProcessing}
        />
        <InputBox
          onSendMessage={onSendMessage}
          isSending={isAssistantProcessing || !activeSessionId}
        />
      </main>
    </div>
  );
}
