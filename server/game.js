const CAT_NAMES = ["Dinner", "Activity", "Treat", "Entertainment"];

/**
 * Run the MASH elimination algorithm server-side.
 * Returns { [category]: { items, owners, chosen, chosenBy } }
 */
function runElimination(entries, elimNumber) {
  // Build per-category data
  const categories = {};
  for (const cat of CAT_NAMES) {
    const items = [...(entries[cat]?.[0] || []), ...(entries[cat]?.[1] || [])];
    const owners = [
      ...(entries[cat]?.[0] || []).map(() => 0),
      ...(entries[cat]?.[1] || []).map(() => 1),
    ];
    categories[cat] = { items, owners, eliminated: new Set(), chosen: null, chosenBy: null };
  }

  // Build flat list of all active items
  function buildFlatList() {
    const flat = [];
    for (const cat of CAT_NAMES) {
      const c = categories[cat];
      if (c.chosen !== null) continue;
      for (let i = 0; i < c.items.length; i++) {
        if (!c.eliminated.has(i)) {
          flat.push({ cat, idx: i });
        }
      }
    }
    return flat;
  }

  let pointer = 0;
  let safety = 0;

  while (safety < 200) {
    safety++;
    const flat = buildFlatList();
    if (flat.length === 0) break;

    // Count forward by elimNumber
    pointer = (pointer + elimNumber - 1) % flat.length;
    const target = flat[pointer];

    const c = categories[target.cat];
    c.eliminated.add(target.idx);

    // Check if this category now has a chosen option
    const remaining = c.items.map((_, i) => i).filter(i => !c.eliminated.has(i));
    if (remaining.length === 1) {
      c.chosen = remaining[0];
      c.chosenBy = c.owners[remaining[0]];
    }

    // Check if all done
    if (CAT_NAMES.every(cat => categories[cat].chosen !== null)) break;

    // Move pointer to next position after the eliminated item
    const newFlat = buildFlatList();
    if (newFlat.length === 0) break;
    pointer = pointer % newFlat.length;
  }

  // Format results
  const results = {};
  for (const cat of CAT_NAMES) {
    const c = categories[cat];
    results[cat] = {
      items: c.items,
      owners: c.owners,
      eliminated: [...c.eliminated],
      chosen: c.chosen,
      chosenText: c.chosen !== null ? c.items[c.chosen] : null,
      chosenBy: c.chosenBy,
    };
  }
  return results;
}

