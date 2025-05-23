import { Plugin, PluginExecuteResult } from "@/types/plugin-manager";

export const calcPlugin: Plugin = {
  name: "calc",
  description: "Evaluates a mathematical expression. Usage: /calc [expression]",
  trigger: /^\/calc\s+(.+)/i,
  isLoadingMessage: "Calculating...",
  execute: async (args: string[]): Promise<PluginExecuteResult> => {
    const expression = args[0];
    console.log(`Calc plugin triggered for expression: ${expression}`);

    await new Promise((resolve) => setTimeout(resolve, 500));
    // ----------------------------------------
    return {
      success: true,
      displayText: `Stub: Result for "${expression}" would be shown here.`,
    };
  },
};
