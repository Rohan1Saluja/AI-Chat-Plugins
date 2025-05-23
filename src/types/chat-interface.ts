export interface MessageModel {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  type: "text" | "plugin" | "loading" | "error";
  pluginName?: string;
  pluginData?: any;
  errorMessage?: string;
}

export interface ChatSessionModel {
  id: string;
  name?: string;
  messages: MessageModel[];
  createdAt: string;
  lastUpdatedAt: string;
}

export interface ChatHistoryStoreModel {
  sessions: ChatSessionModel[];
  activeSessionId: string | null;
}
