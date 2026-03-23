import { cardBase } from "../shared/styles";

export default function WaitingScreen({ message, subtext, emoji }) {
  return (
    <div style={{ maxWidth: 400, margin: "0 auto", animation: "fadeInUp 0.5s ease" }}>
      <div style={{ ...cardBase, textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 56, marginBottom: 16, animation: "pulse 2s ease-in-out infinite" }}>
          {emoji || "\u23F3"}
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 20, color: "#1f2937" }}>{message}</h2>
        {subtext && <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>{subtext}</p>}
      </div>
    </div>
  );
}
