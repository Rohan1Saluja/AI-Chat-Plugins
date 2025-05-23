import { NewsFeedCard } from "@/components/NewsCards";
import {
  NewsApiResponseModel,
  NewsArticleModel,
  Plugin,
  PluginExecuteResult,
} from "@/types/plugin-manager";

export const newsPlugin: Plugin = {
  name: "news",
  description:
    "Fetches top news headlines. Usage: /news [optional_keyword_or_category] (e.g., /news or /news technology)",
  trigger: /^\/news(?:\s+(.+))?$/i,
  isLoadingMessage: "Fetching latest news...",
  execute: async (args: string[]): Promise<PluginExecuteResult> => {
    const query = args[0]?.trim();

    const apiKey = process.env.NEXT_PUBLIC_NEWSAPI_KEY;

    if (!apiKey)
      return {
        success: false,
        error: "News service is currently unavailable (API key missing).",
      };

    // NewsAPI endpoint: 'top-headlines' or 'everything'
    // For simplicity, let's use 'top-headlines'. It requires 'country' or 'category' or 'sources' or 'q'.
    // If no query, let's fetch general top headlines from a country (e.g., 'us').
    // If query, use it with 'q' parameter.
    let apiUrl = `https://newsapi.org/v2/top-headlines?language=en&pageSize=7&apiKey=${apiKey}`;
    if (query) apiUrl += `&q=${encodeURIComponent(query)}`;
    else apiUrl += `&country=us`;
    try {
      const response = await fetch(apiUrl);
      const data: NewsApiResponseModel = await response.json();

      if (data.status !== "ok")
        return {
          success: false,
          error: data.message || "Could not fetch news at this time.",
        };

      if (data.articles.length === 0)
        return {
          success: true,
          data: { articles: [], query: query },
          displayText: query
            ? `No news found for "${query}".`
            : "No top headlines found right now.",
        };

      return {
        success: true,
        data: { articles: data.articles, query: query },
        displayText: `Found ${data.articles.length} articles ${
          query ? `related to "${query}"` : " (Top Headlines)"
        }. See card for details.`,
      };
    } catch (error) {
      console.error("News plugin fetch error: ", error);
      return {
        success: false,
        error: "Failed to fetch news data. Please try again.",
      };
    }
  },
  renderResult: (data: { articles: NewsArticleModel[]; query?: string }) => (
    <NewsFeedCard articles={data.articles} query={data.query} />
  ),
};
