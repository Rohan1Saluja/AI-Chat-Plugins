import DefinitionCard from "@/components/DefinitionCard";
import {
  DictionaryModel,
  Plugin,
  PluginExecuteResult,
} from "@/types/plugin-manager";

export const definePlugin: Plugin = {
  name: "define",
  description:
    "Fetches dictionary definitions for a word. Usage: /define [word]",
  trigger: /^\/define\s+(.+)/i,
  isLoadingMessage: "Looking up definition...",
  execute: async (args: string[]): Promise<PluginExecuteResult> => {
    const word = args[0];

    if (!word) return { success: false, error: "Please provide a valid word." };
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(
      word
    )}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      // ------------------------------------------------
      // def[]
      if (!response.ok || data.title === "No Definitions Found") {
        const errorMessage =
          data.title ||
          data.message ||
          `Could not find a definition for "${word}".`;
        return { success: false, error: errorMessage };
      }

      const dictionaryEntries = data as DictionaryModel[];

      return {
        success: true,
        data: dictionaryEntries,
        displayText: `Definition for ${word}: ${
          dictionaryEntries[0]?.meanings[0]?.definitions[0]?.definition ||
          "Found. See card."
        }`,
      };
    } catch (error: any) {
      console.error("Define plugin fetch error:", error);
      return {
        success: false,
        error: "Failed to fetch definition. Check your connection or the word.",
      };
    }
  },
  renderResult: (data: DictionaryModel[]) => <DefinitionCard data={data} />,
};
