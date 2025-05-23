"use client";

import React, { useState, useEffect } from "react";

interface Props {
  content: string;
}

export default function PluginResponse({ content }: Props) {
  const [displayedChunks, setDisplayedChunks] = useState<string[]>([]);

  useEffect(() => {
    if (content) {
      const chunks = content
        .split(". ")
        .map((chunk) =>
          chunk.trim() ? chunk + (chunk.endsWith(".") ? "" : ".") : ""
        )
        .filter(Boolean);
      if (chunks.length > 0) {
        setDisplayedChunks([]);
        let currentChunkIdx = 0;
        const chunkInterval = setInterval(() => {
          if (currentChunkIdx < chunks.length) {
            setDisplayedChunks((prev) => [...prev, chunks[currentChunkIdx]]);
            currentChunkIdx++;
          } else {
            clearInterval(chunkInterval);
          }
        }, 700);
        return () => clearInterval(chunkInterval);
      } else {
        setDisplayedChunks([content]);
      }
    } else {
      setDisplayedChunks([]);
    }
  }, [content]);

  return (
    <div>
      {displayedChunks.map((chunk, index) => (
        <span
          key={index}
          className="animate-fadeIn opacity-0 mr-1"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {chunk}
        </span>
      ))}
    </div>
  );
}
