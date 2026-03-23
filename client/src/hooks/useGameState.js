import { useState, useEffect, useCallback } from "react";

export function useGameState(socket) {
  const [phase, setPhase] = useState(null);
  const [config, setConfig] = useState(null);
  const [entries, setEntries] = useState(null);
  const [entryProgress, setEntryProgress] = useState({ p1Done: false, p2Done: false });
  const [vetoLog, setVetoLog] = useState([]);
  const [vetosRemaining, setVetosRemaining] = useState({ p1: 0, p2: 0 });
  const [pendingVeto, setPendingVeto] = useState(null);
  const [swirlProgress, setSwirlProgress] = useState({ p1: null, p2: null });
  const [elimData, setElimData] = useState(null);
  const [elimResults, setElimResults] = useState(null);
  const [playersConnected, setPlayersConnected] = useState(0);
  const [playerNames, setPlayerNames] = useState({});
  const [savedEntry, setSavedEntry] = useState(null);

  useEffect(() => {
    if (!socket.current) return;
    const s = socket.current;

    const handlers = {
      "phase-change": (data) => {
        setPhase(data.phase);
        if (data.config) setConfig(data.config);
        if (data.entries) setEntries(data.entries);
        if (data.vetoLog) setVetoLog(data.vetoLog);
        if (data.vetosRemaining) setVetosRemaining(data.vetosRemaining);
        if (data.elimNumber !== undefined) {
          setElimData({ elimNumber: data.elimNumber, entries: data.entries });
        }
        if (data.elimResults) setElimResults(data.elimResults);
      },
      "player-joined": (data) => {
        setPlayersConnected(data.playersConnected);
        setPlayerNames(prev => ({ ...prev, [data.playerSlot]: data.name }));
      },
      "player-disconnected": (data) => {
        setPlayersConnected(prev => Math.max(0, prev - 1));
      },
      "entry-progress": (data) => setEntryProgress(data),
      "veto-update": (data) => {
        if (data.entries) setEntries(data.entries);
        if (data.vetoLog) setVetoLog(data.vetoLog);
        if (data.vetosRemaining) setVetosRemaining(data.vetosRemaining);
      },
      "veto-pending": (data) => setPendingVeto(data),
      "request-replacement": (data) => setPendingVeto({ ...data, needsReplacement: true }),
      "swirl-progress": (data) => setSwirlProgress(data),
      "game-saved": (data) => setSavedEntry(data.historyEntry),
    };

    for (const [event, handler] of Object.entries(handlers)) {
      s.on(event, handler);
    }

    return () => {
      for (const [event, handler] of Object.entries(handlers)) {
        s.off(event, handler);
      }
    };
  }, [socket]);

  const reset = useCallback(() => {
    setPhase(null);
    setEntries(null);
    setEntryProgress({ p1Done: false, p2Done: false });
    setVetoLog([]);
    setPendingVeto(null);
    setSwirlProgress({ p1: null, p2: null });
    setElimData(null);
    setElimResults(null);
    setSavedEntry(null);
  }, []);

  return {
    phase, config, entries, entryProgress, vetoLog, vetosRemaining,
    pendingVeto, setPendingVeto, swirlProgress, elimData, elimResults,
    playersConnected, playerNames, savedEntry, reset,
  };
}
