import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { initDb } from "./db.js";
import { createRoom, joinRoom, getRoom, removeRoom, cleanupStaleRooms } from "./rooms.js";
import { handleGameEvent } from "./game.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Init database
const db = initDb();

// Serve built client in production
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// REST: History
app.get("/api/history", (req, res) => {
  const rows = db.prepare("SELECT * FROM history ORDER BY created_at DESC").all();
  res.json(rows.map(r => ({
    ...r,
    players: JSON.parse(r.players),
    categories: JSON.parse(r.categories),
    mood: r.mood ? JSON.parse(r.mood) : null,
  })));
});

app.get("/api/history/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM history WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json({
    ...row,
    players: JSON.parse(row.players),
    categories: JSON.parse(row.categories),
    mood: row.mood ? JSON.parse(row.mood) : null,
  });
});

// REST: Get the most recent unrated date (for "Rate Your Last Date")
app.get("/api/unrated", (req, res) => {
  const row = db.prepare("SELECT * FROM history WHERE rating IS NULL ORDER BY created_at DESC LIMIT 1").get();
  if (!row) return res.json(null);
  res.json({
    ...row,
    players: JSON.parse(row.players),
    categories: JSON.parse(row.categories),
    mood: row.mood ? JSON.parse(row.mood) : null,
  });
});

// REST: Rate a past date
app.post("/api/history/:id/rate", (req, res) => {
  const { rating, mood, highlight, notes } = req.body;
  const row = db.prepare("SELECT * FROM history WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });

  db.prepare(`
    UPDATE history SET rating = ?, mood = ?, highlight = ?, notes = ? WHERE id = ?
  `).run(
    rating || null,
    mood ? JSON.stringify(mood) : null,
    highlight || null,
    notes || null,
    req.params.id,
  );

  res.json({ success: true });
});

// SPA fallback — serve index.html for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Socket.IO
io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);

  socket.on("create-room", (config, callback) => {
    const room = createRoom(config);
    socket.join(room.roomCode);
    socket.data.roomCode = room.roomCode;
    room.displaySocketId = socket.id;
    callback({ roomCode: room.roomCode });
    console.log(`Room created: ${room.roomCode}`);
  });

  socket.on("join-room", ({ roomCode, playerName, sessionToken }, callback) => {
    const result = joinRoom(roomCode, socket.id, playerName, sessionToken);
    if (result.error) return callback({ error: result.error });

    socket.join(roomCode);
    socket.data.roomCode = roomCode;
    socket.data.playerSlot = result.playerSlot;
    socket.data.sessionToken = result.sessionToken;

    // Notify everyone in the room
    io.to(roomCode).emit("player-joined", {
      playerSlot: result.playerSlot,
      name: playerName,
      playersConnected: result.playersConnected,
    });

    callback({ playerSlot: result.playerSlot, sessionToken: result.sessionToken });
    console.log(`${playerName} joined ${roomCode} as ${result.playerSlot}`);

    // Replay current game state for reconnecting players
    const room = getRoom(roomCode);
    if (room && room.phase !== "lobby") {
      socket.emit("phase-change", {
        phase: room.phase,
        config: room.config,
        entries: room.entries,
        vetoLog: room.vetoLog,
        vetosRemaining: room.vetos ? {
          p1: room.config.vetosPerPerson - room.vetos.p1.length,
          p2: room.config.vetosPerPerson - room.vetos.p2.length,
        } : undefined,
        elimNumber: room.elimNumber,
        elimResults: room.elimResults,
      });
    }
  });

  // Game events
  socket.on("game-event", (payload) => {
    const roomCode = socket.data.roomCode || payload.roomCode;
    const room = getRoom(roomCode);
    if (!room) return;
    handleGameEvent(io, socket, room, payload, db);
  });

  socket.on("disconnect", () => {
    const roomCode = socket.data.roomCode;
    if (roomCode) {
      const room = getRoom(roomCode);
      if (room) {
        // Mark player as disconnected but keep the room
        for (const slot of ["p1", "p2"]) {
          if (room.players[slot]?.socketId === socket.id) {
            room.players[slot].connected = false;
            io.to(roomCode).emit("player-disconnected", { playerSlot: slot });
          }
        }
        if (room.displaySocketId === socket.id) {
          room.displaySocketId = null;
          io.to(roomCode).emit("display-disconnected");
        }
      }
    }
    console.log(`Disconnected: ${socket.id}`);
  });
});

// Cleanup stale rooms every 10 minutes
setInterval(() => cleanupStaleRooms(), 10 * 60 * 1000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`D.A.T.E. server running on http://0.0.0.0:${PORT}`);
});
