import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server-client";
import { requireAuth } from "@/lib/supabase/session";

/**
 * Alternative upload endpoint (currently unused - we use server actions instead)
 * This demonstrates how video upload could be implemented as a REST API endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await requireAuth();

    // Parse request body
    const body = await request.json();
    const { storagePath, posterUrl, caption, durationSeconds } = body;

    // Validate required fields
    if (!storagePath || !caption || !durationSeconds) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user owns the storage path
    if (!storagePath.startsWith(`${user.id}/`)) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid storage path" },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // Create video record
    const { data, error } = await supabase
      .from("videos")
      .insert({
        user_id: user.id,
        storage_path: storagePath,
        poster_url: posterUrl || null,
        caption: caption.trim(),
        duration_seconds: Math.round(durationSeconds),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating video record:", error);
      return NextResponse.json(
        { error: "Failed to create video record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      video: data,
    });
  } catch (error) {
    console.error("Upload error:", error);

    if (
      error instanceof Error &&
      error.message === "Unauthorized: User must be logged in"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
