import { NextRequest, NextResponse } from "next/server";
import { searchFlights } from "@/lib/amadeus";
import type { SearchParams } from "@/types/flights";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const params: SearchParams = {
    origin: (searchParams.get("origin") ?? "").toUpperCase(),
    destination: (searchParams.get("destination") ?? "").toUpperCase(),
    departureDate: searchParams.get("departureDate") ?? "",
    returnDate: searchParams.get("returnDate") ?? undefined,
    adults: parseInt(searchParams.get("adults") ?? "1", 10),
    travelClass:
      (searchParams.get("travelClass") as SearchParams["travelClass"]) ??
      "ECONOMY",
    nonStop: searchParams.get("nonStop") === "true",
    currencyCode: searchParams.get("currency") ?? "USD",
  };

  if (!params.origin || !params.destination || !params.departureDate) {
    return NextResponse.json(
      { error: "origin, destination and departureDate are required" },
      { status: 400 }
    );
  }

  try {
    const results = await searchFlights(params);
    return NextResponse.json(results);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch flights";
    console.error("[/api/flights]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
