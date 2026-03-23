import { CAT_NAMES, CATEGORY_META, PLAYER_COLORS } from "../shared/constants";
import { cardBase, pill } from "../shared/styles";

export default function VetoDisplay({ phase, config, entries, vetoLog, vetosRemaining, pendingVeto }) {
  const activePlayer = phase === "veto-p1" ? 0 : 1;
  const activeName = config.players[activePlayer];

  return (
    <div style={{ animation: "fadeInUp 0.5s ease", display: "flex", flexDirection: "column", height: "calc(100vh - 140px)" }}>
      <div style={{ textAlign: "center", marginBottom: "clamp(8px, 0.8vw, 14px)" }}>
        <div style={{
          display: "inline-block", padding: "clamp(8px, 0.8vw, 14px) clamp(24px, 2.4vw, 40px)", borderRadius: 999,
          background: PLAYER_COLORS[activePlayer], color: "white", fontWeight: 700,
          fontSize: "clamp(14px, 1.3vw, 22px)",
        }}>
          {activeName}'s turn to veto ({vetosRemaining[phase === "veto-p1" ? "p1" : "p2"]} remaining)
        </div>
      </div>

      {pendingVeto && (
        <div style={{
          ...cardBase, marginBottom: "clamp(12px, 1.2vw, 20px)", textAlign: "center",
          border: "2px solid #f59e0b", background: "#fffbeb",
          padding: "clamp(16px, 1.6vw, 28px)",
        }}>
          <p style={{ margin: 0, fontSize: "clamp(14px, 1.2vw, 22px)", color: "#92400e" }}>
            {"\u{274C}"} <strong>{activeName}</strong> is vetoing "<strong>{pendingVeto.vetoedText}</strong>" in {pendingVeto.cat}...
            <br /><span style={{ fontSize: "clamp(12px, 1vw, 18px)", color: "#b45309" }}>Waiting for replacement from {config.players[activePlayer === 0 ? 1 : 0]}</span>
          </p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "clamp(8px, 1vw, 16px)", flex: 1, minHeight: 0 }}>
        {CAT_NAMES.map(cat => {
          const meta = CATEGORY_META[cat];
          const p0 = entries?.[cat]?.[0] || [];
          const p1 = entries?.[cat]?.[1] || [];
          const allItems = [...p0.map((t, i) => ({ text: t, owner: 0, idx: i })), ...p1.map((t, i) => ({ text: t, owner: 1, idx: i + p0.length }))];

          return (
            <div key={cat} style={{
              ...cardBase, padding: "clamp(10px, 1vw, 18px)",
              border: `2px solid ${meta.color.border}40`,
              background: meta.color.bg + "40",
              overflow: "auto", minHeight: 0,
              display: "flex", flexDirection: "column",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "clamp(6px, 0.6vw, 10px)", marginBottom: "clamp(4px, 0.5vw, 8px)" }}>
                <span style={{ fontSize: "clamp(20px, 1.8vw, 32px)" }}>{meta.emoji}</span>
                <span style={{ fontWeight: 700, color: meta.color.text, fontSize: "clamp(14px, 1.3vw, 22px)" }}>{cat}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "clamp(3px, 0.4vw, 6px)", flex: 1, minHeight: 0 }}>
                {allItems.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "clamp(6px, 0.6vw, 10px)",
                    padding: "clamp(4px, 0.5vw, 10px) clamp(8px, 0.8vw, 14px)",
                    borderRadius: 10, background: "white",
                    border: "1px solid #f0f0f0",
                  }}>
                    <div style={{
                      width: "clamp(22px, 2vw, 34px)", height: "clamp(22px, 2vw, 34px)", borderRadius: 999,
                      background: PLAYER_COLORS[item.owner],
                      color: "white", fontSize: "clamp(10px, 0.9vw, 15px)", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {config.players[item.owner]?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontSize: "clamp(14px, 1.2vw, 22px)", color: "#374151" }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {vetoLog.length > 0 && (
        <div style={{ ...cardBase, marginTop: "clamp(6px, 0.6vw, 12px)", padding: "clamp(8px, 0.8vw, 14px)", flexShrink: 0, maxHeight: "15vh", overflow: "auto" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: "clamp(14px, 1.2vw, 20px)", color: "#6b7280" }}>Veto Log</h3>
          {vetoLog.map((v, i) => (
            <div key={i} style={{ fontSize: "clamp(13px, 1.1vw, 20px)", color: "#374151", padding: "4px 0", borderBottom: "1px solid #f0f0f0" }}>
              <span style={pill(PLAYER_COLORS[v.vetoedBy === "p1" ? 0 : 1] + "20", PLAYER_COLORS[v.vetoedBy === "p1" ? 0 : 1])}>
                {config.players[v.vetoedBy === "p1" ? 0 : 1]}
              </span>
              {" vetoed "}<s>{v.oldText}</s>{" \u2192 "}<strong>{v.newText}</strong>{" in "}{v.cat}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
