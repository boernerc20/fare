# Fare

A minimalist flight deal finder. Search and compare cheap airline tickets across hundreds of airlines with a clean, retro-futuristic UI.

## Features

- **Flight search** — one-way and return trips, cabin class, passenger count, non-stop filter
- **Airport autocomplete** — debounced search with IATA code lookup
- **Route map** — great-circle arc renders as soon as you pick both airports, before you even search
- **Sort & compare** — results sorted by price, duration, or departure time
- **Dark / light mode** — system preference detected, toggle in the header
- **Server-side API proxying** — credentials never reach the browser

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Font | Space Grotesk |
| Flight data | Amadeus Self-Service API |
| Map | React Leaflet + CartoDB tiles |
| Theming | next-themes |

## Getting started

### 1. Clone and install

```bash
git clone git@github.com:boernerc20/fare.git
cd fare
npm install
```

### 2. Get Amadeus API credentials

Sign up free at [developers.amadeus.com](https://developers.amadeus.com) — no credit card required.

- Create an app in the dashboard
- Copy your **API Key** and **API Secret**
- The sandbox tier gives you **1k–10k free calls/month** with realistic test data

### 3. Add environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
AMADEUS_API_KEY=your_api_key_here
AMADEUS_API_SECRET=your_api_secret_here
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/
    page.tsx              ← main search page
    layout.tsx            ← font, theme provider, metadata
    api/
      flights/route.ts    ← proxies Amadeus flight search
      airports/route.ts   ← proxies airport autocomplete
  components/
    Header.tsx            ← wordmark + theme toggle
    SearchForm.tsx        ← trip type, cabin class, date, passengers
    AirportInput.tsx      ← debounced autocomplete
    FlightResults.tsx     ← sort controls + card list
    FlightCard.tsx        ← single flight offer
    RouteMap.tsx          ← Leaflet map with great-circle arc
  lib/
    amadeus.ts            ← Amadeus SDK client (server-only)
    format.ts             ← duration, time, price formatters
  types/
    flights.ts            ← shared TypeScript interfaces
```

## Commands

```bash
npm run dev       # development server (localhost:3000)
npm run build     # production build
npm run lint      # ESLint
npx tsc --noEmit  # type check only
```

## Roadmap

- [ ] Second data source (Kiwi/Tequila API)
- [ ] Flexible date / price calendar view
- [ ] Hotel search tab
- [ ] Price drop alerts
