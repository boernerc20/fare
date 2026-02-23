"use client";

import { useState, useMemo } from "react";
import FlightCard from "@/components/FlightCard";
import type { FlightSearchResponse } from "@/types/flights";

interface Props {
  results: FlightSearchResponse;
}

type SortKey = "price" | "duration" | "departure";

function itinMins(itin: FlightSearchResponse["data"][0]["itineraries"][0]): number {
  const m = itin.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  return parseInt(m?.[1] ?? "0") * 60 + parseInt(m?.[2] ?? "0");
}

export default function FlightResults({ results }: Props) {
  const [sort, setSort] = useState<SortKey>("price");

  const carriers = results.dictionaries?.carriers ?? {};

  const sorted = useMemo(() => {
    return [...results.data].sort((a, b) => {
      if (sort === "price") {
        return parseFloat(a.price.grandTotal) - parseFloat(b.price.grandTotal);
      }
      if (sort === "departure") {
        return a.itineraries[0].segments[0].departure.at.localeCompare(
          b.itineraries[0].segments[0].departure.at
        );
      }
      // duration: sum all itinerary legs (covers round-trips)
      const totalA = a.itineraries.reduce((acc, i) => acc + itinMins(i), 0);
      const totalB = b.itineraries.reduce((acc, i) => acc + itinMins(i), 0);
      return totalA - totalB;
    });
  }, [results.data, sort]);

  const count = results.meta?.count ?? results.data.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{count}</span> flight{count !== 1 ? "s" : ""} found
        </p>

        <div className="flex gap-1 p-1 bg-muted rounded-full">
          {(["price", "duration", "departure"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                sort === key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((offer, idx) => (
          <FlightCard key={offer.id} offer={offer} carriers={carriers} rank={idx} />
        ))}
      </div>
    </div>
  );
}
