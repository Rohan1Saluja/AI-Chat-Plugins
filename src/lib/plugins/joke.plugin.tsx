import JokeCard from "@/components/JokeCard";
import { JokeModel, Plugin, PluginExecuteResult } from "@/types/plugin-manager";

export const jokePlugin: Plugin = {
  name: "joke",
  description: "Tells a random joke. Usage: /joke",
  trigger: /^\/joke$/i,
  isLoadingMessage: "Finding a good joke...",
  execute: async (args: string[]): Promise<PluginExecuteResult> => {
    try {
      const response = await fetch(
        `https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&type=twopart`
      );
      const data: JokeModel = await response.json();

      if (data.error)
        return {
          success: false,
          error: data.message || "Could not fetch a joke at this time.",
        };

      let displayText = "";

      if (data.type === "single" && data.joke) displayText = data.joke;
      else if (data.type === "twopart" && data.setup && data.delivery)
        displayText = `${data.setup}\n... ${data.delivery}`;
      else
        return { success: false, error: "Received an unexpected joke format." };

      return { success: true, data: data, displayText: displayText };
    } catch (error) {
      console.error("Joke plugin fetch error: ", error);
      return {
        success: false,
        error: "Failed to fetch a joke. The joke gods are asleep.",
      };
    }
  },
  renderResult: (data: JokeModel) => <JokeCard data={data} />,
};
