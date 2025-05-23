import { Plugin, PluginExecuteResult } from "@/types/plugin-manager";

export const weatherPlugin: Plugin = {
  name: "weather",
  description: "Fetches current weather for a city. Usage: /weather [city]",
  trigger: /^\/weather\s+(.+)/i,
  isLoadingMessage: "Fetching weather...",
  execute: async (args: string[]): Promise<PluginExecuteResult> => {
    const city = args[0];
    console.log(`Weather plugin triggered for city: ${city}`);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    // ----------------------------------------
    return {
      success: true,
      // data: { city, temp: "20°C", description: "Sunny" },
      displayText: `Stub: Weather for ${city} would be shown here.`,
    };
  },
  // renderResult: (data) => <WeatherCard data={data} />
};
