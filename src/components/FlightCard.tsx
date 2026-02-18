"use client";

import { Badge } from "@/components/ui/badge";
import { formatTime, formatDate, formatPrice, dayDiff } from "@/lib/format";
import type { FlightOffer } from "@/types/flights";

interface Props {
  offer: FlightOffer;
  carriers: Record<string, string>;
  rank: number;
}

function SegmentRow({ segments, carriers }: {
  segments: FlightOffer["itineraries"][0]["segments"];
  carriers: Record<string, string>;
}) {
  const first = segments[0];
  const last = segments[segments.length - 1];
  const totalMins = segments.reduce((acc, s) => {
    const m = s.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    return acc + parseInt(m?.[1] ?? "0") * 60 + parseInt(m?.[2] ?? "0");
  }, 0);
  const durationStr = `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`;
  const diff = dayDiff(first.departure.at, last.arrival.at);
  const stops = segments.length - 1;

  return (
    <div className="flex items-center gap-4 flex-1 min-w-0">
      {/* Airline */}
      <div className="w-24 shrink-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {carriers[first.carrierCode] ?? first.carrierCode}
        </p>
        <p className="text-xs text-muted-foreground font-mono">{first.carrierCode} {first.number}</p>
      </div>

      {/* Departure */}
      <div className="text-right shrink-0">
        <p className="text-xl font-light tracking-tight text-foreground">{formatTime(first.departure.at)}</p>
        <p className="text-xs text-muted-foreground">{first.departure.iataCode}</p>
      </div>

      {/* Route line */}
      <div className="flex-1 flex flex-col items-center gap-1 min-w-0 px-2">
        <p className="text-xs text-muted-foreground">{durationStr}</p>
        <div className="w-full flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full border border-border shrink-0" />
          <div className="flex-1 border-t border-dashed border-border" />
          {stops > 0 && (
            <div className="flex gap-0.5">
              {segments.slice(0, -1).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              ))}
            </div>
          )}
          <div className="flex-1 border-t border-dashed border-border" />
          <svg className="w-3 h-3 text-muted-foreground shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
          </svg>
        </div>
        <p className="text-xs text-muted-foreground">
          {stops === 0 ? "Non-stop" : stops === 1 ? `1 stop · ${segments[0].arrival.iataCode}` : `${stops} stops`}
        </p>
      </div>

      {/* Arrival */}
      <div className="text-left shrink-0">
        <p className="text-xl font-light tracking-tight text-foreground">
          {formatTime(last.arrival.at)}
          {diff > 0 && <sup className="text-xs text-muted-foreground ml-0.5">+{diff}</sup>}
        </p>
        <p className="text-xs text-muted-foreground">{last.arrival.iataCode}</p>
      </div>
    </div>
  );
}

export default function FlightCard({ offer, carriers, rank }: Props) {
  const isReturn = offer.itineraries.length > 1;
  const baggage = offer.travelerPricings[0]?.fareDetailsBySegment[0]?.includedCheckedBags;
  const cabin = offer.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin ?? "";

  return (
    <div className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col gap-4">
        {rank === 0 && (
          <div className="self-start">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-medium px-2.5 py-0.5">
              Lowest price
            </Badge>
          </div>
        )}

        <div className="space-y-3">
          {offer.itineraries.map((itin, idx) => (
            <div key={idx}>
              {isReturn && (
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
                  {idx === 0 ? "Outbound · " : "Return · "}
                  {formatDate(itin.segments[0].departure.at)}
                </p>
              )}
              <SegmentRow segments={itin.segments} carriers={carriers} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span className="capitalize">{cabin.charAt(0) + cabin.slice(1).toLowerCase()}</span>
            {baggage && <span>· {baggage.quantity} bag{baggage.quantity !== 1 ? "s" : ""} included</span>}
            {offer.numberOfBookableSeats <= 5 && (
              <span className="text-primary font-medium">· {offer.numberOfBookableSeats} seats left</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-light text-foreground">
                {formatPrice(offer.price.grandTotal, offer.price.currency)}
              </p>
              <p className="text-xs text-muted-foreground">per person · all fees</p>
            </div>
            <button className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors">
              Select
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
