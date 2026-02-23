"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AirportInput from "@/components/AirportInput";
import type { SearchParams, AirportCoords, AirportSuggestion } from "@/types/flights";

interface Props {
  onSearch: (params: SearchParams) => void;
  onCoordsChange: (origin: AirportCoords | null, destination: AirportCoords | null) => void;
  loading: boolean;
}

interface AirportState {
  iataCode: string;
  display: string;
  coords: AirportCoords | null;
}

const EMPTY_AIRPORT: AirportState = { iataCode: "", display: "", coords: null };

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

function toAirportState(s: AirportSuggestion): AirportState {
  const display = s.subType === "CITY"
    ? `${s.cityName} — any airport (${s.iataCode})`
    : `${s.cityName} · ${s.name.charAt(0) + s.name.slice(1).toLowerCase()} (${s.iataCode})`;
  return {
    iataCode: s.iataCode,
    display,
    coords: s.lat != null && s.lon != null
      ? { iataCode: s.iataCode, cityName: s.cityName, lat: s.lat, lon: s.lon }
      : null,
  };
}

const inputClass = "h-11 border-0 border-b border-border rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary text-base transition-colors";
const labelClass = "block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-widest";

export default function SearchForm({ onSearch, onCoordsChange, loading }: Props) {
  const [origin, setOrigin] = useState<AirportState>(EMPTY_AIRPORT);
  const [destination, setDestination] = useState<AirportState>(EMPTY_AIRPORT);
  const [departureDate, setDepartureDate] = useState(tomorrow());
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [travelClass, setTravelClass] = useState<SearchParams["travelClass"]>("ECONOMY");
  const [nonStop, setNonStop] = useState(false);
  const [tripType, setTripType] = useState<"one-way" | "return">("one-way");

  function handleOriginSelect(s: AirportSuggestion) {
    const next = toAirportState(s);
    setOrigin(next);
    onCoordsChange(next.coords, destination.coords);
  }

  function handleDestSelect(s: AirportSuggestion) {
    const next = toAirportState(s);
    setDestination(next);
    onCoordsChange(origin.coords, next.coords);
  }

  function handleSwap() {
    setOrigin(destination);
    setDestination(origin);
    onCoordsChange(destination.coords, origin.coords);
  }

  function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    onSearch({
      origin: origin.iataCode,
      destination: destination.iataCode,
      departureDate,
      returnDate: tripType === "return" ? returnDate : undefined,
      adults,
      travelClass,
      nonStop,
      currencyCode: "USD",
    });
  }

  const classes: SearchParams["travelClass"][] = ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"];

  return (
    <form onSubmit={submit} className="space-y-5 md:space-y-6">
      {/* Controls row: trip type + cabin class + non-stop toggle */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        <div className="flex gap-1 p-1 bg-muted rounded-full">
          {(["one-way", "return"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTripType(t)}
              className={`px-3 md:px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                tripType === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "one-way" ? "One way" : "Return"}
            </button>
          ))}
        </div>

        <div className="flex gap-1 p-1 bg-muted rounded-full">
          {classes.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setTravelClass(c)}
              className={`px-2.5 md:px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                travelClass === c ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c === "PREMIUM_ECONOMY" ? "Premium" : c.charAt(0) + c.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none ml-auto sm:ml-0">
          <div
            onClick={() => setNonStop(!nonStop)}
            className={`relative w-9 h-5 rounded-full transition-colors ${nonStop ? "bg-primary" : "bg-muted-foreground/30"}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${nonStop ? "translate-x-4" : ""}`} />
          </div>
          <span className="text-sm text-muted-foreground">Non-stop only</span>
        </label>
      </div>

      {/* Main inputs row — airport pair + dates + pax + submit */}
      <div className="grid grid-cols-[1fr_auto_1fr] sm:flex sm:flex-wrap gap-x-4 lg:gap-x-6 gap-y-4 items-end">

        {/* Origin */}
        <AirportInput
          key={`origin-${origin.iataCode}`}
          displayValue={origin.display}
          label="From"
          placeholder="City or airport"
          onChange={handleOriginSelect}
        />

        {/* Swap button */}
        <div className="flex items-end pb-2 justify-center">
          <button
            type="button"
            title="Swap"
            onClick={handleSwap}
            className="text-muted-foreground/40 hover:text-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4" />
            </svg>
          </button>
        </div>

        {/* Destination */}
        <AirportInput
          key={`dest-${destination.iataCode}`}
          displayValue={destination.display}
          label="To"
          placeholder="City or airport"
          onChange={handleDestSelect}
        />

        {/* Depart date */}
        <div className="flex-1 min-w-[120px]">
          <label className={labelClass}>Depart</label>
          <Input
            type="date"
            value={departureDate}
            min={tomorrow()}
            onChange={(e) => setDepartureDate(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Return date */}
        {tripType === "return" && (
          <div className="flex-1 min-w-[120px]">
            <label className={labelClass}>Return</label>
            <Input
              type="date"
              value={returnDate}
              min={departureDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        {/* Passengers */}
        <div className="w-24 shrink-0">
          <label className={labelClass}>Passengers</label>
          <div className="flex items-center gap-2 border-b border-border h-11">
            <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none">−</button>
            <span className="flex-1 text-center text-base">{adults}</span>
            <button type="button" onClick={() => setAdults(Math.min(9, adults + 1))} className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none">+</button>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading || !origin.iataCode || !destination.iataCode}
          className="h-11 px-6 lg:px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-sm font-medium tracking-wide transition-colors disabled:opacity-40 shrink-0"
        >
          {loading ? "Searching…" : "Search flights"}
        </Button>
      </div>
    </form>
  );
}
