# Travel Website — Project Context

## Stack (read before touching any file)
- **Framework**: Next.js 16 · App Router · TypeScript · Tailwind CSS
- **UI**: shadcn/ui (components in `src/components/ui/` — never hand-edit these)
- **Font**: Geist via `next/font/google`, mapped to `--font-geist` CSS var
- **Flight data**: Amadeus REST API via official `amadeus` npm package
- **Credentials**: `AMADEUS_API_KEY` + `AMADEUS_API_SECRET` in `.env.local` (never commit)

## File Map (quick reference — avoids full tree reads)
```
src/
  app/
    page.tsx              ← main page, client component, search state machine
    layout.tsx            ← font + metadata
    api/flights/route.ts  ← GET handler → amadeus.searchFlights()
    api/airports/route.ts ← GET handler → amadeus.searchAirports()
  components/
    SearchForm.tsx        ← trip type, cabin class, nonStop toggle, passenger count
    AirportInput.tsx      ← debounced autocomplete, calls /api/airports
    FlightResults.tsx     ← sort controls (price/duration/departure) + card list
    FlightCard.tsx        ← single offer: segments, route line, price, select btn
  lib/
    amadeus.ts            ← lazy-init client, searchFlights(), searchAirports()
    format.ts             ← formatDuration/Time/Date/Price, dayDiff
    utils.ts              ← shadcn cn() helper
  types/
    flights.ts            ← SearchParams, FlightOffer, Itinerary, etc.
    amadeus.d.ts          ← manual type declarations for untyped amadeus package
```

## Design System Rules
- **Palette**: neutral-50 bg, neutral-900 text, white cards — no colour accents except emerald (badges) and amber (seat warnings)
- **Shapes**: rounded-2xl cards, rounded-full pills/buttons, border-b underline inputs (no box border)
- **Motion**: `transition-all duration-200` on hover states only — no animations beyond loading spinner
- **Typography**: font-light for large numbers/headings, text-xs uppercase tracking-wide for labels

## Architecture Decisions (don't undo without reason)
- API routes proxy all Amadeus calls — keys never reach the browser
- Amadeus client is lazily initialised (module loads without env vars at build time)
- Shared types live in `src/types/flights.ts` — both API routes and components import from here
- No state management library — local useState in page.tsx is sufficient for Phase 1

## Phase Status
- [x] Phase 1: Flight search (Amadeus sandbox, full UI)
- [ ] Phase 2: Second data source (Kiwi/Tequila API) — merge results in route handler
- [ ] Phase 3: Price calendar / flexible dates view
- [ ] Phase 4: Hotel + car hire tabs
- [ ] Phase 5: Deal alerts (email/push when price drops)

## Common Tasks → Right Approach

| Task | Do this |
|---|---|
| Add a new UI component | Edit existing or `npx shadcn@latest add <name>` |
| Add a second flight API | New `src/lib/kiwi.ts`, merge in `api/flights/route.ts` |
| Change a shared type | Edit `src/types/flights.ts`, tsc will surface breakage |
| Read one component | `Read` tool directly — don't spawn an agent |
| Explore unfamiliar package API | Haiku agent or context7 docs |
| Implement a new feature | Sonnet (current model) — no agent needed |

## Token-Saving Rules (inherits from ~/CLAUDE.md)
- Read files with `offset/limit` when only a section is needed
- Grep with `head_limit` — never read `.next/` or `node_modules/`
- Batch independent reads/writes in one message
- Use `model: "haiku"` for any Task that is research/search only
- `npx tsc --noEmit` to verify types before assuming correctness

## Dev Commands
```bash
npm run dev      # localhost:3000
npm run build    # production build + type check
npx tsc --noEmit # type check only (faster)
```
