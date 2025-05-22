export interface MessageModal {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  type: "text" | "plugin" | "loading";
  pluginName?: string;
  pluginData?: any;
}
