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

// -----------------------------------------------------------

export interface WeatherModel {
  city: string;
  temp: number;
  description: string;
  icon: string;
  country: string;
  humidity: string;
  windSpeed: number;
}

export interface PhoneticModel {
  text?: string;
  audio?: string;
  sourceUrl?: string;
  license?: {
    name: string;
    url: string;
  };
}

export interface DefinitionModel {
  definition: string;
  synonyms: string[];
  antonyms: string[];
  example?: string;
}

export interface MeaningModel {
  partOfSpeech: string;
  definitions: DefinitionModel[];
  synonyms: string[];
  antonyms: string[];
}

export interface DictionaryModel {
  word: string;
  phonetic?: string;
  phonetics: PhoneticModel[];
  meanings: MeaningModel[];
  license: { name: string; url: string };
  sourceUrls: string[];
}
