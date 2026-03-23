import { useState, useEffect } from "react";
import { useSocket } from "./hooks/useSocket";
import { useGameState } from "./hooks/useGameState";
import { globalStyles, pageWrapper } from "./shared/styles";
import DisplayShell from "./display/DisplayShell";
import MobileShell from "./mobile/MobileShell";
import Confetti from "./shared/Confetti";

function getRole() {
  const path = window.location.pathname;
  if (path.startsWith("/display")) return "display";
  if (path.startsWith("/join")) return "mobile";
  return null; // landing — pick a role
}

function RolePicker() {
  const host = window.location.origin;
  return (
    <div style={{ ...pageWrapper, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{globalStyles}</style>
      <div style={{ textAlign: "center", maxWidth: 400, animation: "fadeInUp 0.5s ease" }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>{"\u{1F495}"}</div>
        <h1 style={{ fontSize: 48, fontWeight: 800, margin: 0, background: "linear-gradient(135deg,#a855f7,#ec4899,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>D.A.T.E.</h1>
        <p style={{ color: "#6b7280", fontSize: 16, margin: "8px 0 32px" }}>Dinner {"\u00B7"} Activity {"\u00B7"} Treat {"\u00B7"} Entertainment</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <a href="/display" style={{
            padding: "18px 36px", borderRadius: 14, border: "none",
            background: "linear-gradient(135deg, #a855f7, #ec4899)", color: "white",
            fontWeight: 700, fontSize: 18, cursor: "pointer", textDecoration: "none", textAlign: "center",
            boxShadow: "0 4px 20px rgba(168,85,247,0.3)",
          }}>
            {"\u{1F4FA}"} Display (Laptop/TV)
          </a>
          <a href="/join" style={{
            padding: "18px 36px", borderRadius: 14,
            border: "2px solid #a855f7", background: "white", color: "#a855f7",
            fontWeight: 700, fontSize: 18, cursor: "pointer", textDecoration: "none", textAlign: "center",
          }}>
            {"\u{1F4F1}"} Join (Phone)
          </a>
        </div>

        <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 24 }}>
          Open <strong>/display</strong> on your laptop and <strong>/join</strong> on your phones
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const role = getRole();
  const { socket, connected, emit, on, gameEvent } = useSocket();
  const gameState = useGameState(socket);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!socket.current) return;
    const handler = () => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    };
    socket.current.on("game-saved", handler);
    return () => socket.current?.off("game-saved", handler);
  }, [socket]);

  if (!role) return <RolePicker />;

  return (
    <div style={pageWrapper}>
      <style>{globalStyles}</style>
      {showConfetti && <Confetti />}
      {role === "display" ? (
        <DisplayShell
          connected={connected}
          emit={emit}
          on={on}
          gameEvent={gameEvent}
          gameState={gameState}
        />
      ) : (
        <MobileShell
          connected={connected}
          emit={emit}
          on={on}
          gameEvent={gameEvent}
          gameState={gameState}
        />
      )}
    </div>
  );
}
