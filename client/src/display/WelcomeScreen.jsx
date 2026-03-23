import { cardBase, btnPrimary } from "../shared/styles";

export default function WelcomeScreen({ connected, onCreateRoom, onViewHistory }) {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", animation: "fadeInUp 0.5s ease" }}>
      <div style={{ ...cardBase, textAlign: "center", padding: "clamp(28px, 4vw, 60px)" }}>
        <div style={{ fontSize: "clamp(64px, 6vw, 100px)", marginBottom: 8 }}>{"\u{1F495}"}</div>
        <h1 style={{ fontSize: "clamp(48px, 5vw, 80px)", fontWeight: 800, margin: 0, background: "linear-gradient(135deg,#a855f7,#ec4899,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>D.A.T.E.</h1>
        <p style={{ color: "#6b7280", fontSize: "clamp(16px, 1.4vw, 24px)", margin: "8px 0 4px" }}>Dinner {"\u00B7"} Activity {"\u00B7"} Treat {"\u00B7"} Entertainment</p>
        <p style={{ color: "#9ca3af", fontSize: "clamp(14px, 1.2vw, 20px)", margin: "0 0 clamp(28px, 3vw, 48px)", lineHeight: 1.6 }}>
          A cozy MASH-inspired way to plan your perfect date night.<br />Create a room, then join from your phones and pick together!
        </p>

        {!connected && (
          <div style={{ padding: "clamp(8px, 0.8vw, 14px) clamp(16px, 1.4vw, 28px)", borderRadius: 8, background: "#fef3c7", border: "1px solid #fbbf24", marginBottom: 16, fontSize: "clamp(13px, 1.1vw, 18px)", color: "#92400e" }}>
            Connecting to server...
          </div>
        )}

        <button
          onClick={onCreateRoom}
          disabled={!connected}
          style={{ ...btnPrimary, width: "100%", opacity: connected ? 1 : 0.5, fontSize: "clamp(16px, 1.4vw, 24px)", padding: "clamp(14px, 1.4vw, 24px) 36px" }}
        >
          Create Room
        </button>

        <div style={{ marginTop: "clamp(16px, 1.6vw, 28px)" }}>
          <button onClick={onViewHistory} style={{
            background: "none", border: "none", color: "#a855f7", fontWeight: 600,
            fontSize: "clamp(14px, 1.2vw, 20px)", cursor: "pointer", fontFamily: "inherit",
          }}>
            {"\u{1F4D6}"} View Date History
          </button>
        </div>
      </div>
    </div>
  );
}
