import { useState, useEffect } from "react";
import { CAT_NAMES, CATEGORY_META } from "../shared/constants";
import { cardBase, btnPrimary, btnSecondary } from "../shared/styles";
import JoinScreen from "./JoinScreen";
import LobbyScreen from "./LobbyScreen";
import WaitingScreen from "./WaitingScreen";
import PlayerEntryScreen from "./PlayerEntryScreen";
import VetoMobile from "./VetoMobile";
import SwirlScreen from "./SwirlScreen";

export default function MobileShell({ connected, emit, on, gameEvent, gameState }) {
  const { phase, config, entries, entryProgress, pendingVeto, setPendingVeto, swirlProgress, elimResults } = gameState;
  const [playerSlot, setPlayerSlot] = useState(null); // "p1" or "p2"
  const [hasSubmittedEntries, setHasSubmittedEntries] = useState(false);
  // Use a tab-specific key so two phone tabs in the same browser don't collide
  const [tabId] = useState(() => {
    let id = sessionStorage.getItem("date-tab-id");
    if (!id) { id = Math.random().toString(36).slice(2); sessionStorage.setItem("date-tab-id", id); }
    return id;
  });
  const [sessionToken, setSessionToken] = useState(() => sessionStorage.getItem(`date-session-${tabId}`));
  const [roomCode, setRoomCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("code") || "";
  });

  const playerIdx = playerSlot === "p1" ? 0 : 1;

  // Reset submission flag when we leave entry phase
  useEffect(() => {
    if (hasSubmittedEntries && phase !== "entry") {
      setHasSubmittedEntries(false);
    }
  }, [hasSubmittedEntries, phase]);

  const handleJoin = (code, name) => {
    emit("join-room", { roomCode: code, playerName: name, sessionToken }, (res) => {
      if (res.error) {
        alert(res.error);
        return;
      }
      setPlayerSlot(res.playerSlot);
      setSessionToken(res.sessionToken);
      sessionStorage.setItem(`date-session-${tabId}`, res.sessionToken);
      setRoomCode(code);
    });
  };

  // Not joined yet
  if (!playerSlot) {
    return <JoinScreen connected={connected} initialCode={roomCode} onJoin={handleJoin} />;
  }

  // Joined but game hasn't started — show lobby with setup + start
  if (!phase || phase === "lobby") {
    return <LobbyScreen
      playerSlot={playerSlot}
      playerIdx={playerIdx}
      playersConnected={gameState.playersConnected}
      playerNames={gameState.playerNames}
      roomCode={roomCode}
      onStart={(cfg) => gameEvent("start-game", { config: cfg })}
    />;
  }

  // Entry phase
  if (phase === "entry") {
    if (hasSubmittedEntries) {
      const otherName = config?.players[playerIdx === 0 ? 1 : 0] || "your partner";
      return <WaitingScreen
        message={`Waiting for ${otherName}...`}
        subtext="Your picks are locked in! Sit tight while they finish."
        emoji={"\u{1F44C}"}
      />;
    }
    return <PlayerEntryScreen
      playerIdx={playerIdx}
      config={config}
      onSubmit={(myEntries) => {
        gameEvent("submit-entries", { entries: myEntries });
        setHasSubmittedEntries(true);
      }}
    />;
  }

  // Veto phases
  if (phase === "veto-p1" || phase === "veto-p2") {
    const isMyTurn = (phase === "veto-p1" && playerSlot === "p1") || (phase === "veto-p2" && playerSlot === "p2");
    return <VetoMobile
      isMyTurn={isMyTurn}
      playerSlot={playerSlot}
      playerIdx={playerIdx}
      config={config}
      entries={entries}
      pendingVeto={pendingVeto}
      onVeto={(cat, itemIdx) => gameEvent("veto-action", { cat, itemIdx })}
      onReplacement={(cat, itemIdx, newText) => {
        gameEvent("veto-replacement", { cat, itemIdx, newText });
        setPendingVeto(null);
      }}
      onDone={() => gameEvent("veto-done")}
      vetosRemaining={gameState.vetosRemaining[playerSlot] ?? config?.vetosPerPerson ?? 0}
    />;
  }

  // Swirl phase
  if (phase === "swirl") {
    const myNumber = playerSlot === "p1" ? swirlProgress.p1 : swirlProgress.p2;
    const done = myNumber !== null;
    return <SwirlScreen
      playerIdx={playerIdx}
      config={config}
      done={done}
      myNumber={myNumber}
      swirlProgress={swirlProgress}
      onStop={(number) => gameEvent("submit-swirl", { number })}
    />;
  }

  // Eliminating — watch on display, phone gets the "reveal" button
  if (phase === "eliminating") {
    return <EliminatingScreen
      onReveal={() => gameEvent("elimination-done")}
    />;
  }

  // Results — date is saved, go enjoy it!
  if (phase === "results" || phase === "done") {
    return <DateReadyScreen
      config={config}
      elimResults={elimResults}
      onPlayAgain={() => gameEvent("play-again")}
      onFreshStart={() => gameEvent("fresh-start")}
    />;
  }

  return <WaitingScreen message={`Phase: ${phase}`} subtext="Waiting..." />;
}

