import { NextRequest, NextResponse } from "next/server";
import { fetchVideosServer } from "@/lib/api/videos";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const orderBy = (searchParams.get("orderBy") || "created_at") as
      | "created_at"
      | "views_count"
      | "likes_count";
    const order = (searchParams.get("order") || "desc") as "asc" | "desc";

    const videos = await fetchVideosServer({
      limit,
      offset,
      orderBy,
      order,
    });

    return NextResponse.json({
      videos,
      hasMore: videos.length === limit,
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
