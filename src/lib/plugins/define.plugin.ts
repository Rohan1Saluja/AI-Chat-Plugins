import { Plugin, PluginExecuteResult } from "@/types/plugin-manager";

export const definePlugin: Plugin = {
  name: "define",
  description:
    "Fetches dictionary definitions for a word. Usage: /define [word]",
  trigger: /^\/define\s+(.+)/i,
  isLoadingMessage: "Looking up definition...",
  execute: async (args: string[]): Promise<PluginExecuteResult> => {
    const word = args[0];
    console.log(`Define plugin triggered for word: ${word}`);

    await new Promise((resolve) => setTimeout(resolve, 700));
    // ----------------------------------------
    return {
      success: true,
      // data: { word, definition: "A sequence of letters..." },
      displayText: `Stub: Definition for ${word} would be shown here.`,
    };
  },
  // renderResult: (data) => <DefinitionCard data={data} />
};
