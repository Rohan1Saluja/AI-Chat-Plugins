import { Plugin, PluginExecuteResult } from "@/types/plugin-manager";
import { evaluate } from "mathjs";

export const calcPlugin: Plugin = {
  name: "calc",
  description: "Evaluates a mathematical expression. Usage: /calc [expression]",
  trigger: /^\/calc\s+(.+)/i,
  isLoadingMessage: "Calculating...",
  execute: async (args: string[]): Promise<PluginExecuteResult> => {
    const expression = args[0];
    if (!expression)
      return {
        success: false,
        error: "Please provide a valid mathematical expression.",
      };

    try {
      const result = evaluate(expression);

      if (result === undefined || result === null)
        return { success: false, error: "Invalid expression." };

      let resultText: string;
      if (typeof result === "function")
        return { success: false, error: "Functions can't be displayed." };
      else if (typeof result.toSting === "function")
        resultText = result.toString();
      else resultText = String(result);

      return {
        success: true,
        displayText: `Result: ${expression} = ${resultText}`,
      };
    } catch (error: any) {
      console.error("Calc Plugin Error: ", error);

      return {
        success: false,
        error: error.message
          ? `Calculation error:  ${error.message}`
          : "Error evaluating expression. Please check the syntax.",
      };
    }
  },
};
