import { useState, useEffect } from "react";
import { CAT_NAMES, CATEGORY_META } from "../shared/constants";
import { cardBase, btnSecondary, pill } from "../shared/styles";

export default function HistoryScreen({ onBack }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIdx, setExpandedIdx] = useState(null);

  useEffect(() => {
    fetch("/api/history")
      .then(r => r.json())
      .then(data => { setHistory(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u23F3"}</div>
        <p style={{ color: "#6b7280" }}>Loading history...</p>
      </div>
    );
  }

  const avgRating = history.length > 0
    ? (history.filter(h => h.rating).reduce((a, h) => a + h.rating, 0) / history.filter(h => h.rating).length).toFixed(1)
    : 0;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", animation: "fadeInUp 0.5s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <button onClick={onBack} style={{ ...btnSecondary, padding: "8px 20px", fontSize: 13 }}>
          {"\u2190"} Back
        </button>
        <h2 style={{ margin: 0, color: "#1f2937" }}>Date History</h2>
        <div />
      </div>

      {history.length === 0 ? (
        <div style={{ ...cardBase, textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{"\u{1F4D6}"}</div>
          <p style={{ color: "#6b7280" }}>No dates yet! Plan a date to start building your history.</p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 16, marginBottom: 20, justifyContent: "center" }}>
            <div style={{ ...cardBase, padding: "12px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#7c3aed" }}>{history.length}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>Total Dates</div>
            </div>
            <div style={{ ...cardBase, padding: "12px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#f59e0b" }}>{"\u2B50"} {avgRating}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>Avg Rating</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {history.map((entry, idx) => {
              const expanded = expandedIdx === idx;
              const dateStr = new Date(entry.date || entry.created_at).toLocaleDateString("en-US", {
                weekday: "short", month: "short", day: "numeric", year: "numeric",
              });
              const mood = entry.mood;

              return (
                <div key={entry.id || idx}
                  onClick={() => setExpandedIdx(expanded ? null : idx)}
                  style={{
                    ...cardBase, padding: 16, cursor: "pointer",
                    border: expanded ? "2px solid #a855f7" : "1px solid #f0f0f0",
                    transition: "all 0.2s",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#1f2937", fontSize: 15 }}>{dateStr}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                        {CAT_NAMES.map(cat => {
                          const c = entry.categories?.[cat];
                          if (!c) return null;
                          const meta = CATEGORY_META[cat];
                          return (
                            <span key={cat} style={pill(meta.color.bg, meta.color.text)}>
                              {meta.emoji} {c.chosen}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {mood && <div style={{ fontSize: 24 }}>{mood.emoji}</div>}
                      {entry.rating && (
                        <div style={{ fontSize: 12, color: "#f59e0b" }}>
                          {"\u2B50".repeat(entry.rating)}
                        </div>
                      )}
                    </div>
                  </div>

                  {expanded && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f0f0f0" }}>
                      {entry.players && (
                        <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 8px" }}>
                          {entry.players[0]} & {entry.players[1]}
                        </p>
                      )}
                      {entry.highlight && (
                        <p style={{ fontSize: 14, color: "#374151", margin: "0 0 4px" }}>
                          {"\u2728"} <strong>Highlight:</strong> {entry.highlight}
                        </p>
                      )}
                      {entry.notes && (
                        <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0", lineHeight: 1.5 }}>
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
