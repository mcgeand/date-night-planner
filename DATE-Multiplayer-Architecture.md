# D.A.T.E. — Multiplayer Architecture Notes

*March 23, 2026 — Brainstorm session between Danny & Claude*

---

## The Idea

Turn D.A.T.E. into a real-time multiplayer experience where Dominic and Danny each play from their own phone, and a shared "TV screen" displays the swirl, elimination, and results. No more passing the phone back and forth or peeking at each other's picks.

## How It Would Work

### The Player Experience

1. One person creates a game and gets a **room code** (e.g., "DATE-7482")
2. The other person joins by entering that code on their phone
3. Each player sees **only their own screens** — entry, veto decisions, swirl button
4. A third screen (laptop, tablet, or cast to TV) shows the **shared game board** — the combined options, swirl animations, elimination countdown, and final results

Think **Jackbox Games** style: phones are controllers, big screen is the show.

### Three Views

| View | Shows | Used On |
|------|-------|---------|
| **Player 1 Controller** | Name entry, option input, veto buttons, swirl trigger | Phone |
| **Player 2 Controller** | Same as above, for the other player | Phone |
| **Display Screen** | Combined board, dual swirl animation, elimination, results, history | Laptop / TV |

## Tech Options (Simple → Fancy)

### Option 1: Supabase Realtime (Recommended First Step)
- **Why:** Danny already has Supabase connected
- **How:** Game sessions stored in a Supabase table, realtime subscriptions sync state between all three screens
- **Hosting:** React app on Vercel or Netlify (free tier)
- **Pros:** Minimal new infrastructure, built-in persistence (history lives in the DB for free), generous free tier
- **Cons:** Slightly higher latency than raw WebSockets (~100-200ms), which is fine for this use case

### Option 2: Node.js + Socket.IO
- **Why:** Lower latency, more control over real-time events
- **How:** Small Express server with Socket.IO rooms, deploy to Railway or Fly.io
- **Pros:** Snappier swirl sync, more mature real-time patterns
- **Cons:** Need to manage a server, pay for hosting (though cheap)

### Option 3: Peer-to-Peer (PeerJS / WebRTC)
- **Why:** No server needed beyond initial connection
- **How:** Browsers connect directly to each other
- **Pros:** Zero hosting cost, zero latency
- **Cons:** Harder to add the third "TV screen" view, connection setup can be flaky, no built-in persistence

## What Would Change in the Code

The good news: **most of the existing React components stay the same**. The category cards, swirl canvas, elimination animation, veto UI, results card, and history timeline are all reusable. The main refactor is:

1. **Session management** — Create/join game rooms, track connected players
2. **State synchronization** — Game phase, entries, veto actions, swirl numbers all sync via the server instead of local React state
3. **View routing** — A URL parameter (`?role=player1`, `?role=player2`, `?role=display`) determines which components render
4. **Turn enforcement** — Server validates that only the correct player can submit during their turn

### New Data Model (Supabase example)

```
game_sessions table:
  id (uuid)
  room_code (text, unique)
  phase (text) — setup, entry-p1, entry-p2, veto, swirl, eliminating, results
  config (jsonb) — players, optionsPerPerson, vetosPerPerson
  entries (jsonb) — all category entries by player
  swirl_numbers (jsonb) — { p1: number, p2: number }
  elim_number (int)
  results (jsonb) — final categories with winners
  created_at (timestamp)

date_history table:
  id (uuid)
  session_id (fk → game_sessions)
  rating (int)
  mood (jsonb)
  highlight (text)
  notes (text)
  created_at (timestamp)
```

## Estimated Effort

| Task | Effort |
|------|--------|
| Supabase tables + realtime setup | ~1 hour |
| Session create/join flow (room codes) | ~2 hours |
| Refactor state to sync via Supabase | ~3 hours |
| Split into Player vs Display views | ~2 hours |
| Deploy to Vercel | ~30 min |
| Testing & polish | ~2 hours |
| **Total** | **~10-11 hours** |

## Nice-to-Haves for Later

- **Push notifications** — "It's your turn to enter options!" when the other player finishes
- **Persistent login** — Simple magic link or PIN so history follows you across devices
- **Themed rooms** — Custom backgrounds, sound effects, seasonal themes
- **Friends list** — Quick-start a game with your partner without room codes
- **Share results** — Generate a pretty image/card of the date night plan to text or post

## Decision

For now, the single-device version works great for us. This doc is here for when we're ready to level up. The Supabase path is the natural first move since it's already connected and handles both realtime sync and persistent history storage.
