"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import SearchForm from "@/components/SearchForm";
import FlightResults from "@/components/FlightResults";
import type { SearchParams, FlightSearchResponse, AirportCoords } from "@/types/flights";

// SSR disabled — Leaflet requires browser DOM
const RouteMap = dynamic(() => import("@/components/RouteMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted animate-pulse rounded-2xl" />,
});

type SearchState = "idle" | "loading" | "results" | "error";

export default function Home() {
  const [state, setState] = useState<SearchState>("idle");
  const [results, setResults] = useState<FlightSearchResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [originCoords, setOriginCoords] = useState<AirportCoords | null>(null);
  const [destCoords, setDestCoords] = useState<AirportCoords | null>(null);

  const showMap = !!(originCoords && destCoords);

  function handleCoordsChange(
    origin: AirportCoords | null,
    dest: AirportCoords | null
  ) {
    setOriginCoords(origin);
    setDestCoords(dest);
  }

  async function handleSearch(params: SearchParams) {
    setState("loading");
    setResults(null);
    setErrorMsg("");

    const qs = new URLSearchParams({
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      adults: String(params.adults),
      travelClass: params.travelClass,
      nonStop: String(params.nonStop),
      currency: params.currencyCode,
      ...(params.returnDate ? { returnDate: params.returnDate } : {}),
    });

    try {
      const res = await fetch(`/api/flights?${qs}`);
      const data: FlightSearchResponse = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Search failed");
      setResults(data);
      setState("results");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Search + map section */}
      <section className={`pt-20 transition-all duration-500 border-b border-border/50 ${state === "idle" ? "pb-20" : "pb-10"}`}>
        <div className="max-w-5xl mx-auto px-6">

          {/* Hero text — only in idle state */}
          {state === "idle" && (
            <div className="mb-12 pt-12">
              <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-3">
                Flight search
              </p>
              <h1 className="text-5xl font-light tracking-tight text-foreground leading-tight">
                Find the best<br />
                <span className="text-primary">flight deals.</span>
              </h1>
              <p className="mt-4 text-muted-foreground text-lg font-light">
                Compare prices across hundreds of airlines, instantly.
              </p>
            </div>
          )}

          {state !== "idle" && (
            <div className="pt-4 mb-8">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Flight search
              </span>
            </div>
          )}

          <SearchForm
            onSearch={handleSearch}
            onCoordsChange={handleCoordsChange}
            loading={state === "loading"}
          />
        </div>

        {/* Route map — slides in when both airports selected */}
        <div
          className={`max-w-5xl mx-auto px-6 overflow-hidden transition-all duration-500 ease-in-out ${
            showMap ? "mt-8 h-64 opacity-100" : "h-0 opacity-0"
          }`}
        >
          <div className="w-full h-full rounded-2xl overflow-hidden border border-border/60 shadow-sm">
            {showMap && (
              <RouteMap origin={originCoords!} destination={destCoords!} />
            )}
          </div>
        </div>
      </section>

      {/* Results area */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {state === "loading" && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Searching for the best prices…</p>
          </div>
        )}

        {state === "error" && (
          <div className="text-center py-24">
            <p className="text-foreground font-medium mb-1">Search failed</p>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
          </div>
        )}

        {state === "results" && results && results.data?.length > 0 && (
          <FlightResults results={results} />
        )}

        {state === "results" && results && results.data?.length === 0 && (
          <div className="text-center py-24">
            <p className="text-foreground font-medium mb-1">No flights found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your dates or enabling connections.</p>
          </div>
        )}
      </div>
    </main>
  );
}