function EliminatingScreen({ onReveal }) {
  return (
    <div style={{ maxWidth: 400, margin: "0 auto", animation: "fadeInUp 0.5s ease" }}>
      <div style={{ background: "white", borderRadius: 20, padding: 32, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>{"\u{1F525}"}</div>
        <h2 style={{ margin: "0 0 8px", fontSize: 20, color: "#1f2937" }}>Elimination in progress!</h2>
        <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 24 }}>Watch the display for the dramatic countdown...</p>
        <button onClick={onReveal} style={{
          padding: "16px 36px", borderRadius: 14, border: "none",
          background: "linear-gradient(135deg, #a855f7, #ec4899)", color: "white",
          fontWeight: 700, fontSize: 16, cursor: "pointer", width: "100%",
          boxShadow: "0 4px 20px rgba(168,85,247,0.3)", fontFamily: "inherit",
        }}>
          See Your Date Night! {"\u{1F495}"}
        </button>
      </div>
    </div>
  );
}

function DateReadyScreen({ config, elimResults, onPlayAgain, onFreshStart }) {
  const categories = {};
  if (elimResults) {
    for (const cat of CAT_NAMES) {
      const r = elimResults[cat];
      if (r && r.chosen !== null) {
        categories[cat] = { chosen: r.chosenText || r.items[r.chosen], pickedBy: config?.players[r.chosenBy] };
      }
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", animation: "fadeInUp 0.5s ease" }}>
      <div style={{ ...cardBase, textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>{"\u{1F389}"}</div>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, color: "#581c87" }}>Date Night Planned!</h2>
        <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 20 }}>
          Your plan is saved. Now go enjoy your date!<br />
          Come back later to rate it.
        </p>

        {Object.keys(categories).length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
            {CAT_NAMES.map(name => {
              const cat = categories[name];
              if (!cat) return null;
              const meta = CATEGORY_META[name];
              return (
                <div key={name} style={{
                  padding: "10px", borderRadius: 12,
                  background: meta.color.bg + "80", border: `1px solid ${meta.color.border}40`,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 20 }}>{meta.emoji}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: meta.color.accent, textTransform: "uppercase", letterSpacing: "0.05em" }}>{name}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: meta.color.text, marginTop: 2 }}>{cat.chosen}</div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onPlayAgain} style={{ ...btnSecondary, flex: 1, padding: "12px 0", fontSize: 14 }}>
            {"\u{1F504}"} Spin Again
          </button>
          <button onClick={onFreshStart} style={{ ...btnPrimary, flex: 1, padding: "12px 0", fontSize: 14 }}>
            {"\u2728"} New Round
          </button>
        </div>
      </div>
    </div>
  );
}
