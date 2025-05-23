export interface PluginExecuteResult {
  success: boolean;
  data?: any;
  error?: string;
  displayText?: string;
}

// Plugin should return a Promise of Execution Result
export type PluginExecutor = (args: string[]) => Promise<PluginExecuteResult>;

export type PluginRenderer = (data: any) => any;

export interface Plugin {
  name: string;
  description: string;
  trigger: RegExp;
  execute: PluginExecutor;
  renderResult?: PluginRenderer;
  isLoadingMessage?: string;
}
