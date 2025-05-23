import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const newsApiKey = process.env.NEWSAPI_KEY;
  if (!newsApiKey)
    return NextResponse.json(
      { error: "News service configuration error." },
      { status: 500 }
    );

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  let apiUrl = `https://newsapi.org/v2/top-headlines?language=en&pageSize=7&apiKey=${newsApiKey}`;

  if (query) apiUrl += `&q=${encodeURIComponent(query)}`;
  else apiUrl += `&country=us`;

  try {
    const newsApiResponse = await fetch(apiUrl, { cache: "no-store" });

    const data = await newsApiResponse.json();

    if (!newsApiResponse.ok || data.status !== "ok")
      return NextResponse.json(
        { error: data.message || "Failed to fetch news from external source." },
        { status: newsApiResponse.status }
      );

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error while fetching news." },
      { status: 500 }
    );
  }
}
