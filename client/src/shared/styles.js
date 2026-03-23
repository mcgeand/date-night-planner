export const pill = (bg, color) => ({
  display: "inline-block", padding: "4px 12px", borderRadius: 999,
  background: bg, color, fontSize: 12, fontWeight: 700, letterSpacing: "0.03em",
});

export const cardBase = {
  background: "white", borderRadius: 20, padding: 28,
  boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0",
};

export const btnPrimary = {
  padding: "14px 36px", borderRadius: 14, border: "none",
  background: "linear-gradient(135deg, #a855f7, #ec4899)", color: "white",
  fontWeight: 700, fontSize: 16, cursor: "pointer",
  boxShadow: "0 4px 20px rgba(168,85,247,0.3)", transition: "transform 0.15s, box-shadow 0.15s",
  fontFamily: "inherit",
};

export const btnSecondary = {
  padding: "14px 36px", borderRadius: 14,
  border: "2px solid #a855f7", background: "white", color: "#a855f7",
  fontWeight: 700, fontSize: 16, cursor: "pointer", transition: "all 0.15s",
  fontFamily: "inherit",
};

export const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "2px solid #e5e7eb", fontSize: 15, fontFamily: "inherit",
  outline: "none", transition: "border-color 0.2s",
};

export const globalStyles = `
  @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity:1; } 100% { transform: translateY(100vh) rotate(720deg); opacity:0; } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.7; } }
  @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  * { box-sizing: border-box; }
`;

export const pageWrapper = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #faf5ff 0%, #fffbf5 50%, #f5faff 100%)",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: "28px 16px",
};
