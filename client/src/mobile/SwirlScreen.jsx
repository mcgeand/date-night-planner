import { useState, useRef, useCallback, useEffect } from "react";
import { PLAYER_COLORS } from "../shared/constants";
import { cardBase, btnPrimary } from "../shared/styles";

export default function SwirlScreen({ playerIdx, config, done, myNumber, swirlProgress, onStop }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const revolutionsRef = useRef(0);
  const angleRef = useRef(0);
  const radiusRef = useRef(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const size = 200;
  const playerColor = PLAYER_COLORS[playerIdx];

  const otherIdx = playerIdx === 0 ? 1 : 0;
  const otherNumber = playerIdx === 0 ? swirlProgress?.p2 : swirlProgress?.p1;
  const bothDone = swirlProgress?.p1 !== null && swirlProgress?.p2 !== null;
  const magicNumber = bothDone ? swirlProgress.p1 + swirlProgress.p2 : null;

  const startDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2, cy = canvas.height / 2;
    angleRef.current = 0; radiusRef.current = 3; revolutionsRef.current = 0;
    const hueStart = Math.random() * 360;
    let prevX = cx + 3, prevY = cy;

    const draw = () => {
      const angleStep = 0.06;
      const radiusStep = 0.12;

      angleRef.current += angleStep;
      radiusRef.current += radiusStep;
      revolutionsRef.current = angleRef.current / (2 * Math.PI);

      const a = angleRef.current, r = radiusRef.current;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;

      const hue = (hueStart + angleRef.current * 12) % 360;
      ctx.strokeStyle = `hsl(${hue}, 70%, 55%)`;
      ctx.lineWidth = 2.5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(prevX, prevY); ctx.lineTo(x, y); ctx.stroke();
      prevX = x; prevY = y;

      if (r < size / 2 - 10) {
        animRef.current = requestAnimationFrame(draw);
      } else {
        setIsDrawing(false);
        const num = Math.max(2, Math.min(9, Math.round(revolutionsRef.current)));
        onStop(num);
      }
    };
    setIsDrawing(true);
    animRef.current = requestAnimationFrame(draw);
  }, [onStop, size]);

  const stopDrawing = useCallback(() => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
    setIsDrawing(false);
    const num = Math.max(2, Math.min(9, Math.round(revolutionsRef.current)));
    onStop(num);
  }, [onStop]);

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  // Both done — show the combining animation
  if (bothDone) {
    return (
      <div style={{ maxWidth: 400, margin: "0 auto", animation: "fadeInUp 0.5s ease" }}>
        <div style={{ ...cardBase, textAlign: "center", padding: 32 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 20, color: "#1f2937" }}>Magic Number!</h2>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 70, height: 70, borderRadius: 999,
                background: PLAYER_COLORS[0], display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, fontWeight: 800, color: "white",
                boxShadow: `0 4px 16px ${PLAYER_COLORS[0]}40`,
              }}>{swirlProgress.p1}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: PLAYER_COLORS[0], marginTop: 4 }}>{config.players[0]}</div>
            </div>

            <div style={{ fontSize: 24, fontWeight: 800, color: "#9ca3af" }}>+</div>

            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 70, height: 70, borderRadius: 999,
                background: PLAYER_COLORS[1], display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, fontWeight: 800, color: "white",
                boxShadow: `0 4px 16px ${PLAYER_COLORS[1]}40`,
              }}>{swirlProgress.p2}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: PLAYER_COLORS[1], marginTop: 4 }}>{config.players[1]}</div>
            </div>

            <div style={{ fontSize: 24, fontWeight: 800, color: "#9ca3af" }}>=</div>

            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 80, height: 80, borderRadius: 999,
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, fontWeight: 800, color: "white",
                boxShadow: "0 6px 24px rgba(168,85,247,0.4)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}>{magicNumber}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", marginTop: 4 }}>Magic!</div>
            </div>
          </div>

          <p style={{ color: "#6b7280", fontSize: 13 }}>
            Watch the display for the elimination!
          </p>
        </div>
      </div>
    );
  }

  // I'm done, waiting for my partner
  if (done) {
    return (
      <div style={{ maxWidth: 400, margin: "0 auto", animation: "fadeInUp 0.5s ease" }}>
        <div style={{ ...cardBase, textAlign: "center", padding: 32 }}>
          <div style={{
            width: 100, height: 100, borderRadius: 999, margin: "0 auto 16px",
            background: playerColor, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 40, fontWeight: 800, color: "white",
            boxShadow: `0 8px 30px ${playerColor}40`,
          }}>
            {myNumber}
          </div>
          <h3 style={{ margin: "0 0 4px", color: "#1f2937" }}>Your number: {myNumber}</h3>

          {otherNumber !== null ? (
            <p style={{ color: "#22c55e", fontSize: 13, fontWeight: 600 }}>
              {config.players[otherIdx]} got {otherNumber}! Combining...
            </p>
          ) : (
            <p style={{ color: "#9ca3af", fontSize: 13 }}>
              Waiting for {config.players[otherIdx]} to swirl...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Drawing phase
  return (
    <div style={{ maxWidth: 400, margin: "0 auto", animation: "fadeInUp 0.5s ease" }}>
      <div style={{ ...cardBase, textAlign: "center" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, color: "#1f2937" }}>{config.players[playerIdx]}'s Swirl</h2>
        <p style={{ color: "#9ca3af", fontSize: 13, marginBottom: 16 }}>
          {isDrawing ? "Tap STOP to lock in your number!" : "Tap Start to begin drawing your spiral"}
        </p>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <canvas ref={canvasRef} width={size} height={size}
            style={{
              borderRadius: 999, background: "#fff",
              boxShadow: `0 4px 20px rgba(0,0,0,0.06), 0 0 0 3px ${playerColor}30`,
              cursor: isDrawing ? "pointer" : "default",
            }}
            onClick={isDrawing ? stopDrawing : undefined}
          />

          {!isDrawing ? (
            <button onClick={startDrawing} style={{ ...btnPrimary, background: playerColor }}>
              {"\u2728"} Start Swirl
            </button>
          ) : (
            <button onClick={stopDrawing} style={{
              padding: "12px 32px", borderRadius: 999, border: "none",
              background: "linear-gradient(135deg,#ef4444,#f97316)", color: "white",
              fontWeight: 700, fontSize: 16, cursor: "pointer",
              animation: "pulse 1s ease-in-out infinite", fontFamily: "inherit",
            }}>
              {"\u{1F6D1}"} STOP!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
