"use client";

import { MessageModal } from "@/types/chat-interface";
import Message from "./Message";
import ScrollToBottom from "react-scroll-to-bottom";

interface MessageListProps {
  messages: MessageModal[];
  isTyping: boolean;
}

export default function MessageList({
  messages,
  isTyping = false,
}: MessageListProps) {
  console.log("Messages - ", messages);
  return (
    <ScrollToBottom
      className="flex-grow p-4 overflow-y-auto h-[77.5%] max-h-[77.5%]"
      scrollViewClassName="h-full"
      initialScrollBehavior="auto"
    >
      {messages.length === 0 && (
        <div className="flex justify-center items-center h-3/4 min-h-[50dvh]">
          <p className="text-textColor-500">No messages yet. Start chatting!</p>
        </div>
      )}
      {messages.map((msg) => (
        <Message key={msg.id} message={msg} />
      ))}
      {isTyping && (
        <div className="p-2 px-4 text-sm text-textColor-400 italic">
          Assistant is typing...
        </div>
      )}
    </ScrollToBottom>
  );
}
