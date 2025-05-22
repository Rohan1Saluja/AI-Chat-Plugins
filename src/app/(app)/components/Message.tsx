import { MessageModal } from "@/types/chat-interface";

interface MessageItemProps {
  message: MessageModal;
}

export default function Message({ message }: MessageItemProps) {
  const isUser = message.sender === "user";

  return (
    <div className={`flex mb-3 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] p-3 rounded-xl break-words
          ${
            isUser
              ? "bg-primary-500 text-white"
              : "bg-background-700 text-textColor-100"
          }
        `}
      >
        <p className="text-sm font-semibold mb-1 capitalize">
          {message.sender}
        </p>
        <p>{message.content}</p>
        <p className="text-xs opacity-70 mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
