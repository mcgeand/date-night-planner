import { useState } from "react";
import { CAT_NAMES, CATEGORY_META, PLAYER_COLORS } from "../shared/constants";
import { cardBase, btnPrimary, btnSecondary, inputStyle } from "../shared/styles";

export default function VetoMobile({ isMyTurn, playerSlot, playerIdx, config, entries, pendingVeto, onVeto, onReplacement, onDone, vetosRemaining }) {
  const [replaceText, setReplaceText] = useState("");

  // If we need to provide a replacement (partner vetoed one of our items)
  if (pendingVeto?.needsReplacement) {
    return (
      <div style={{ maxWidth: 400, margin: "0 auto", animation: "fadeInUp 0.3s ease" }}>
        <div style={{ ...cardBase, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>{"\u{274C}"}</div>
          <h3 style={{ margin: "0 0 8px", color: "#1f2937" }}>Your option was vetoed!</h3>
          <p style={{ color: "#6b7280", marginBottom: 4 }}>
            <strong>"{pendingVeto.vetoedText}"</strong> in <strong>{pendingVeto.cat}</strong>
          </p>
          <p style={{ color: "#9ca3af", fontSize: 13, marginBottom: 16 }}>Enter a replacement:</p>

          <input
            value={replaceText}
            onChange={e => setReplaceText(e.target.value)}
            placeholder="Type replacement..."
            style={{ ...inputStyle, marginBottom: 12 }}
            autoFocus
          />
          <button
            onClick={() => {
              if (replaceText.trim()) {
                onReplacement(pendingVeto.cat, pendingVeto.itemIdx, replaceText.trim());
                setReplaceText("");
              }
            }}
            disabled={!replaceText.trim()}
            style={{ ...btnPrimary, width: "100%", opacity: replaceText.trim() ? 1 : 0.5 }}
          >
            Submit Replacement
          </button>
        </div>
      </div>
    );
  }

  // Not my turn — wait
  if (!isMyTurn) {
    return (
      <div style={{ maxWidth: 400, margin: "0 auto", animation: "fadeInUp 0.5s ease" }}>
        <div style={{ ...cardBase, textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: "pulse 2s ease-in-out infinite" }}>{"\u23F3"}</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 20, color: "#1f2937" }}>
            {config.players[playerIdx === 0 ? 1 : 0]}'s turn to veto
          </h2>
          <p style={{ color: "#9ca3af", fontSize: 13 }}>Watch the display — your turn is next!</p>
        </div>
      </div>
    );
  }

  // My turn — show partner's entries to veto
  const partnerIdx = playerIdx === 0 ? 1 : 0;

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", animation: "fadeInUp 0.4s ease" }}>
      <div style={{ ...cardBase }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{
            display: "inline-block", padding: "6px 18px", borderRadius: 999,
            background: PLAYER_COLORS[playerIdx], color: "white", fontWeight: 700, fontSize: 13,
          }}>
            Your turn! {vetosRemaining} veto{vetosRemaining !== 1 ? "s" : ""} remaining
          </div>
        </div>

        <p style={{ color: "#6b7280", fontSize: 13, textAlign: "center", marginBottom: 16 }}>
          Tap one of {config.players[partnerIdx]}'s options to veto it
        </p>

        {CAT_NAMES.map(cat => {
          const meta = CATEGORY_META[cat];
          const partnerEntries = entries?.[cat]?.[partnerIdx] || [];
          const myEntries = entries?.[cat]?.[playerIdx] || [];
          // Flat index: partner entries start after my entries in the flat list
          const flatOffset = myEntries.length;

          return (
            <div key={cat} style={{ marginBottom: 12, padding: 12, borderRadius: 14, background: meta.color.bg + "60", border: `1px solid ${meta.color.border}40` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>{meta.emoji}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: meta.color.text }}>{cat}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {partnerEntries.map((text, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (vetosRemaining > 0) onVeto(cat, flatOffset + i);
                    }}
                    disabled={vetosRemaining <= 0}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "10px 14px", borderRadius: 10,
                      border: "2px solid #e5e7eb", background: "white",
                      cursor: vetosRemaining > 0 ? "pointer" : "not-allowed",
                      textAlign: "left", fontFamily: "inherit", fontSize: 14,
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: 999,
                      background: PLAYER_COLORS[partnerIdx], color: "white",
                      fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {config.players[partnerIdx]?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ flex: 1 }}>{text}</span>
                    {vetosRemaining > 0 && <span style={{ fontSize: 12, color: "#ef4444" }}>{"\u{274C}"}</span>}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        <button onClick={onDone} style={{ ...btnSecondary, width: "100%", marginTop: 8 }}>
          {vetosRemaining <= 0 ? "Continue \u2192" : "Skip Remaining Vetos \u2192"}
        </button>
      </div>
    </div>
  );
}
