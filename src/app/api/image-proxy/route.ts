import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const externalImageUrl = searchParams.get("url");

  if (!externalImageUrl) {
    return new NextResponse("Image URL parameter is required", { status: 400 });
  }

  try {
    // Validate the URL to prevent potential SSRF vulnerabilities if needed
    // For example, check if it's a valid HTTP/HTTPS URL, check against a list of allowed domains, etc.
    // For now, we'll assume it's a valid image URL.

    const imageResponse = await fetch(externalImageUrl);

    if (!imageResponse.ok) {
      console.error(
        `Image Proxy: Failed to fetch image from ${externalImageUrl}, status: ${imageResponse.status}`
      );
      return new NextResponse(
        `Failed to fetch image: ${imageResponse.statusText}`,
        { status: imageResponse.status }
      );
    }

    const contentType = imageResponse.headers.get("content-type");
    if (!contentType || !contentType.startsWith("image/")) {
      console.error(
        `Image Proxy: Fetched content from ${externalImageUrl} is not an image. Content-Type: ${contentType}`
      );
      return new NextResponse("Fetched content is not an image", {
        status: 400,
      });
    }

    // Get the image data as a ReadableStream (more efficient for streaming)
    const imageStream = imageResponse.body;

    if (!imageStream) {
      return new NextResponse("Image response body is empty", { status: 500 });
    }

    // Stream the image back to the client
    return new NextResponse(imageStream, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, immutable", // Cache for 1 week
      },
    });
  } catch (error: any) {
    console.error(
      "Image Proxy GET Error:",
      error.message,
      "URL:",
      externalImageUrl
    );
    return new NextResponse("Error proxying image", { status: 500 });
  }
}
