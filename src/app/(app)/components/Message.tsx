"use client";

import { registeredPlugins } from "@/lib/pluginManager";
import { MessageModal } from "@/types/chat-interface";
import React from "react";

interface MessageItemProps {
  message: MessageModal;
}

export default function Message({ message }: MessageItemProps) {
  const [formattedTime, setFormattedTime] = React.useState("");

  React.useEffect(() => {
    setFormattedTime(
      new Date(message.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, [message.timestamp]);
  const isUser = message.sender === "user";

  const plugin =
    message.type === "plugin" && message.pluginName
      ? registeredPlugins.find((p) => p.name === message.pluginName)
      : undefined;

  const useCustomRenderer = plugin && plugin.renderResult && message.pluginData;

  let displayContent: React.ReactNode = message.content;
  let containerClasses = "max-w-[70%] p-3 rounded-xl break-words";

  let showSenderName = !isUser && message.type !== "loading";

  if (isUser) {
    containerClasses += " bg-primary-500 text-white";
  } else {
    if (useCustomRenderer) {
      // null check
      displayContent = plugin?.renderResult!(message.pluginData);
      containerClasses += " bg-transparent p-0";
      showSenderName = false;
    } else {
      switch (message.type) {
        case "loading":
          containerClasses += " bg-background-600 text-text-300 italic";
          displayContent = <p>{message.content || "loading..."}</p>;
          break;

        case "error":
          containerClasses += " bg-red-700 text-red-100";
          displayContent = (
            <>
              <p className="font-semibold">Error:</p>
              <p>{message.errorMessage || message.content}</p>
            </>
          );
          break;

        case "plugin":
        case "text":
        default:
          containerClasses += " bg-background-700 text-text-100";
          displayContent = <p>{message.content}</p>;
          break;
      }
    }
  }

  return (
    <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={containerClasses}>
        {showSenderName && (
          <p className="text-xs font-semibold mb-1 opacity-80 capitalize">
            {message.pluginName ? `${message.pluginName}` : message.sender}
          </p>
        )}
        {displayContent}
        {!useCustomRenderer && (
          <p className="text-xs opacity-70 mt-1 text-right">{formattedTime}</p>
        )}
      </div>
    </div>
  );
}
