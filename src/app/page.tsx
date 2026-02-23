"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import SearchForm from "@/components/SearchForm";
import FlightResults from "@/components/FlightResults";
import type { SearchParams, FlightSearchResponse, AirportCoords } from "@/types/flights";

const RouteMap = dynamic(() => import("@/components/RouteMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted animate-pulse rounded-2xl" />,
});

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "results"; data: FlightSearchResponse }
  | { status: "error"; message: string };

export default function Home() {
  const [searchState, setSearchState] = useState<SearchState>({ status: "idle" });
  const [originCoords, setOriginCoords] = useState<AirportCoords | null>(null);
  const [destCoords, setDestCoords] = useState<AirportCoords | null>(null);
  const [mapExpanded, setMapExpanded] = useState(false);

  const showMap = !!(originCoords && destCoords);

  function handleCoordsChange(origin: AirportCoords | null, dest: AirportCoords | null) {
    setOriginCoords(origin);
    setDestCoords(dest);
    if (!origin || !dest) setMapExpanded(false);
  }

  async function handleSearch(params: SearchParams) {
    setSearchState({ status: "loading" });

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
      setSearchState({ status: "results", data });
    } catch (err: unknown) {
      setSearchState({
        status: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  }

  const isIdle = searchState.status === "idle";
  // Map height scales with viewport: taller on larger screens, even taller when expanded
  const mapHeight = mapExpanded
    ? "h-72 md:h-96 xl:h-[520px]"
    : "h-52 md:h-64 xl:h-80";

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Search + map section */}
      <section className={`pt-16 md:pt-20 transition-all duration-500 border-b border-border/50 ${isIdle ? "pb-16 md:pb-24" : "pb-8 md:pb-10"}`}>

        {/* Search form — z-10 sits above the map stacking context */}
        <div className="relative z-10 w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">

          {isIdle && (
            <div className="mb-10 md:mb-12 pt-8 md:pt-12">
              <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary mb-3">
                Flight search
              </p>
              <h1 className="text-4xl sm:text-5xl xl:text-6xl 2xl:text-7xl font-light tracking-tight text-foreground leading-tight">
                Find the best<br />
                <span className="text-primary">flight deals.</span>
              </h1>
              <p className="mt-4 text-muted-foreground text-base md:text-lg font-light max-w-md">
                Compare prices across hundreds of airlines, instantly.
              </p>
            </div>
          )}

          {!isIdle && (
            <div className="pt-4 mb-6 md:mb-8">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Flight search
              </span>
            </div>
          )}

          <SearchForm
            onSearch={handleSearch}
            onCoordsChange={handleCoordsChange}
            loading={searchState.status === "loading"}
          />
        </div>

        {/* Route map — z-0 traps Leaflet's internal z-1000 below the search form */}
        <div
          className={`relative z-0 w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 overflow-hidden transition-all duration-500 ease-in-out ${
            showMap ? `mt-6 md:mt-8 ${mapHeight} opacity-100` : "h-0 opacity-0"
          }`}
        >
          <div className="w-full h-full rounded-2xl overflow-hidden border border-border/60 shadow-sm">
            {showMap && (
              <RouteMap origin={originCoords!} destination={destCoords!} />
            )}
          </div>

          {showMap && (
            <button
              onClick={() => setMapExpanded((v) => !v)}
              title={mapExpanded ? "Collapse map" : "Expand map"}
              className="absolute bottom-4 left-8 sm:left-10 lg:left-14 z-[1000] flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card/90 backdrop-blur-sm border border-border/60 shadow text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {mapExpanded ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />
                  </svg>
                  Collapse
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" />
                  </svg>
                  Expand
                </>
              )}
            </button>
          )}
        </div>
      </section>

      {/* Results area */}
      <div className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-10">
        {searchState.status === "loading" && (
          <div className="flex flex-col items-center justify-center py-20 md:py-28 gap-4">
            <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Searching for the best prices…</p>
          </div>
        )}

        {searchState.status === "error" && (
          <div className="text-center py-20 md:py-28">
            <p className="text-foreground font-medium mb-1">Search failed</p>
            <p className="text-sm text-muted-foreground">{searchState.message}</p>
          </div>
        )}

        {searchState.status === "results" && searchState.data.data?.length > 0 && (
          <FlightResults results={searchState.data} />
        )}

        {searchState.status === "results" && searchState.data.data?.length === 0 && (
          <div className="text-center py-20 md:py-28">
            <p className="text-foreground font-medium mb-1">No flights found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your dates or enabling connections.</p>
          </div>
        )}
      </div>
    </main>
  );
}
