import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get("featured");
  const limit = searchParams.get("limit") || "6";

  return NextResponse.json({
    success: true,
    data: []
  });
}
