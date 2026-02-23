import { NextRequest, NextResponse } from "next/server";
import { searchAirports } from "@/lib/amadeus";
import type { AirportGroup } from "@/types/flights";

const cache = new Map<string, { data: AirportGroup[]; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function GET(req: NextRequest) {
  const keyword = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  if (keyword.length < 2) {
    return NextResponse.json([]);
  }

  const now = Date.now();
  const cached = cache.get(keyword);
  if (cached && cached.expiresAt > now) {
    return NextResponse.json(cached.data);
  }

  try {
    const results = await searchAirports(keyword);
    cache.set(keyword, { data: results, expiresAt: now + CACHE_TTL_MS });
    return NextResponse.json(results);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Airport search failed";
    console.error("[/api/airports]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
