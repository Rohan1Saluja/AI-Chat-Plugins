"use client";

import React, { useState, useEffect } from "react";

interface Props {
  content: string;
  isAssistant: boolean;
}

export default function TextResponse({ content, isAssistant }: Props) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (isAssistant && content) {
      setDisplayedText("");
      let i = 0;
      const textRef = { current: "" };
      const typingInterval = setInterval(() => {
        if (i < content.length) {
          textRef.current += content.charAt(i);
          setDisplayedText(textRef.current);
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, 30);
      return () => clearInterval(typingInterval);
    } else {
      setDisplayedText(content || "");
    }
  }, [content, isAssistant]);

  return <p>{displayedText}</p>;
}
