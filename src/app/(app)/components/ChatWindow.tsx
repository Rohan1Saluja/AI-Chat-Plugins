"use client";

import { MessageModal } from "@/types/chat-interface";
import React from "react";
import { v4 as uuidv4 } from "uuid";
import MessageList from "./MessageList";
import InputBox from "./InputBox";
import Sidebar from "./Sidebar";

export default function ChatWindow() {
  const [messages, setMessages] = React.useState<MessageModal[]>([]);
  const [isAssistantTyping, setIsAssistantTyping] = React.useState(false); // For later

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
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setIsAssistantTyping(true);
    setTimeout(() => {
      const assistantMessage: MessageModal = {
        id: uuidv4(),
        sender: "assistant",
        content: `You said: "${text}" (This is a mock response)`,
        timestamp: new Date().toISOString(),
        type: "text",
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      setIsAssistantTyping(false);
    }, 1000);
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
