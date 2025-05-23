"use client";

import { MessageModal } from "@/types/chat-interface";
import Message from "./Message";
import ScrollToBottom from "react-scroll-to-bottom";
import React from "react";

interface MessageListProps {
  messages: MessageModal[];
  isTyping: boolean;
}

export default function MessageList({
  messages,
  isTyping = false,
}: MessageListProps) {
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  const scrollContainerClasses =
    "flex-grow p-4 overflow-y-auto h-[68.5%] max-h-[68.5%]";

  const defaultMessage = () => (
    <div className="prose flex flex-col justify-center items-center h-3/4 min-h-[50dvh]">
      <h2 className="text-text-500">Freya Welcomes You!</h2>
      <h5>Use these Stubs and get answers to your questions</h5>
      <ul className="list-disc flex items-center gap-10 italic">
        <li>/calc</li>
        <li>/weather</li>
        <li>/define</li>
      </ul>
    </div>
  );

  if (!hasMounted) {
    return (
      <div className={scrollContainerClasses}>
        {messages.length === 0 && defaultMessage()}
      </div>
    );
  }

  return (
    <ScrollToBottom
      className={scrollContainerClasses} // Use the defined classes
      scrollViewClassName="h-full"
      initialScrollBehavior="auto"
      // mode="bottom"
      // followButtonClassName="your-custom-follow-button-class"
    >
      {messages.length === 0 && !isTyping && defaultMessage()}
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
