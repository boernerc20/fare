import { NextRequest, NextResponse } from "next/server";
import { searchAirports } from "@/lib/amadeus";

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("q") ?? "";
  if (keyword.length < 2) {
    return NextResponse.json([]);
  }
  try {
    const results = await searchAirports(keyword);
    return NextResponse.json(results);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Airport search failed";
    console.error("[/api/airports]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
