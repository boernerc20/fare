"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { AirportSuggestion, AirportGroup } from "@/types/flights";

interface Props {
  displayValue: string;
  label: string;
  placeholder: string;
  onChange: (suggestion: AirportSuggestion) => void;
}

export default function AirportInput({ displayValue, label, placeholder, onChange }: Props) {
  const [query, setQuery] = useState(displayValue);
  const [groups, setGroups] = useState<AirportGroup[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchGroups = useCallback(async (q: string) => {
    if (q.length < 2) { setGroups([]); return; }
    try {
      const res = await fetch(`/api/airports?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch {
      setGroups([]);
    }
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fetchGroups(query), 280);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [query, fetchGroups]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function select(s: AirportSuggestion) {
    const display = s.subType === "CITY"
      ? `${s.cityName} — any airport (${s.iataCode})`
      : `${s.cityName} · ${s.name} (${s.iataCode})`;
    setQuery(display);
    onChange(s);
    setOpen(false);
    setGroups([]);
  }

  const hasResults = groups.length > 0;

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      {/* Input box — retro-futuristic panel style */}
      <div
        className={`
          group/box relative rounded-xl border bg-card/60 backdrop-blur-sm
          px-4 pt-2.5 pb-2 transition-all duration-200 cursor-text
          ${open && hasResults
            ? "border-primary/60 shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_12%,transparent)] ring-0"
            : "border-border/50 hover:border-border"
          }
        `}
        onClick={() => { inputRef.current?.focus(); if (hasResults) setOpen(true); }}
      >
        {/* Label */}
        <span className="block text-[10px] font-mono tracking-[0.22em] uppercase text-primary mb-1 select-none">
          {label}
        </span>

        {/* Input */}
        <input
          ref={inputRef}
          value={query}
          placeholder={placeholder}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { if (hasResults) setOpen(true); }}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none leading-snug"
        />
      </div>

      {/* Dropdown */}
      {open && hasResults && (
        <div className="
          absolute z-50 top-full left-0 right-0 mt-1.5
          bg-card border border-border/60
          rounded-xl shadow-xl overflow-hidden
          max-h-72 overflow-y-auto
        ">
          {groups.map((group) => (
            <div key={group.city.iataCode}>
              {/* City row */}
              <div
                onMouseDown={() => select(group.city)}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-primary/8 group/city border-b border-border/30 last:border-0"
              >
                {/* City icon */}
                <svg className="w-3.5 h-3.5 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>

                {/* IATA code */}
                <span className="font-mono text-xs font-bold tracking-wider text-primary w-9 shrink-0">
                  {group.city.iataCode}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate leading-tight">
                    {group.city.cityName}
                  </p>
                  {group.airports.length > 0 && (
                    <p className="text-[10px] text-muted-foreground font-mono tracking-wide mt-0.5">
                      any airport · {group.airports.length} option{group.airports.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                <span className="text-[10px] font-mono text-muted-foreground/50 shrink-0 ml-auto">
                  {group.city.countryCode}
                </span>
              </div>

              {/* Airport sub-rows */}
              {group.airports.map((ap) => (
                <div
                  key={ap.iataCode}
                  onMouseDown={() => select(ap)}
                  className="flex items-center gap-3 px-4 py-2 pl-10 cursor-pointer hover:bg-muted/60 border-b border-border/20 last:border-0"
                >
                  {/* Plane icon */}
                  <svg className="w-3 h-3 text-muted-foreground/60 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
                  </svg>

                  <span className="font-mono text-xs font-semibold text-muted-foreground w-9 shrink-0">
                    {ap.iataCode}
                  </span>

                  <p className="text-xs text-muted-foreground truncate flex-1">
                    {ap.name.charAt(0) + ap.name.slice(1).toLowerCase()}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
