import { useState } from "react";
import StepIndicator from "../shared/StepIndicator";
import WelcomeScreen from "./WelcomeScreen";
import WaitingRoom from "./WaitingRoom";
import VetoDisplay from "./VetoDisplay";
import DualSwirlDisplay from "./DualSwirlDisplay";
import EliminationScreen from "./EliminationScreen";
import ResultScreen from "./ResultScreen";
import HistoryScreen from "./HistoryScreen";

const stepLabels = ["Entry", "Veto", "Swirl", "Eliminate", "Results"];
const stepMap = { entry: 0, "veto-p1": 1, "veto-p2": 1, swirl: 2, eliminating: 3, results: 4 };

export default function DisplayShell({ connected, emit, on, gameEvent, gameState }) {
  const { phase, config, entries, entryProgress, vetoLog, vetosRemaining, pendingVeto, swirlProgress, elimData, elimResults } = gameState;
  const [roomCode, setRoomCode] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  if (showHistory) {
    return <HistoryScreen onBack={() => setShowHistory(false)} />;
  }

  // Pre-game: welcome + room creation
  if (!phase || phase === "lobby") {
    if (!roomCode) {
      return <WelcomeScreen
        connected={connected}
        onCreateRoom={() => {
          emit("create-room", {}, (res) => {
            setRoomCode(res.roomCode);
          });
        }}
        onViewHistory={() => setShowHistory(true)}
      />;
    }
    return <WaitingRoom
      roomCode={roomCode}
      playersConnected={gameState.playersConnected}
      playerNames={gameState.playerNames}
    />;
  }

  const currentStep = stepMap[phase] ?? -1;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
      <div style={{ textAlign: "center", marginBottom: "clamp(8px, 0.6vw, 14px)" }}>
        <h1 style={{ fontSize: "clamp(24px, 2vw, 36px)", fontWeight: 800, margin: 0, background: "linear-gradient(135deg,#a855f7,#ec4899,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>D.A.T.E.</h1>
        {config && <p style={{ margin: "2px 0 clamp(10px, 0.8vw, 16px)", color: "#9ca3af", fontSize: "clamp(12px, 0.8vw, 15px)" }}>{config.players[0]} & {config.players[1]}'s Date Night</p>}
      </div>

      {phase !== "results" && phase !== "done" && currentStep >= 0 && (
        <StepIndicator steps={stepLabels} current={currentStep} />
      )}

      {phase === "entry" && (
        <EntryWaiting entryProgress={entryProgress} config={config} />
      )}

      {(phase === "veto-p1" || phase === "veto-p2") && (
        <VetoDisplay
          phase={phase}
          config={config}
          entries={entries}
          vetoLog={vetoLog}
          vetosRemaining={vetosRemaining}
          pendingVeto={pendingVeto}
        />
      )}

      {phase === "swirl" && (
        <DualSwirlDisplay config={config} swirlProgress={swirlProgress} />
      )}

      {phase === "eliminating" && elimData && (
        <EliminationScreen
          config={config}
          entries={elimData.entries}
          elimNumber={elimData.elimNumber}
          elimResults={elimResults}
          onFinish={() => gameEvent("elimination-done")}
        />
      )}

      {phase === "results" && elimResults && (
        <ResultScreen config={config} elimResults={elimResults} />
      )}

      {phase === "done" && (
        <div style={{ textAlign: "center", padding: 40, animation: "fadeInUp 0.5s ease" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{"\u2705"}</div>
          <h2 style={{ color: "#581c87" }}>Date Saved!</h2>
          <p style={{ color: "#6b7280" }}>Check the history for all your date nights.</p>
          <button onClick={() => setShowHistory(true)} style={{
            padding: "14px 36px", borderRadius: 14, border: "none",
            background: "linear-gradient(135deg, #a855f7, #ec4899)", color: "white",
            fontWeight: 700, fontSize: 16, cursor: "pointer", marginTop: 16,
          }}>View History</button>
        </div>
      )}
    </div>
  );
}

function EntryWaiting({ entryProgress, config }) {
  return (
    <div style={{ textAlign: "center", padding: "clamp(32px, 4vw, 64px)", animation: "fadeInUp 0.5s ease" }}>
      <div style={{ fontSize: "clamp(56px, 5vw, 88px)", marginBottom: "clamp(12px, 1.4vw, 24px)" }}>{"\u{1F4DD}"}</div>
      <h2 style={{ color: "#1f2937", margin: "0 0 8px", fontSize: "clamp(20px, 2vw, 36px)" }}>Waiting for entries...</h2>
      <p style={{ color: "#6b7280", marginBottom: "clamp(20px, 2vw, 36px)", fontSize: "clamp(14px, 1.2vw, 22px)" }}>Entering date ideas on your phones</p>

      <div style={{ display: "flex", justifyContent: "center", gap: "clamp(20px, 2.4vw, 40px)" }}>
        {[0, 1].map(i => {
          const done = i === 0 ? entryProgress.p1Done : entryProgress.p2Done;
          const name = config?.players[i] || `Partner ${i + 1}`;
          return (
            <div key={i} style={{
              padding: "clamp(16px, 1.6vw, 28px) clamp(28px, 2.8vw, 48px)", borderRadius: 16,
              background: done ? "#dcfce7" : "white",
              border: `2px solid ${done ? "#22c55e" : "#e5e7eb"}`,
              transition: "all 0.3s",
            }}>
              <div style={{ fontSize: "clamp(24px, 2.4vw, 40px)", marginBottom: 4 }}>{done ? "\u2705" : "\u23F3"}</div>
              <div style={{ fontWeight: 700, color: done ? "#166534" : "#6b7280", fontSize: "clamp(14px, 1.4vw, 24px)" }}>{name}</div>
              <div style={{ fontSize: "clamp(12px, 1vw, 18px)", color: done ? "#22c55e" : "#9ca3af" }}>{done ? "Done!" : "Entering..."}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
