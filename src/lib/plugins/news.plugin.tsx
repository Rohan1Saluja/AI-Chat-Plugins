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

    let localApiUrl = `/api/news`;
    if (query) {
      localApiUrl += `?q=${encodeURIComponent(query)}`;
    }
    try {
      const response = await fetch(localApiUrl);
      const data: NewsApiResponseModel = await response.json();

      if (!response.ok || data.status !== "ok")
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
