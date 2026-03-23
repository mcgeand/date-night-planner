import { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { cardBase } from "../shared/styles";

export default function WaitingRoom({ roomCode, playersConnected, playerNames }) {
  const joinUrl = useMemo(() => {
    const base = window.location.origin;
    return `${base}/join?code=${roomCode}`;
  }, [roomCode]);

  const bothJoined = playersConnected >= 2;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", animation: "fadeInUp 0.5s ease" }}>
      <div style={{ ...cardBase, textAlign: "center", padding: "clamp(20px, 2vw, 36px)" }}>
        <h2 style={{ margin: "0 0 6px", fontSize: "clamp(20px, 1.6vw, 28px)", color: "#1f2937" }}>Join the Fun!</h2>
        <p style={{ color: "#6b7280", fontSize: "clamp(13px, 0.9vw, 16px)", marginBottom: "clamp(16px, 1.4vw, 24px)" }}>Scan the QR code or enter the room code on your phone</p>

        {/* QR + Room Code side by side */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(24px, 3vw, 48px)", marginBottom: "clamp(16px, 1.4vw, 24px)" }}>
          <div style={{
            padding: "clamp(12px, 1.2vw, 20px)", background: "white",
            borderRadius: 16, border: "2px solid #e5e7eb", flexShrink: 0,
          }}>
            <QRCodeSVG value={joinUrl} size={Math.min(220, Math.max(140, window.innerWidth * 0.14))} level="M" />
          </div>

          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "clamp(11px, 0.8vw, 13px)", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Room Code</div>
            <div style={{
              fontSize: "clamp(36px, 3.2vw, 56px)", fontWeight: 800, letterSpacing: "0.08em", color: "#7c3aed",
              fontFamily: "monospace", lineHeight: 1,
            }}>
              {roomCode}
            </div>
            <p style={{ color: "#9ca3af", fontSize: "clamp(11px, 0.8vw, 14px)", margin: "8px 0 0" }}>
              Open <strong>{window.location.origin}/join</strong>
            </p>
          </div>
        </div>

        {/* Player status */}
        <div style={{ display: "flex", justifyContent: "center", gap: "clamp(12px, 1.4vw, 24px)", marginBottom: "clamp(12px, 1vw, 18px)" }}>
          {["p1", "p2"].map((slot, i) => {
            const name = playerNames[slot];
            const joined = !!name;
            return (
              <div key={slot} style={{
                padding: "clamp(12px, 1vw, 18px) clamp(20px, 2vw, 36px)",
                borderRadius: 14, minWidth: "clamp(120px, 10vw, 180px)",
                background: joined ? "#dcfce7" : "white",
                border: `2px solid ${joined ? "#22c55e" : "#e5e7eb"}`,
                transition: "all 0.3s",
              }}>
                <div style={{ fontSize: "clamp(22px, 1.8vw, 32px)", marginBottom: 2 }}>{joined ? "\u2705" : "\u23F3"}</div>
                <div style={{ fontWeight: 700, fontSize: "clamp(14px, 1vw, 18px)", color: joined ? "#166534" : "#6b7280" }}>
                  {name || `Partner ${i + 1}`}
                </div>
                <div style={{ fontSize: "clamp(11px, 0.7vw, 13px)", color: joined ? "#22c55e" : "#9ca3af" }}>
                  {joined ? "Connected!" : "Waiting..."}
                </div>
              </div>
            );
          })}
        </div>

        {bothJoined ? (
          <p style={{ color: "#22c55e", fontWeight: 600, fontSize: "clamp(13px, 0.9vw, 16px)", margin: "8px 0 0" }}>
            You're both connected! Start from your phone when ready.
          </p>
        ) : (
          <p style={{ color: "#9ca3af", fontSize: "clamp(12px, 0.8vw, 15px)", margin: "8px 0 0" }}>
            Waiting for you both to join...
          </p>
        )}
      </div>
    </div>
  );
}
