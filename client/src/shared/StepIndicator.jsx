export default function StepIndicator({ steps, current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 28 }}>
      {steps.map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
              background: i < current ? "linear-gradient(135deg,#a855f7,#ec4899)" : i === current ? "#a855f7" : "#e5e7eb",
              color: i <= current ? "white" : "#9ca3af", fontWeight: 700, fontSize: 13, transition: "all 0.3s",
            }}>{i < current ? "\u2713" : i + 1}</div>
            <span style={{ fontSize: 9, fontWeight: 600, color: i <= current ? "#7c3aed" : "#9ca3af", whiteSpace: "nowrap" }}>{label}</span>
          </div>
          {i < steps.length - 1 && <div style={{ width: 28, height: 2, background: i < current ? "#a855f7" : "#e5e7eb", margin: "0 2px", marginBottom: 16, transition: "background 0.3s" }} />}
        </div>
      ))}
    </div>
  );
}
