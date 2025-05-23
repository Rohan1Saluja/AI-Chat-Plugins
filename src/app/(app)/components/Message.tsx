"use client";

import PluginResponse from "@/components/messages/PluginResponse";
import TextResponse from "@/components/messages/TextResponse";
import { registeredPlugins } from "@/lib/pluginManager";
import { MessageModal } from "@/types/chat-interface";
import React, { useState, useEffect } from "react";

interface MessageProps {
  message: MessageModal;
}

export default function Message({ message }: MessageProps) {
  const [formattedTime, setFormattedTime] = useState("");

  useEffect(() => {
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

  const useCustomRenderer = !!(
    plugin &&
    plugin.renderResult &&
    message.pluginData
  );

  let displayContentNode: React.ReactNode;
  let containerClasses = "max-w-[70%] p-4 rounded-xl break-words";
  let showSenderName = !isUser && message.type !== "loading";
  let showTimestamp = !useCustomRenderer;

  if (isUser) {
    containerClasses += " bg-primary-500 text-white";
    displayContentNode = (
      <TextResponse content={message.content} isAssistant={false} />
    );
  } else {
    if (useCustomRenderer) {
      displayContentNode = plugin?.renderResult!(message.pluginData);
      containerClasses += " bg-background-700 text-text-100";
      showTimestamp = false;
    } else {
      switch (message.type) {
        case "loading":
          containerClasses += " bg-background-600 text-text-300 italic";
          displayContentNode = <p>{message.content || "loading..."}</p>;
          showSenderName = false;
          break;
        case "error":
          containerClasses += " bg-red-700 text-red-100";
          displayContentNode = (
            <>
              <p className="font-semibold">Error:</p>
              <p>{message.errorMessage || message.content}</p>
            </>
          );
          break;
        case "plugin":
          containerClasses += " bg-background-700 text-text-100";
          displayContentNode = <PluginResponse content={message.content} />;
          // showTimestamp = false;
          break;
        case "text":
        default:
          containerClasses += " bg-background-700 text-text-100";
          displayContentNode = (
            <TextResponse content={message.content} isAssistant={true} />
          );
          break;
      }
    }
  }

  console.log("Container Classes: ", containerClasses);

  return (
    <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={containerClasses}>
        {showSenderName && (
          <p className="text-xs font-semibold mb-1 opacity-80 capitalize">
            {message.pluginName
              ? `${message.pluginName} Plugin`
              : message.sender}
          </p>
        )}
        {displayContentNode}
        {showTimestamp && (
          <p className="text-xs opacity-70 mt-1 text-right">{formattedTime}</p>
        )}
      </div>
    </div>
  );
}
