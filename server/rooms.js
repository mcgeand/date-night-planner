import crypto from "crypto";

const rooms = new Map();
const ROOM_TTL = 30 * 60 * 1000; // 30 minutes

function generateCode() {
  const num = crypto.randomInt(1000, 9999);
  return `DATE-${num}`;
}

export function createRoom(config) {
  let code;
  do { code = generateCode(); } while (rooms.has(code));

  const room = {
    roomCode: code,
    phase: "lobby",
    config: { players: ["Player 1", "Player 2"], optionsPerPerson: 2, vetosPerPerson: 2, ...config },
    players: { p1: null, p2: null },
    displaySocketId: null,
    entries: {},
    entryStatus: { p1: false, p2: false },
    vetos: { p1: [], p2: [] },
    vetoStatus: { p1: false, p2: false },
    swirlNumbers: { p1: null, p2: null },
    elimNumber: null,
    elimResults: null,
    vetoLog: [],
    pendingVeto: null,
    createdAt: Date.now(),
  };

  rooms.set(code, room);
  return room;
}

export function joinRoom(roomCode, socketId, playerName, sessionToken) {
  const room = rooms.get(roomCode);
  if (!room) return { error: "Room not found" };

  // Reconnection: match by session token
  for (const slot of ["p1", "p2"]) {
    if (room.players[slot]?.sessionToken === sessionToken) {
      room.players[slot].socketId = socketId;
      room.players[slot].connected = true;
      room.players[slot].name = playerName;
      return {
        playerSlot: slot,
        sessionToken,
        playersConnected: countPlayers(room),
      };
    }
  }

  // New join
  const token = crypto.randomUUID();
  for (const slot of ["p1", "p2"]) {
    if (!room.players[slot]) {
      room.players[slot] = { socketId, name: playerName, connected: true, sessionToken: token };
      // Update config player name
      const idx = slot === "p1" ? 0 : 1;
      room.config.players[idx] = playerName;
      return {
        playerSlot: slot,
        sessionToken: token,
        playersConnected: countPlayers(room),
      };
    }
  }

  return { error: "Room is full" };
}

function countPlayers(room) {
  let count = 0;
  if (room.players.p1?.connected) count++;
  if (room.players.p2?.connected) count++;
  return count;
}

export function getRoom(roomCode) {
  return rooms.get(roomCode) || null;
}

export function removeRoom(roomCode) {
  rooms.delete(roomCode);
}

export function cleanupStaleRooms() {
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (now - room.createdAt > ROOM_TTL && room.phase !== "eliminating" && room.phase !== "results") {
      rooms.delete(code);
      console.log(`Cleaned up stale room: ${code}`);
    }
  }
}
