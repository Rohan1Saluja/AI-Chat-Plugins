import { JSX } from "react";

export interface PluginExecuteResult {
  success: boolean;
  data?: any;
  error?: string;
  displayText?: string;
}

// Plugin should return a Promise of Execution Result
export type PluginExecutor = (args: string[]) => Promise<PluginExecuteResult>;

export type PluginRenderer = (data: any) => JSX.Element;

export interface Plugin {
  name: string;
  description: string;
  trigger: RegExp;
  execute: PluginExecutor;
  renderResult?: PluginRenderer;
  isLoadingMessage?: string;
}

export interface WeatherModel {
  city: string;
  temp: number;
  description: string;
  icon: string;
  country: string;
  humidity: string;
  windSpeed: number;
}
