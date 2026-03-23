# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

D.A.T.E. (Dinner · Activity · Treat · Entertainment) — a cozy MASH-inspired date night planner built as a single React component. Two players take turns entering options across four categories, veto each other's picks, then a swirl animation determines which options get eliminated, leaving a final date night plan.

## Architecture

The entire app lives in **`date-night.jsx`** — a single ~1300-line file exporting `DATEApp` as the default component. There is no build system, package.json, or separate CSS; all styles are inline JS objects.

### Game Flow (phases)
`welcome → setup → entry-p1 → entry-p2 → veto → swirl → eliminating → results`

Phase is managed via `useState("welcome")` in `DATEApp`. Each phase renders a corresponding screen component.

### Key Components (all in date-night.jsx)
- **DATEApp** — root component, holds all game state, phase routing
- **SwirlCanvas** — HTML canvas spiral animation; revolution count maps to elimination number (2–9)
- **DualSwirlScreen** — both players draw swirls, numbers are averaged
- **EliminationScreen** — animated round-robin elimination across categories
- **VetoScreen** — each player vetoes the other's entries
- **ResultScreen / DateSummaryCard** — final plan display
- **RateDateScreen** — post-date rating with mood/highlight capture
- **HistoryScreen** — timeline of past dates with export/import (JSON, localStorage)

### Data Model
- **4 categories**: Dinner, Activity, Treat, Entertainment (defined in `CAT_NAMES` / `CATEGORY_META`)
- **Entries**: `{ [category]: { 0: string[], 1: string[] } }` — indexed by player
- **History**: stored in component state; export/import via JSON blobs
- No backend or database — all state is in-memory with optional JSON export

### Multiplayer Plans
`DATE-Multiplayer-Architecture.md` contains brainstorm notes for a future Supabase Realtime multiplayer version (Jackbox-style: phones as controllers, shared TV display). Not yet implemented.

## Development

This is a standalone JSX component with no build tooling in the repo. To use it, import `DATEApp` into a React project (e.g., Vite, Next.js, CRA). It depends only on React (`useState`, `useEffect`, `useRef`, `useCallback`).

## Style Conventions
- Inline style objects (`cardBase`, `btnPrimary`, `btnSecondary`, `inputStyle`, `pill`)
- Color palette: purple (#a855f7), pink (#ec4899), amber (#f59e0b) gradient theme
- Category-specific colors defined in `CATEGORY_META`
- CSS animations injected via `<style>` tag in the root render
