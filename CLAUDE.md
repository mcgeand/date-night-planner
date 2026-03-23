# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

D.A.T.E. (Dinner · Activity · Treat · Entertainment) — a multiplayer MASH-inspired date night planner. Jackbox-style: phones are controllers, laptop/TV is the display. Self-hosted via Docker on a Proxmox VM with SQLite persistence.

## Architecture

### Three Views
- **Display** (`/display`) — laptop/TV shows the game: room code + QR, veto grid, elimination animation, results, history. All display screens use fluid responsive design with CSS `clamp()` for TV/large display viewing (1200px-1920px).
- **Mobile** (`/join`) — phones join via room code, enter options, veto, swirl, rate. Includes lobby with game config, deferred date rating.
- **Landing** (`/`) — role picker linking to display or join

### Tech Stack
- **Server**: Node.js + Express + Socket.IO (single process, `server/index.js`)
- **Client**: Vite + React SPA with role-based routing (`client/src/`)
- **Database**: SQLite via better-sqlite3 (`data/date.db`, auto-created, WAL mode)
- **Deploy**: Docker Compose → GHCR (`ghcr.io/mcgeand/date-night-planner`), Watchtower auto-updates on the host

### Game Flow (server-orchestrated phases)
```
lobby → entry → [veto-p1 → veto-p2] → swirl → eliminating → results
```
Veto phases are skipped when `vetosPerPerson` is 0. Server is source of truth. All mutations go through Socket.IO events validated by `server/game.js`. Date plan is auto-saved to DB after elimination (no rating required).

### Replay Modes
- **Spin Again** (`play-again`): keeps same entries, re-rolls from swirl phase
- **New Round** (`fresh-start`): resets everything back to entry phase

## Commands

```bash
npm run dev          # Concurrent: Vite dev server (5173) + Node server (3000)
npm run dev:server   # Server only with --watch-path=server
npm run dev:client   # Vite only
npm run build        # Build client to server/public/
npm start            # Production: Node serves built client + API + WebSocket
npm run preview      # Build + start (quick production test)
docker compose up    # Run in Docker (pulls from GHCR)
```

## CI/CD

- **Docker publish** (`.github/workflows/docker-publish.yml`): builds and pushes to GHCR on push to `main` (`:latest`) or `dev` (`:dev`). Multi-stage Dockerfile with `node:20-alpine`.
- **Code review** (`.github/workflows/code-review.yml`): Claude code review on PRs to `main`/`dev`.

## REST API

```
GET  /api/history          # All date history, newest first
GET  /api/history/:id      # Single history entry
GET  /api/unrated          # Most recent unrated date (for deferred rating)
POST /api/history/:id/rate # Submit rating { rating, mood, highlight, notes }
```

## Project Structure

```
server/
  index.js         # Express + Socket.IO + static serving + REST API
  db.js            # SQLite init + schema (sessions + history tables)
  game.js          # Game state machine, elimination algorithm, all event handlers
  rooms.js         # Room create/join/cleanup, session tokens for reconnection

client/src/
  App.jsx          # Role router (display vs mobile vs landing)
  main.jsx         # React entry point
  hooks/
    useSocket.js     # Socket.IO connection + emit/on helpers
    useGameState.js  # Subscribe to all game events, return current state
  shared/
    constants.js     # CATEGORY_META, CAT_NAMES, SUGGESTIONS, MOODS, PLAYER_COLORS
    styles.js        # cardBase, btnPrimary, btnSecondary, inputStyle, globalStyles
    Confetti.jsx     # Confetti animation component
    StepIndicator.jsx # Phase progress indicator
    DateSummaryCard.jsx # Reusable date plan summary card
  display/
    DisplayShell.jsx       # Phase router + header for all display screens
    WelcomeScreen.jsx      # Landing/create room (fluid responsive)
    WaitingRoom.jsx        # Room code, QR code, player join (horizontal layout, fluid)
    VetoDisplay.jsx        # Live veto grid with log
    DualSwirlDisplay.jsx   # Both players' swirl results with combining animation
    EliminationScreen.jsx  # Animated MASH elimination (fluid responsive)
    ResultScreen.jsx       # Final date plan display
    HistoryScreen.jsx      # Timeline of past dates from REST API
  mobile/
    MobileShell.jsx        # Phase router for all phone screens
    JoinScreen.jsx         # Enter room code + name, deferred rating link
    LobbyScreen.jsx        # Game config (options/vetos per person) + start button
    WaitingScreen.jsx      # Generic "waiting for..." screen
    PlayerEntryScreen.jsx  # Private option entry (parallel, both players at once)
    VetoMobile.jsx         # Tap opponent's entries to veto, enter replacements
    SwirlScreen.jsx        # Draw spiral on phone, progressive feedback
    RateDateScreen.jsx     # Star rating, mood, highlights, notes (deferred)
```

## Key Design Decisions
- **Parallel entry**: both players enter options simultaneously (no passing phone)
- **Turn-based veto**: P1 vetos first, then P2 (configurable, can be set to 0 to skip)
- **Server pre-calculates elimination**: display animation is cosmetic; results stored regardless
- **Auto-save after elimination**: date plan saved to DB immediately, rating is deferred
- **Deferred rating**: players rate dates later from the join screen, not during the game
- **Session tokens**: per-tab tokens via sessionStorage prevent collision between multiple browser tabs
- **Single port**: Express serves everything — no nginx/reverse proxy needed
- **Fluid responsive display**: all display screens use CSS `clamp()` with viewport units for graceful scaling from laptops to TVs

## Style Conventions
- All inline React style objects (no CSS files)
- Shared styles in `client/src/shared/styles.js`
- Color palette: purple (#a855f7), pink (#ec4899), amber (#f59e0b)
- Category colors defined in `CATEGORY_META` (constants.js)
- Display screens use `clamp(min, preferred-vw, max)` for fluid sizing
- Collaborative language throughout (not competitive — no "winner/loser")

## Git Workflow
- `main` — production, triggers `:latest` Docker image
- `dev` — integration branch, triggers `:dev` Docker image
- Feature branches off `dev`, PRs into `dev`

## Legacy
- `date-night.jsx` — original single-file app (preserved for reference)
