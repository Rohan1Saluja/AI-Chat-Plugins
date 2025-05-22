"use client";

import { useState, KeyboardEvent, FormEvent } from "react";

interface Props {
  onSendMessage: (messageText: string) => void;
  isSending?: boolean;
}

export default function InputBox({ onSendMessage, isSending = false }: Props) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky w-3/4 xl:w-3/5 left-[20%] xl:left-[26%] bottom-0 flex items-center p-4 border-t border-background-700"
    >
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(event) => {
          const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
          const isCmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

          if (event.key === "Enter" && isCmdOrCtrl) {
            event.preventDefault();
            const cursorPosition = event.currentTarget.selectionStart || 0;
            setInputValue(
              inputValue.slice(0, cursorPosition) +
                "\n" +
                inputValue.slice(cursorPosition)
            );
          } else {
            handleKeyPress(event);
          }
        }}
        placeholder="Type your message or command..."
        disabled={isSending}
        className="flex-grow px-6 py-4 rounded-lg bg-background-800 text-text-200 focus:ring-0 shadow-xl focus:shadow-center-large focus:outline-none placeholder-textColor-500 resize-none"
        rows={3}
      />
      <button
        type="submit"
        disabled={isSending || !inputValue.trim()}
        className="ml-3 px-6 py-3 bg-primary hover:bg-primary-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
      >
        Send
      </button>
    </form>
  );
}
