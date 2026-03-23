import { useState } from "react";
import { MOODS, CAT_NAMES, CATEGORY_META } from "../shared/constants";
import { cardBase, btnPrimary, btnSecondary, inputStyle } from "../shared/styles";

export default function RateDateScreen({ dateEntry, onSubmit, onSkip }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [highlight, setHighlight] = useState("");
  const [mood, setMood] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div style={{ maxWidth: 400, margin: "0 auto", animation: "fadeInUp 0.5s ease" }}>
        <div style={{ ...cardBase, textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{"\u2705"}</div>
          <h2 style={{ margin: "0 0 8px", color: "#1f2937" }}>Rating saved!</h2>
          <p style={{ color: "#9ca3af", fontSize: 13 }}>Thanks for rating your date night.</p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    onSubmit({
      rating,
      mood: mood !== null ? MOODS[mood] : null,
      highlight,
      notes,
    });
    setSubmitted(true);
  };

  const dateStr = dateEntry ? new Date(dateEntry.date || dateEntry.created_at).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  }) : "";

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", animation: "fadeInUp 0.4s ease" }}>
      <div style={{ ...cardBase }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1f2937" }}>How Was Your Date? {"\u{1F495}"}</h2>
        {dateStr && <p style={{ color: "#7c3aed", fontSize: 13, margin: "0 0 4px", fontWeight: 600 }}>{dateStr}</p>}
        <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 16px" }}>Rate it so you can look back on it later</p>

        {dateEntry?.categories && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
            {CAT_NAMES.map(cat => {
              const c = dateEntry.categories[cat];
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
        )}

        {/* Star rating */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Rating</label>
          <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  background: "none", border: "none", fontSize: 32, cursor: "pointer",
                  transition: "transform 0.15s", padding: 0,
                  transform: (hoverRating || rating) >= star ? "scale(1.15)" : "scale(1)",
                  filter: (hoverRating || rating) >= star ? "none" : "grayscale(1) opacity(0.3)",
                }}>
                {"\u2B50"}
              </button>
            ))}
          </div>
        </div>

        {/* Mood selector */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Vibe Check</label>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {MOODS.map((m, i) => (
              <button key={i} onClick={() => setMood(mood === i ? null : i)}
                style={{
                  padding: "6px 12px", borderRadius: 999,
                  border: mood === i ? "2px solid #a855f7" : "2px solid #e5e7eb",
                  background: mood === i ? "#f5f3ff" : "white",
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                  fontSize: 12, display: "flex", alignItems: "center", gap: 4,
                }}>
                <span style={{ fontSize: 16 }}>{m.emoji}</span>
                <span style={{ fontWeight: 600, color: mood === i ? "#7c3aed" : "#6b7280" }}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Highlight */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Best Moment {"\u2728"}</label>
          <input value={highlight} onChange={e => setHighlight(e.target.value)}
            placeholder="What was the highlight?"
            style={{ ...inputStyle, marginTop: 6 }} />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Anything to remember..."
            rows={3}
            style={{ ...inputStyle, marginTop: 6, resize: "vertical", minHeight: 60 }} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onSkip} style={{ ...btnSecondary, flex: 1, padding: "12px 0", fontSize: 14 }}>Back</button>
          <button onClick={handleSave} disabled={rating === 0}
            style={{ ...btnPrimary, flex: 2, padding: "12px 0", fontSize: 14, opacity: rating === 0 ? 0.5 : 1, cursor: rating === 0 ? "not-allowed" : "pointer" }}>
            Save Rating
          </button>
        </div>
      </div>
    </div>
  );
}