export function handleGameEvent(io, socket, room, payload, db) {
  const { type } = payload;

  switch (type) {
    case "start-game": {
      if (payload.config) room.config = { ...room.config, ...payload.config };
      console.log("Game started with config:", JSON.stringify(room.config));
      // Initialize empty entries
      const entries = {};
      CAT_NAMES.forEach(c => { entries[c] = { 0: [], 1: [] }; });
      room.entries = entries;
      room.entryStatus = { p1: false, p2: false };
      room.phase = "entry";
      io.to(room.roomCode).emit("phase-change", { phase: "entry", config: room.config });
      break;
    }

    case "submit-entries": {
      const slot = socket.data.playerSlot;
      const playerIdx = slot === "p1" ? 0 : 1;

      // Store this player's entries
      for (const cat of CAT_NAMES) {
        if (payload.entries[cat]) {
          room.entries[cat][playerIdx] = payload.entries[cat];
        }
      }
      room.entryStatus[slot] = true;

      // Notify display of progress
      io.to(room.roomCode).emit("entry-progress", {
        p1Done: room.entryStatus.p1,
        p2Done: room.entryStatus.p2,
      });

      // Both done? Move to veto or skip to swirl if 0 vetos
      if (room.entryStatus.p1 && room.entryStatus.p2) {
        console.log("Both entries in. vetosPerPerson:", room.config.vetosPerPerson, "type:", typeof room.config.vetosPerPerson);
        if (room.config.vetosPerPerson === 0) {
          // Skip veto entirely — go straight to swirl
          room.phase = "swirl";
          room.swirlNumbers = { p1: null, p2: null };
          io.to(room.roomCode).emit("phase-change", {
            phase: "swirl",
            entries: room.entries,
            config: room.config,
          });
          break;
        }
        room.phase = "veto-p1";
        room.vetoStatus = { p1: false, p2: false };
        room.vetos = { p1: [], p2: [] };
        room.vetoLog = [];
        room.pendingVeto = null;
        io.to(room.roomCode).emit("phase-change", {
          phase: "veto-p1",
          entries: room.entries,
          config: room.config,
          vetosRemaining: {
            p1: room.config.vetosPerPerson,
            p2: room.config.vetosPerPerson,
          },
        });
      }
      break;
    }

    case "veto-action": {
      // Active player picks an item to veto
      const { cat, itemIdx } = payload;
      const vetoingSlot = socket.data.playerSlot;
      // Only the active player for this phase can veto
      if ((room.phase === "veto-p1" && vetoingSlot !== "p1") ||
          (room.phase === "veto-p2" && vetoingSlot !== "p2")) break;
      const vetoedText = getItemText(room.entries, cat, itemIdx);
      room.pendingVeto = { cat, itemIdx, vetoedBy: vetoingSlot, vetoedText };

      // Tell the veto-ee to provide a replacement
      const targetSlot = vetoingSlot === "p1" ? "p2" : "p1";
      const targetSocketId = room.players[targetSlot]?.socketId;
      if (targetSocketId) {
        io.to(targetSocketId).emit("request-replacement", {
          cat,
          itemIdx,
          vetoedText: getItemText(room.entries, cat, itemIdx),
        });
      }

      // Update display
      io.to(room.roomCode).emit("veto-pending", {
        cat,
        itemIdx,
        vetoedBy: vetoingSlot,
        vetoedText: getItemText(room.entries, cat, itemIdx),
      });
      break;
    }

    case "veto-replacement": {
      const { cat, itemIdx, newText } = payload;
      if (!room.pendingVeto) break;

      // Replace the item in entries
      replaceItem(room.entries, cat, itemIdx, newText);

      const vetoEntry = {
        cat,
        itemIdx,
        oldText: room.pendingVeto.vetoedText || "?",
        newText,
        vetoedBy: room.pendingVeto.vetoedBy,
      };
      room.vetoLog.push(vetoEntry);

      const vetoingSlot = room.pendingVeto.vetoedBy;
      room.vetos[vetoingSlot].push(vetoEntry);
      room.pendingVeto = null;

      // Broadcast updated state
      io.to(room.roomCode).emit("veto-update", {
        entries: room.entries,
        vetoLog: room.vetoLog,
        vetosRemaining: {
          p1: room.config.vetosPerPerson - room.vetos.p1.length,
          p2: room.config.vetosPerPerson - room.vetos.p2.length,
        },
      });
      break;
    }

    case "veto-done": {
      const slot = socket.data.playerSlot;
      room.vetoStatus[slot] = true;

      if (room.phase === "veto-p1" && slot === "p1") {
        room.phase = "veto-p2";
        io.to(room.roomCode).emit("phase-change", {
          phase: "veto-p2",
          entries: room.entries,
          vetoLog: room.vetoLog,
          vetosRemaining: {
            p1: room.config.vetosPerPerson - room.vetos.p1.length,
            p2: room.config.vetosPerPerson - room.vetos.p2.length,
          },
        });
      } else if (room.phase === "veto-p2" && slot === "p2") {
        room.phase = "swirl";
        room.swirlNumbers = { p1: null, p2: null };
        io.to(room.roomCode).emit("phase-change", { phase: "swirl" });
      }
      break;
    }

    case "submit-swirl": {
      const slot = socket.data.playerSlot;
      room.swirlNumbers[slot] = payload.number;

      io.to(room.roomCode).emit("swirl-progress", {
        p1: room.swirlNumbers.p1,
        p2: room.swirlNumbers.p2,
      });

      // Both done? Pre-calculate, let players see the combining animation, then move to elimination
      if (room.swirlNumbers.p1 !== null && room.swirlNumbers.p2 !== null) {
        room.elimNumber = room.swirlNumbers.p1 + room.swirlNumbers.p2;
        room.elimResults = runElimination(room.entries, room.elimNumber);

        // 5 second delay so phones can show the combining animation
        if (room.elimTimeout) clearTimeout(room.elimTimeout);
        room.elimTimeout = setTimeout(() => {
          room.elimTimeout = null;
          room.phase = "eliminating";
          io.to(room.roomCode).emit("phase-change", {
            phase: "eliminating",
            elimNumber: room.elimNumber,
            entries: room.entries,
            elimResults: room.elimResults,
          });
        }, 5000);
      }
      break;
    }

    case "elimination-done": {
      // Only process once — both display and phone can fire this event
      if (room.phase !== "eliminating") break;

      // Save the date plan to DB immediately (unrated) so they can go enjoy it
      const categories = {};
      for (const cat of CAT_NAMES) {
        const r = room.elimResults[cat];
        if (r && r.chosen !== null) {
          categories[cat] = {
            chosen: r.chosenText,
            pickedBy: room.config.players[r.chosenBy],
          };
        }
      }

      const sessionInsert = db.prepare(`
        INSERT OR REPLACE INTO sessions (room_code, config, entries, swirl_numbers, elim_number, results, status)
        VALUES (?, ?, ?, ?, ?, ?, 'completed')
      `);
      const sessionResult = sessionInsert.run(
        room.roomCode,
        JSON.stringify(room.config),
        JSON.stringify(room.entries),
        JSON.stringify(room.swirlNumbers),
        room.elimNumber,
        JSON.stringify(room.elimResults),
      );

      const historyInsert = db.prepare(`
        INSERT INTO history (session_id, date, players, categories, rating, mood, highlight, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      historyInsert.run(
        sessionResult.lastInsertRowid,
        new Date().toISOString(),
        JSON.stringify(room.config.players),
        JSON.stringify(categories),
        null, null, null, null,
      );

      room.phase = "results";
      io.to(room.roomCode).emit("phase-change", {
        phase: "results",
        elimResults: room.elimResults,
        config: room.config,
      });
      io.to(room.roomCode).emit("game-saved", { historyEntry: { date: new Date().toISOString(), players: room.config.players, categories } });
      break;
    }

    case "play-again": {
      if (room.elimTimeout) { clearTimeout(room.elimTimeout); room.elimTimeout = null; }
      room.swirlNumbers = { p1: null, p2: null };
      room.elimNumber = null;
      room.elimResults = null;
      room.phase = "swirl";
      io.to(room.roomCode).emit("phase-change", { phase: "swirl", elimResults: null, elimNumber: null });
      break;
    }

    case "fresh-start": {
      if (room.elimTimeout) { clearTimeout(room.elimTimeout); room.elimTimeout = null; }
      const entries = {};
      CAT_NAMES.forEach(c => { entries[c] = { 0: [], 1: [] }; });
      room.entries = entries;
      room.entryStatus = { p1: false, p2: false };
      room.vetoStatus = { p1: false, p2: false };
      room.vetos = { p1: [], p2: [] };
      room.vetoLog = [];
      room.pendingVeto = null;
      room.swirlNumbers = { p1: null, p2: null };
      room.elimNumber = null;
      room.elimResults = null;
      room.phase = "entry";
      io.to(room.roomCode).emit("phase-change", { phase: "entry", config: room.config });
      break;
    }
  }
}

// Helper: get item text by flat index across a category's two player arrays
function getItemText(entries, cat, flatIdx) {
  const p0 = entries[cat]?.[0] || [];
  const p1 = entries[cat]?.[1] || [];
  const all = [...p0, ...p1];
  return all[flatIdx] || "?";
}

// Helper: replace item by flat index
function replaceItem(entries, cat, flatIdx, newText) {
  const p0 = entries[cat]?.[0] || [];
  const p1 = entries[cat]?.[1] || [];
  if (flatIdx < p0.length) {
    entries[cat][0][flatIdx] = newText;
  } else {
    entries[cat][1][flatIdx - p0.length] = newText;
  }
}
