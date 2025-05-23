import {
  Plugin,
  PluginExecuteResult,
  WeatherModel,
} from "@/types/plugin-manager";
import WeatherCard from "@/components/WeatherCard";

export const weatherPlugin: Plugin = {
  name: "weather",
  description: "Fetches current weather for a city. Usage: /weather [city]",
  trigger: /^\/weather\s+(.+)/i,
  isLoadingMessage: "Fetching weather...",
  execute: async (args: string[]): Promise<PluginExecuteResult> => {
    const city = args[0];
    if (!city)
      return {
        success: false,
        error: "Please provide a valid city name.",
      };

    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

    if (!apiKey) {
      console.error("OpenWeather API key is not set.");
      return {
        success: false,
        error: "Weather service is currently unavailable (key not set).",
      };
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!response.ok) {
        if (data.cod && data.cod !== 200)
          return {
            success: false,
            error: data.message || `Could not find weather for ${city}`,
          };
        return {
          success: false,
          error: data.message || `Weather API Error: ${response.statusText}`,
        };
      }

      if (data.cod && String(data.cod) === "404")
        return {
          success: false,
          error: data.message || `Could not find weather for ${city}`,
        };

      const weatherData: WeatherModel = {
        city: data.name,
        country: data.sys.country,
        temp: data.main.temp,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
      };

      return {
        success: true,
        data: weatherData,
        displayText: `Weather in ${weatherData.city}: ${weatherData.temp}°C, ${weatherData.description}.`,
      };
    } catch (error) {
      console.error("Weather Plugin Error: ", error);
      return {
        success: false,
        error:
          "Failed to fetch weather data. Check your connection or the city name.",
      };
    }
  },
  renderResult: (data: WeatherModel) => <WeatherCard data={data} />,
};
