import { useState } from "react";
import { cardBase, btnPrimary } from "../shared/styles";

export default function LobbyScreen({ playerSlot, playerIdx, playersConnected, playerNames, roomCode, onStart }) {
  const [config, setConfig] = useState({
    optionsPerPerson: 2,
    vetosPerPerson: 2,
  });

  const bothJoined = playersConnected >= 2;
  const otherSlot = playerSlot === "p1" ? "p2" : "p1";
  const otherName = playerNames[otherSlot];
  const myName = playerNames[playerSlot];

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", animation: "fadeInUp 0.5s ease" }}>
      <div style={{ ...cardBase, textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 36, marginBottom: 4 }}>{"\u{1F389}"}</div>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1f2937" }}>You're in!</h2>
        <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>Room: <strong style={{ color: "#7c3aed", fontFamily: "monospace" }}>{roomCode}</strong></p>

        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16 }}>
          <div style={{
            padding: "12px 20px", borderRadius: 12,
            background: "#dcfce7", border: "2px solid #22c55e",
          }}>
            <div style={{ fontSize: 20 }}>{"\u2705"}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#166534" }}>{myName || "You"}</div>
          </div>
          <div style={{
            padding: "12px 20px", borderRadius: 12,
            background: otherName ? "#dcfce7" : "white",
            border: `2px solid ${otherName ? "#22c55e" : "#e5e7eb"}`,
          }}>
            <div style={{ fontSize: 20 }}>{otherName ? "\u2705" : "\u23F3"}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: otherName ? "#166534" : "#6b7280" }}>
              {otherName || "Waiting..."}
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...cardBase, marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 18, color: "#1f2937" }}>Date Setup</h3>
        <p style={{ color: "#9ca3af", fontSize: 12, margin: "0 0 16px" }}>Either of you can configure and start</p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
            Options per person per category
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {[2, 3, 4].map(n => (
              <button key={n} onClick={() => setConfig(c => ({ ...c, optionsPerPerson: n }))}
                style={{
                  flex: 1, padding: "10px", borderRadius: 10, border: "2px solid",
                  borderColor: config.optionsPerPerson === n ? "#a855f7" : "#e5e7eb",
                  background: config.optionsPerPerson === n ? "#f5f3ff" : "white",
                  color: config.optionsPerPerson === n ? "#7c3aed" : "#6b7280",
                  fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "inherit",
                }}>{n}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
            Vetos per person
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {[0, 1, 2, 3].map(n => (
              <button key={n} onClick={() => setConfig(c => ({ ...c, vetosPerPerson: n }))}
                style={{
                  flex: 1, padding: "10px", borderRadius: 10, border: "2px solid",
                  borderColor: config.vetosPerPerson === n ? "#a855f7" : "#e5e7eb",
                  background: config.vetosPerPerson === n ? "#f5f3ff" : "white",
                  color: config.vetosPerPerson === n ? "#7c3aed" : "#6b7280",
                  fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "inherit",
                }}>{n}</button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onStart(config)}
          disabled={!bothJoined}
          style={{
            ...btnPrimary,
            width: "100%",
            opacity: bothJoined ? 1 : 0.4,
            cursor: bothJoined ? "pointer" : "not-allowed",
          }}
        >
          {bothJoined ? "Let's Go!" : "Waiting for partner to join..."}
        </button>
      </div>
    </div>
  );
}
