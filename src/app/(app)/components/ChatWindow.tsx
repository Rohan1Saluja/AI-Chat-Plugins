"use client";

import { MessageModal } from "@/types/chat-interface";
import React from "react";
import { v4 as uuidv4 } from "uuid";
import MessageList from "./MessageList";
import InputBox from "./InputBox";
import Sidebar from "./Sidebar";
import {
  findPluginForMessage,
  ProcessedMessageResult,
} from "@/lib/pluginManager";

export default function ChatWindow() {
  const [messages, setMessages] = React.useState<MessageModal[]>([]);
  const [isAssistantTyping, setIsAssistantTyping] = React.useState(false);

  const addMessage = (message: MessageModal) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  // Load chat history from localStorage (we'll do this in a later phase)
  // useEffect(() => {
  //   const savedMessages = localStorage.getItem('chatHistory');
  //   if (savedMessages) {
  //     setMessages(JSON.parse(savedMessages));
  //   }
  // }, []);

  // Save chat history to localStorage (we'll do this in a later phase)
  // useEffect(() => {
  //   if (messages.length > 0) {
  //     localStorage.setItem('chatHistory', JSON.stringify(messages));
  //   }
  // }, [messages]);

  const handleSendMessage = async (text: string) => {
    const userMessage: MessageModal = {
      id: uuidv4(),
      sender: "user",
      content: text,
      timestamp: new Date().toISOString(),
      type: "text",
    };
    addMessage(userMessage);

    setIsAssistantTyping(true);

    const processedResult: ProcessedMessageResult = findPluginForMessage(text);

    if (processedResult.type === "plugin_match") {
      const { plugin, args } = processedResult;

      const loadingMessageId = uuidv4();
      const loadingMessage: MessageModal = {
        id: loadingMessageId,
        sender: "assistant",
        content: plugin.isLoadingMessage || "Processing...",
        timestamp: new Date().toISOString(),
        type: "loading",
        pluginName: plugin.name,
      };
      addMessage(loadingMessage);

      try {
        const executionResult = await plugin.execute(args);

        let finalMessage: MessageModal;
        if (executionResult.success) {
          finalMessage = {
            id: loadingMessageId,
            sender: "assistant",
            content:
              executionResult.displayText || "Plugin executed successfully",
            timestamp: new Date().toISOString(),
            type:
              executionResult.data && plugin.renderResult ? "plugin" : "text",

            pluginName: plugin.name,
            pluginData: executionResult.data,
            errorMessage: undefined,
          };
        } else {
          finalMessage = {
            id: loadingMessageId,
            sender: "assistant",
            content: executionResult.error || "Plugin execution failed",
            timestamp: new Date().toISOString(),
            type: "error",
            pluginName: plugin.name,
            errorMessage: executionResult.error || "Unknown error occurred",
          };
        }

        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === loadingMessageId ? finalMessage : msg
          )
        );
      } catch (error) {
        console.error(`Execution Error - ${plugin.name}: `, error);

        const errorMessage: MessageModal = {
          id: loadingMessageId,
          sender: "assistant",
          content: `A critical error occurred while running the ${plugin.name} plugin.`,
          timestamp: new Date().toISOString(),
          type: "error",
          pluginName: plugin.name,
          errorMessage:
            error instanceof Error
              ? error.message
              : "Unknown critical error during execution",
        };

        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === loadingMessageId ? errorMessage : msg
          )
        );
      }
    }
    // ------------------------------------
    // PLugin mismatch
    else {
      const assistantMessage: MessageModal = {
        id: uuidv4(),
        sender: "assistant",
        content: `I didn't understand that. Try commands like /weather [city], /calc [expression], or /define [word].`,
        timestamp: new Date().toISOString(),
        type: "text",
      };

      addMessage(assistantMessage);
    }

    setIsAssistantTyping(false);
  };

  return (
    <div className="flex flex-col h-screen w-full mx-auto bg-background-900 shadow-2xl overflow-hidden">
      <header className="p-4 bg-background-800 border-b border-background-700 rounded-b-lg mx-1">
        <h1 className="text-xl font-semibold text-primary">
          AI Chat Interface
        </h1>
      </header>
      <main className="h-full w-4/5 mx-auto relative bg-background-800 my-10 rounded-lg">
        <MessageList messages={messages} isTyping={isAssistantTyping} />

        <InputBox
          onSendMessage={handleSendMessage}
          isSending={isAssistantTyping}
        />
      </main>
    </div>
  );
}
