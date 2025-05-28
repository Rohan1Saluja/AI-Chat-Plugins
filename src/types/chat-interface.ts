export interface MessageModel {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  type: "text" | "plugin" | "loading" | "error";
  pluginName?: string;
  pluginData?: any;
  errorMessage?: string;
  user_id?: string;
}

export interface ChatSessionModel {
  id: string;
  user_id?: string; //verify if keeping this optional works (for guest chat)
  name?: string;
  messages: MessageModel[];
  createdAt: string;
  lastUpdatedAt: string;
}

export interface ChatHistoryStoreModel {
  sessions: ChatSessionModel[];
  activeSessionId: string | null;
}
