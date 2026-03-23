# D.A.T.E.

**Dinner · Activity · Treat · Entertainment**

A cozy MASH-inspired date night planner for two. Jackbox-style multiplayer — phones are the controllers, a laptop or TV is the shared display.

Both players privately enter date ideas across four categories, take turns vetoing each other's picks, then draw spirals on their phones to generate the magic elimination number. A dramatic MASH-style countdown knocks out options one by one until the perfect date night remains.

## How It Works

1. **Create a room** on the display (laptop/TV) — a room code and QR code appear
2. **Both players join** from their phones by scanning the QR or entering the code
3. **Enter options** — each player privately submits date ideas across all four categories
4. **Veto round** — take turns vetoing each other's picks (the vetoed player replaces it)
5. **Swirl** — both players draw spirals on their phones; the combined count becomes the elimination number
6. **Elimination** — animated MASH countdown removes options until one remains per category
7. **Results** — your date night plan is revealed!
8. **Rate it** — after the date, come back and rate it with mood, highlights, and notes

## Quick Start

```bash
npm install
npm run dev
```

Opens the Vite dev server on `http://localhost:5173` with the game server on port 3000.

**Display**: open `/display` on your laptop/TV
**Phones**: open `/join` on each player's phone (same WiFi network)

## Production

```bash
npm run build    # Build client → server/public/
npm start        # Node serves everything on port 3000
```

## Docker

```bash
docker compose up -d
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for full self-hosting instructions.

## Tech Stack

- **Server**: Node.js + Express + Socket.IO
- **Client**: React + Vite
- **Database**: SQLite (better-sqlite3) — auto-created, zero config
- **Deploy**: Docker, single container, single port

## Project Structure

```
server/
  index.js           Express + Socket.IO + static serving + REST API
  db.js              SQLite schema (sessions + history)
  game.js            Game state machine, elimination algorithm
  rooms.js           Room management, session tokens, reconnection

client/src/
  App.jsx            Role router (display vs mobile vs landing)
  display/           TV/laptop screens (lobby, veto grid, elimination, results, history)
  mobile/            Phone screens (join, entry, veto, swirl, rate)
  shared/            Reusable components, constants, styles
  hooks/             useSocket, useGameState
```

## Game Phases

```
lobby → entry → veto-p1 → veto-p2 → swirl → eliminating → results → rate → done
```

The server is the source of truth — all game mutations go through Socket.IO events validated server-side. Phones can reconnect mid-game via session tokens stored in sessionStorage.
