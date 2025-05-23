"use client";

import { MessageModel } from "@/types/chat-interface";
import Message from "./Message";
import ScrollToBottom from "react-scroll-to-bottom";
import React from "react";

interface MessageListProps {
  messages: MessageModel[];
  isTyping: boolean;
}

export default function MessageList({
  messages,
  isTyping = false,
}: MessageListProps) {
  const [hasMounted, setHasMounted] = React.useState(false);

  const plugins = [
    {
      label: "/calc",
      title: "Perform calculations, e.g., /calc 2+2",
    },
    {
      label: "/weather",
      title: "Get current weather info, e.g., /weather London",
    },
    {
      label: "/define",
      title: "Get word definitions, e.g., /define serendipity",
    },
    {
      label: "/joke",
      title: "Get a random joke, e.g., /joke",
    },
  ];

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  const scrollContainerClasses =
    "flex-grow p-4 overflow-y-auto h-[68.5%] max-h-[68.5%]";

  const defaultMessage = () => (
    <div className="prose flex flex-col justify-center items-center text-center h-3/4 min-h-[50dvh]">
      <h2 className="text-text-500">Freya Welcomes You!</h2>
      <h5>Use these Stubs and get answers to your questions</h5>
      <ul className="list-disc flex flex-wrap items-center justify-center italic cursor-default">
        {plugins.map((plugin) => (
          <li key={plugin.label} title={plugin.title} className="mx-5">
            {plugin.label}
          </li>
        ))}
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
