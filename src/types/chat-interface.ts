export interface MessageModal {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  type: "text" | "plugin" | "loading" | "error";
  pluginName?: string;
  pluginData?: any;
  errorMessage?: string;
}
