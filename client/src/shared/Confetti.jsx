export default function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 2, duration: 2 + Math.random() * 2,
    color: ["#fbbf24", "#ec4899", "#6366f1", "#22c55e", "#a855f7", "#ef4444"][i % 6],
    size: 6 + Math.random() * 6, rotation: Math.random() * 360,
  }));
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 999, overflow: "hidden" }}>
      {pieces.map(p => (
        <div key={p.id} style={{ position: "absolute", left: `${p.left}%`, top: -20, width: p.size, height: p.size * 0.6, background: p.color, borderRadius: 2, transform: `rotate(${p.rotation}deg)`, animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards` }} />
      ))}
    </div>
  );
}
