import { CAT_NAMES, CATEGORY_META } from "./constants";

export default function DateSummaryCard({ players, categories, date }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #fef3c7, #fce7f3, #e0e7ff)",
      borderRadius: 24, padding: "clamp(24px, 2.2vw, 40px)",
      boxShadow: "0 8px 40px rgba(168,85,247,0.15)",
      border: "2px solid rgba(168,85,247,0.2)", textAlign: "center",
    }}>
      <div style={{ fontSize: "clamp(40px, 3.2vw, 60px)", marginBottom: 4 }}>{"\u{1F495}"}</div>
      <h2 style={{ margin: "0 0 2px", fontSize: "clamp(22px, 1.8vw, 32px)", color: "#581c87" }}>{players[0]} & {players[1]}'s</h2>
      <h3 style={{ margin: "0 0 clamp(16px, 1.4vw, 24px)", fontSize: "clamp(17px, 1.4vw, 24px)", color: "#7c3aed", fontWeight: 600 }}>Perfect Date Night</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(10px, 1vw, 18px)" }}>
        {CAT_NAMES.map(name => {
          const cat = categories[name];
          if (!cat) return null;
          const meta = CATEGORY_META[name];
          return (
            <div key={name} style={{
              background: "rgba(255,255,255,0.9)", borderRadius: 16,
              padding: "clamp(12px, 1.2vw, 22px)", textAlign: "center",
              border: `2px solid ${meta.color.accent}40`,
              boxShadow: `0 2px 12px ${meta.color.glow}`,
            }}>
              <div style={{ fontSize: "clamp(24px, 2vw, 38px)", marginBottom: 4 }}>{meta.emoji}</div>
              <div style={{ fontSize: "clamp(10px, 0.7vw, 12px)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: meta.color.accent, marginBottom: 4 }}>{name}</div>
              <div style={{ fontSize: "clamp(14px, 1.2vw, 20px)", fontWeight: 700, color: meta.color.text }}>{cat.chosen || cat.chosenText}</div>
              <div style={{ fontSize: "clamp(10px, 0.7vw, 13px)", color: "#9ca3af", marginTop: 2 }}>picked by {cat.pickedBy || players[cat.chosenBy] || "?"}</div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "clamp(14px, 1.2vw, 22px)", padding: "clamp(8px, 0.8vw, 14px) clamp(14px, 1.2vw, 22px)", borderRadius: 12, background: "rgba(255,255,255,0.6)", border: "1px solid rgba(168,85,247,0.1)" }}>
        <p style={{ margin: 0, fontSize: "clamp(12px, 0.9vw, 16px)", color: "#6b7280", lineHeight: 1.6 }}>
          {"\u{1F5D3}\uFE0F"} {new Date(date || Date.now()).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}
