import { useState } from "react";
import { CAT_NAMES, CATEGORY_META, SUGGESTIONS } from "../shared/constants";
import { cardBase, btnPrimary, inputStyle } from "../shared/styles";

export default function PlayerEntryScreen({ playerIdx, config, onSubmit }) {
  const name = config.players[playerIdx];
  const accentColor = playerIdx === 0 ? "#a855f7" : "#ec4899";

  const [entries, setEntries] = useState(() => {
    const e = {};
    CAT_NAMES.forEach(cat => { e[cat] = Array(config.optionsPerPerson).fill(""); });
    return e;
  });

  const updateEntry = (cat, idx, val) => {
    setEntries(prev => {
      const next = { ...prev };
      next[cat] = [...next[cat]];
      next[cat][idx] = val;
      return next;
    });
  };

  const allFilled = CAT_NAMES.every(cat =>
    entries[cat].every(v => v.trim())
  );

  const fillRandom = (cat, idx) => {
    const used = new Set();
    CAT_NAMES.forEach(c => entries[c].forEach(v => used.add(v.toLowerCase())));
    const available = SUGGESTIONS[cat].filter(s => !used.has(s.toLowerCase()));
    if (available.length > 0) updateEntry(cat, idx, available[Math.floor(Math.random() * available.length)]);
  };

  const handleSubmit = () => {
    if (!allFilled) return;
    onSubmit(entries);
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", animation: "fadeInUp 0.4s ease" }}>
      <div style={{ ...cardBase }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
            background: `linear-gradient(135deg, ${accentColor}, ${playerIdx === 0 ? "#7c3aed" : "#db2777"})`,
            color: "white", fontSize: 20, fontWeight: 800,
          }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, color: "#1f2937" }}>{name}'s Picks</h2>
            <p style={{ margin: 0, color: "#9ca3af", fontSize: 13 }}>Add {config.optionsPerPerson} options per category</p>
          </div>
        </div>

        {CAT_NAMES.map(cat => {
          const meta = CATEGORY_META[cat];
          return (
            <div key={cat} style={{ marginBottom: 16, padding: 14, borderRadius: 14, background: meta.color.bg + "80", border: `1px solid ${meta.color.border}40` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>{meta.emoji}</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: meta.color.text }}>{cat}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Array.from({ length: config.optionsPerPerson }, (_, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 6 }}>
                    <input
                      value={entries[cat][idx]}
                      onChange={e => updateEntry(cat, idx, e.target.value)}
                      placeholder={`Option ${idx + 1}...`}
                      style={{ ...inputStyle, padding: "8px 12px", fontSize: 14, borderColor: `${meta.color.border}60` }}
                    />
                    <button onClick={() => fillRandom(cat, idx)} title="Random suggestion"
                      style={{ padding: "8px 10px", borderRadius: 10, border: `1px solid ${meta.color.border}60`, background: "white", cursor: "pointer", fontSize: 14 }}>
                      {"\u{1F3B2}"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <button
          onClick={handleSubmit}
          disabled={!allFilled}
          style={{ ...btnPrimary, width: "100%", opacity: allFilled ? 1 : 0.5, cursor: allFilled ? "pointer" : "not-allowed" }}
        >
          Submit Picks {"\u2192"}
        </button>
      </div>
    </div>
  );
}
