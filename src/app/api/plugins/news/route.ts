import { NextRequest, NextResponse } from "next/server";

// Define a type for the articles we expect from NewsAPI.org (or our transformed version)
interface NewsArticleAPIResponse {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string; // ISO 8601 format
  content: string | null;
}

// Our desired internal structure (can be same or different)
interface FormattedArticle {
  title: string;
  description?: string | null;
  url: string;
  imageUrl?: string | null;
  sourceName?: string;
  publishedAt?: string;
}

async function fetchNewsFromNewsAPI(
  topic?: string,
  category?: string
): Promise<FormattedArticle[]> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) {
    console.error("NewsAPI key is not configured in environment variables.");
    throw new Error("News service is currently unavailable.");
  }

  let apiUrl = "https://newsapi.org/v2/";

  // Determine endpoint based on provided parameters
  if (topic) {
    // Use 'everything' endpoint for keyword search (topic)
    apiUrl += `everything?q=${encodeURIComponent(
      topic
    )}&sortBy=publishedAt&language=en`;
  } else if (category) {
    // Use 'top-headlines' for category-specific news
    // NewsAPI categories: business, entertainment, general, health, science, sports, technology
    apiUrl += `top-headlines?country=us&category=${encodeURIComponent(
      category
    )}&language=en`; // Default to US, you can change country
  } else {
    // Default to general top headlines if no topic or category
    apiUrl += "top-headlines?country=us&language=en"; // Default to US general news
  }

  apiUrl += `&apiKey=${apiKey}`;

  console.log(`Fetching news from NewsAPI: ${apiUrl}`);

  try {
    const response = await fetch(apiUrl, {
      // NewsAPI.org recommends setting a User-Agent for server-side requests
      // headers: {
      //   'User-Agent': 'FreyaNewsPlugin/1.0 (YourAppNameOrURL)'
      // }
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Unknown API error" }));
      console.error("NewsAPI request failed:", response.status, errorData);
      throw new Error(
        errorData.message ||
          `News API request failed with status ${response.status}`
      );
    }

    const data = await response.json();

    if (data.status === "error") {
      console.error("NewsAPI returned an error status:", data.message);
      throw new Error(data.message || "Failed to fetch news from provider.");
    }

    return data.articles ?? [];
  } catch (error: any) {
    console.error("Error fetching news from NewsAPI service:", error.message);
    // Re-throw or return empty to be handled by the calling function
    throw error; // Or return [] if you prefer to show "no news" instead of an error
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const topic = searchParams.get("topic") || undefined;
    const category = searchParams.get("category") || undefined;

    // Prioritize topic search if both are somehow provided, or refine logic
    let articles: FormattedArticle[];
    if (topic) {
      articles = await fetchNewsFromNewsAPI(topic, undefined);
    } else if (category) {
      articles = await fetchNewsFromNewsAPI(undefined, category);
    } else {
      articles = await fetchNewsFromNewsAPI(); // General news
    }

    return NextResponse.json({
      articles,
      status: 201,
      total: articles.length,
    });
  } catch (error: any) {
    console.error("API /plugins/news GET Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to fetch news" },
      { status: 500 }
    );
  }
}
