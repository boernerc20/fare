"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import type { AirportSuggestion } from "@/types/flights";

interface Props {
  value: string;
  label: string;
  placeholder: string;
  onChange: (suggestion: AirportSuggestion) => void;
}

export default function AirportInput({ value, label, placeholder, onChange }: Props) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AirportSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(`/api/airports?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data : []);
    } catch {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [query, fetchSuggestions]);

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
    setQuery(`${s.cityName} (${s.iataCode})`);
    onChange(s);
    setOpen(false);
    setSuggestions([]);
  }

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-widest">
        {label}
      </label>
      <Input
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => { if (suggestions.length) setOpen(true); }}
        className="h-11 border-0 border-b border-border rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary text-base transition-colors"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
          {suggestions.slice(0, 8).map((s) => (
            <li
              key={s.iataCode}
              onMouseDown={() => select(s)}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted transition-colors"
            >
              <span className="text-xs font-mono font-semibold text-primary w-9">{s.iataCode}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{s.cityName}</p>
                <p className="text-xs text-muted-foreground truncate">{s.name}</p>
              </div>
              <span className="ml-auto text-xs text-muted-foreground/60">{s.countryCode}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
