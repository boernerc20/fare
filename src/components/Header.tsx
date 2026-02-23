"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render toggle after mount
  useEffect(() => setMounted(true), []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-10 py-4 border-b border-border/50 bg-background/80 backdrop-blur-md">
      {/* Wordmark */}
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold tracking-tight text-foreground">
          fare
        </span>
        <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 tracking-widest uppercase">
          beta
        </span>
      </div>

      {/* Nav */}
      <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
        <button className="hover:text-foreground transition-colors">Flights</button>
        <button className="hover:text-foreground transition-colors opacity-40 cursor-not-allowed" title="Coming soon">Hotels</button>
        <button className="hover:text-foreground transition-colors opacity-40 cursor-not-allowed" title="Coming soon">Deals</button>
      </nav>

      {/* Theme toggle */}
      {mounted && (
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            /* Sun */
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
            </svg>
          ) : (
            /* Moon */
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      )}
    </header>
  );
}
