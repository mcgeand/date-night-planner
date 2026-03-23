import { PLAYER_COLORS } from "../shared/constants";
import { cardBase, btnPrimary } from "../shared/styles";

export default function DualSwirlDisplay({ config, swirlProgress }) {
  const p1Done = swirlProgress.p1 !== null;
  const p2Done = swirlProgress.p2 !== null;
  const bothDone = p1Done && p2Done;
  const magicNumber = bothDone ? swirlProgress.p1 + swirlProgress.p2 : null;

  return (
    <div style={{ textAlign: "center", animation: "fadeInUp 0.5s ease" }}>
      <h2 style={{ color: "#1f2937", margin: "0 0 8px", fontSize: "clamp(20px, 2vw, 36px)" }}>The Swirl</h2>
      <p style={{ color: "#6b7280", marginBottom: "clamp(24px, 2.4vw, 40px)", fontSize: "clamp(14px, 1.2vw, 22px)" }}>Drawing magic spirals on your phones...</p>

      <div style={{ display: "flex", justifyContent: "center", gap: "clamp(24px, 4vw, 60px)", marginBottom: "clamp(24px, 3vw, 48px)" }}>
        {[0, 1].map(i => {
          const done = i === 0 ? p1Done : p2Done;
          const number = i === 0 ? swirlProgress.p1 : swirlProgress.p2;
          const name = config?.players[i] || `Partner ${i + 1}`;
          return (
            <div key={i} style={{ ...cardBase, padding: "clamp(20px, 2.4vw, 40px)", minWidth: "clamp(160px, 16vw, 280px)", textAlign: "center" }}>
              <div style={{
                width: "clamp(100px, 10vw, 180px)", height: "clamp(100px, 10vw, 180px)",
                borderRadius: 999, margin: "0 auto clamp(12px, 1.2vw, 20px)",
                background: done ? PLAYER_COLORS[i] : "#f3f4f6",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: done ? "clamp(36px, 3.6vw, 64px)" : "clamp(24px, 2.4vw, 40px)",
                fontWeight: 800, color: done ? "white" : "#9ca3af",
                transition: "all 0.5s",
                boxShadow: done ? `0 4px 20px ${PLAYER_COLORS[i]}40` : "none",
              }}>
                {done ? number : "\u{1F300}"}
              </div>
              <div style={{ fontWeight: 700, color: PLAYER_COLORS[i], fontSize: "clamp(16px, 1.4vw, 26px)" }}>{name}</div>
              <div style={{ fontSize: "clamp(12px, 1vw, 18px)", color: done ? "#22c55e" : "#9ca3af", marginTop: 4 }}>
                {done ? `Swirled ${number}!` : "Drawing..."}
              </div>
            </div>
          );
        })}
      </div>

      {bothDone && (
        <div style={{ animation: "fadeInUp 0.3s ease" }}>
          <div style={{
            ...cardBase, display: "inline-block",
            padding: "clamp(20px, 2vw, 36px) clamp(40px, 4vw, 72px)",
            background: "linear-gradient(135deg, #fef3c7, #fce7f3)",
            border: "2px solid #a855f7",
          }}>
            <div style={{ fontSize: "clamp(14px, 1.2vw, 22px)", color: "#6b7280", marginBottom: 4 }}>Magic Number</div>
            <div style={{ fontSize: "clamp(48px, 4.5vw, 80px)", fontWeight: 800, color: "#7c3aed" }}>
              {swirlProgress.p1} + {swirlProgress.p2} = {magicNumber}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
