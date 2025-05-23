import { MessageModal } from "@/types/chat-interface";

interface MessageItemProps {
  message: MessageModal;
}

export default function Message({ message }: MessageItemProps) {
  const isUser = message.sender === "user";

  let displayContent: React.ReactNode = message.content;
  let containerClasses = "max-w-[70%] p-3 rounded-xl break-words";

  if (isUser) {
    containerClasses += " bg-primary-500 text-white";
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
        containerClasses += " bg-background-700 text-text-100";
        displayContent = <p>{message.content}</p>;
        break;

      case "text":
      default:
        containerClasses += " bg-background-700 text-text-100";
        displayContent = <p>{message.content}</p>;
        break;
    }
  }

  console.log("Container Classes - ", containerClasses);

  return (
    <div className={`flex mb-3 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={containerClasses}>
        {!isUser && message.type !== "loading" && message.type !== "plugin" && (
          <p className="text-xs font-semibold mb-1 opacity-80 capitalize">
            {message.pluginName
              ? `${message.pluginName} plugin`
              : message.sender}
          </p>
        )}
        {displayContent}
        <p className="text-xs opacity-70 mt-1 text-right">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
