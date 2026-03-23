import { useState, useEffect } from "react";
import { CAT_NAMES, CATEGORY_META } from "../shared/constants";
import { cardBase, btnPrimary, btnSecondary, inputStyle } from "../shared/styles";
import RateDateScreen from "./RateDateScreen";

export default function JoinScreen({ connected, initialCode, onJoin }) {
  const [code, setCode] = useState(initialCode || "");
  const [name, setName] = useState("");
  const [unratedDate, setUnratedDate] = useState(null);
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    fetch("/api/unrated")
      .then(r => r.json())
      .then(data => { if (data) setUnratedDate(data); })
      .catch(() => {});
  }, []);

  const canJoin = connected && code.trim().length >= 4 && name.trim().length > 0;

  if (showRating && unratedDate) {
    return <RateDateScreen
      dateEntry={unratedDate}
      onSubmit={(data) => {
        fetch(`/api/history/${unratedDate.id}/rate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).then(() => {
          setUnratedDate(null);
          setShowRating(false);
        });
      }}
      onSkip={() => setShowRating(false)}
    />;
  }

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", animation: "fadeInUp 0.5s ease" }}>
      {unratedDate && (
        <div style={{ ...cardBase, marginBottom: 16, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 4 }}>{"\u{1F4DD}"}</div>
          <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#1f2937" }}>How was your last date?</h3>
          <p style={{ color: "#9ca3af", fontSize: 12, margin: "0 0 12px" }}>
            {new Date(unratedDate.date || unratedDate.created_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
            {CAT_NAMES.map(cat => {
              const c = unratedDate.categories?.[cat];
              if (!c) return null;
              const meta = CATEGORY_META[cat];
              return (
                <div key={cat} style={{
                  padding: "6px 8px", borderRadius: 8,
                  background: meta.color.bg + "80", fontSize: 11,
                  textAlign: "center",
                }}>
                  <span>{meta.emoji} </span>
                  <strong style={{ color: meta.color.text }}>{c.chosen}</strong>
                </div>
              );
            })}
          </div>

          <button onClick={() => setShowRating(true)} style={{ ...btnPrimary, width: "100%", padding: "10px", fontSize: 14 }}>
            Rate This Date {"\u2B50"}
          </button>
        </div>
      )}

      <div style={{ ...cardBase, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{"\u{1F4F1}"}</div>
        <h2 style={{ margin: "0 0 4px", fontSize: 24, color: "#1f2937" }}>Join Date Night</h2>
        <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 24px" }}>Enter the room code shown on the display</p>

        {!connected && (
          <div style={{ padding: "8px 16px", borderRadius: 8, background: "#fef3c7", border: "1px solid #fbbf24", marginBottom: 16, fontSize: 13, color: "#92400e" }}>
            Connecting to server...
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "left" }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Room Code</label>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="DATE-1234"
              style={{ ...inputStyle, fontSize: 20, fontWeight: 700, textAlign: "center", letterSpacing: "0.1em", fontFamily: "monospace" }}
              autoFocus
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Your Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              style={inputStyle}
            />
          </div>

          <button
            onClick={() => onJoin(code.trim(), name.trim())}
            disabled={!canJoin}
            style={{ ...btnPrimary, width: "100%", opacity: canJoin ? 1 : 0.5, cursor: canJoin ? "pointer" : "not-allowed" }}
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
