import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════
   D.A.T.E. — Dinner · Activity · Treat · Entertainment
   A cozy MASH-inspired date night planner

   Flow: Welcome → Setup → P1 Entry → P2 Entry → Review & Veto → Swirl → Eliminate → Results
   ═══════════════════════════════════════════ */

const CATEGORY_META = {
  Dinner:        { emoji: "🍽️", color: { bg: "#fef3c7", border: "#fbbf24", text: "#92400e", accent: "#f59e0b", glow: "rgba(245,158,11,0.25)" } },
  Activity:      { emoji: "🎨", color: { bg: "#dcfce7", border: "#4ade80", text: "#166534", accent: "#22c55e", glow: "rgba(34,197,94,0.25)" } },
  Treat:         { emoji: "🍰", color: { bg: "#fce7f3", border: "#f472b6", text: "#9d174d", accent: "#ec4899", glow: "rgba(236,72,153,0.25)" } },
  Entertainment: { emoji: "🎬", color: { bg: "#e0e7ff", border: "#818cf8", text: "#3730a3", accent: "#6366f1", glow: "rgba(99,102,241,0.25)" } },
};
const CAT_NAMES = ["Dinner", "Activity", "Treat", "Entertainment"];

const SUGGESTIONS = {
  Dinner:        ["Takeout sushi", "DIY pizza night", "Homemade tacos", "Charcuterie board", "Breakfast for dinner", "Pho from scratch", "Build-your-own burrito", "Fancy pasta"],
  Activity:      ["Painting together", "Puzzle assembly", "Dance party", "Board game battle", "Blanket fort building", "Couples yoga", "Photo scavenger hunt", "Origami challenge"],
  Treat:         ["Homemade brownies", "Ice cream sundae bar", "Baking cookies", "Wine & chocolate", "Milkshake mixology", "Fondue night", "Mug cake challenge", "S'mores bar"],
  Entertainment: ["Movie marathon", "Backyard stargazing", "Podcast binge", "Slow dancing playlist", "Karaoke night", "Trivia challenge", "Read aloud to each other", "Video game co-op"],
};

/* ─── Shared Styles ─── */
const pill = (bg, color) => ({
  display: "inline-block", padding: "4px 12px", borderRadius: 999,
  background: bg, color, fontSize: 12, fontWeight: 700, letterSpacing: "0.03em",
});
const cardBase = {
  background: "white", borderRadius: 20, padding: 28,
  boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0",
};
const btnPrimary = {
  padding: "14px 36px", borderRadius: 14, border: "none",
  background: "linear-gradient(135deg, #a855f7, #ec4899)", color: "white",
  fontWeight: 700, fontSize: 16, cursor: "pointer",
  boxShadow: "0 4px 20px rgba(168,85,247,0.3)", transition: "transform 0.15s, box-shadow 0.15s",
  fontFamily: "inherit",
};
const btnSecondary = {
  padding: "14px 36px", borderRadius: 14,
  border: "2px solid #a855f7", background: "white", color: "#a855f7",
  fontWeight: 700, fontSize: 16, cursor: "pointer", transition: "all 0.15s",
  fontFamily: "inherit",
};
const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "2px solid #e5e7eb", fontSize: 15, fontFamily: "inherit",
  outline: "none", transition: "border-color 0.2s",
};

/* ═══════════════════════════════
   COMPONENTS
   ═══════════════════════════════ */

/* ─── Swirl Canvas ─── */
function SwirlCanvas({ onStop, isDrawing, setIsDrawing, size = 180, playerColor }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const revolutionsRef = useRef(0);
  const angleRef = useRef(0);
  const radiusRef = useRef(0);

  const startDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2, cy = canvas.height / 2;
    angleRef.current = 0; radiusRef.current = 3; revolutionsRef.current = 0;
    const hueStart = Math.random() * 360;
    let prevX = cx + 3, prevY = cy;
    let frameCount = 0;

    const draw = () => {
      // Slow down: only advance every other frame for a more visible swirl
      frameCount++;
      const angleStep = 0.06; // much slower rotation
      const radiusStep = 0.12; // tighter spiral, more revolutions before filling

      angleRef.current += angleStep;
      radiusRef.current += radiusStep;

      // Track full revolutions
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
        // Ran out of space — auto-stop
        setIsDrawing(false);
        const num = Math.max(2, Math.min(9, Math.round(revolutionsRef.current)));
        onStop(num);
      }
    };
    setIsDrawing(true);
    animRef.current = requestAnimationFrame(draw);
  }, [onStop, setIsDrawing, size]);

  const stopDrawing = useCallback(() => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
    setIsDrawing(false);
    // Convert revolutions into a number 2-9
    const num = Math.max(2, Math.min(9, Math.round(revolutionsRef.current)));
    onStop(num);
  }, [onStop, setIsDrawing]);

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <canvas ref={canvasRef} width={size} height={size}
        style={{ borderRadius: 999, background: "#fff", boxShadow: `0 4px 20px rgba(0,0,0,0.06), 0 0 0 3px ${playerColor}30`, cursor: isDrawing ? "pointer" : "default" }}
        onClick={isDrawing ? stopDrawing : undefined} />
      {!isDrawing ? (
        <button onClick={startDrawing} style={{ ...btnPrimary, padding: "8px 22px", fontSize: 14, background: playerColor }}>✨ Start Swirl</button>
      ) : (
        <button onClick={stopDrawing} style={{ padding: "8px 22px", borderRadius: 999, border: "none", background: "linear-gradient(135deg,#ef4444,#f97316)", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer", animation: "pulse 1s ease-in-out infinite", fontFamily: "inherit" }}>🛑 STOP!</button>
      )}
    </div>
  );
}

/* ─── Confetti ─── */
function Confetti() {
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

/* ─── Step Indicator ─── */
function StepIndicator({ steps, current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 28 }}>
      {steps.map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
              background: i < current ? "linear-gradient(135deg,#a855f7,#ec4899)" : i === current ? "#a855f7" : "#e5e7eb",
              color: i <= current ? "white" : "#9ca3af", fontWeight: 700, fontSize: 13, transition: "all 0.3s",
            }}>{i < current ? "✓" : i + 1}</div>
            <span style={{ fontSize: 9, fontWeight: 600, color: i <= current ? "#7c3aed" : "#9ca3af", whiteSpace: "nowrap" }}>{label}</span>
          </div>
          {i < steps.length - 1 && <div style={{ width: 28, height: 2, background: i < current ? "#a855f7" : "#e5e7eb", margin: "0 2px", marginBottom: 16, transition: "background 0.3s" }} />}
        </div>
      ))}
    </div>
  );
}

/* ─── Welcome Screen ─── */
function WelcomeScreen({ onStart }) {
  return (
    <div style={{ ...cardBase, textAlign: "center", maxWidth: 500, margin: "0 auto", animation: "fadeInUp 0.5s ease" }}>
      <div style={{ fontSize: 64, marginBottom: 8 }}>💕</div>
      <h1 style={{ fontSize: 48, fontWeight: 800, margin: 0, background: "linear-gradient(135deg,#a855f7,#ec4899,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>D.A.T.E.</h1>
      <p style={{ color: "#6b7280", fontSize: 16, margin: "8px 0 4px" }}>Dinner · Activity · Treat · Entertainment</p>
      <p style={{ color: "#9ca3af", fontSize: 14, margin: "0 0 28px", lineHeight: 1.6 }}>
        A cozy MASH-inspired game to plan your perfect date night.<br />No more decision fatigue — let the swirl decide!
      </p>
      <button onClick={onStart} style={btnPrimary}
        onMouseEnter={e => { e.target.style.transform = "scale(1.04)"; }}
        onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}>
        Let's Play 💫
      </button>
    </div>
  );
}

/* ─── Setup Screen ─── */
function SetupScreen({ config, setConfig, onNext }) {
  return (
    <div style={{ ...cardBase, maxWidth: 500, margin: "0 auto", animation: "fadeInUp 0.5s ease" }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 22, color: "#1f2937" }}>Game Setup</h2>
      <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 24px" }}>Customize your date night rules</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[0, 1].map(i => (
          <div key={i}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Player {i + 1} {i === 0 ? "💜" : "💗"}
            </label>
            <input value={config.players[i]} onChange={e => {
              const p = [...config.players]; p[i] = e.target.value; setConfig({ ...config, players: p });
            }} style={{ ...inputStyle, marginTop: 4 }} />
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Options per person, per category</label>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {[2, 3, 4].map(n => (
            <button key={n} onClick={() => setConfig({ ...config, optionsPerPerson: n })}
              style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `2px solid ${config.optionsPerPerson === n ? "#a855f7" : "#e5e7eb"}`, background: config.optionsPerPerson === n ? "#f5f3ff" : "white", color: config.optionsPerPerson === n ? "#7c3aed" : "#6b7280", fontWeight: 700, fontSize: 18, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}>
              {n}<div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af" }}>{n * 2} total</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Vetos per person (use across any category)</label>
        <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 8px" }}>When you veto an option, your partner replaces it with something new</p>
        <div style={{ display: "flex", gap: 8 }}>
          {[0, 1, 2, 3].map(n => (
            <button key={n} onClick={() => setConfig({ ...config, vetosPerPerson: n })}
              style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `2px solid ${config.vetosPerPerson === n ? "#ef4444" : "#e5e7eb"}`, background: config.vetosPerPerson === n ? "#fef2f2" : "white", color: config.vetosPerPerson === n ? "#dc2626" : "#6b7280", fontWeight: 700, fontSize: 18, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}>
              {n}<div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af" }}>{n === 0 ? "none" : n === 1 ? "veto" : "vetos"}</div>
            </button>
          ))}
        </div>
      </div>

      <button onClick={onNext} style={{ ...btnPrimary, width: "100%" }}>Start Adding Options →</button>
    </div>
  );
}

/* ─── Player Entry Screen ─── */
function PlayerEntryScreen({ playerIndex, config, entries, setEntries, onNext, onBack }) {
  const name = config.players[playerIndex];
  const isP1 = playerIndex === 0;
  const accentColor = isP1 ? "#a855f7" : "#ec4899";

  const updateEntry = (cat, idx, val) => {
    setEntries(prev => {
      const next = { ...prev }; next[cat] = { ...next[cat] };
      next[cat][playerIndex] = [...(next[cat][playerIndex] || [])];
      next[cat][playerIndex][idx] = val; return next;
    });
  };
  const getVal = (cat, idx) => (entries[cat]?.[playerIndex]?.[idx]) || "";

  const allFilled = CAT_NAMES.every(cat =>
    Array.from({ length: config.optionsPerPerson }, (_, i) => getVal(cat, i)).every(v => v.trim())
  );

  const fillRandom = (cat, idx) => {
    const used = new Set();
    CAT_NAMES.forEach(c => [0, 1].forEach(p => (entries[c]?.[p] || []).forEach(v => used.add(v.toLowerCase()))));
    const available = SUGGESTIONS[cat].filter(s => !used.has(s.toLowerCase()));
    if (available.length > 0) updateEntry(cat, idx, available[Math.floor(Math.random() * available.length)]);
  };

  return (
    <div style={{ ...cardBase, maxWidth: 540, margin: "0 auto", animation: "fadeInUp 0.4s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${accentColor}, ${isP1 ? "#7c3aed" : "#db2777"})`, color: "white", fontSize: 20, fontWeight: 800 }}>
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, color: "#1f2937" }}>{name}'s Picks</h2>
          <p style={{ margin: 0, color: "#9ca3af", fontSize: 13 }}>Add {config.optionsPerPerson} options per category{playerIndex === 0 ? " — don't let your partner peek! 👀" : ""}</p>
        </div>
      </div>

      {CAT_NAMES.map(cat => {
        const meta = CATEGORY_META[cat];
        return (
          <div key={cat} style={{ marginBottom: 16, padding: 14, borderRadius: 14, background: meta.color.bg + "80", border: `1px solid ${meta.color.border}40` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>{meta.emoji}</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: meta.color.text }}>{cat}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {Array.from({ length: config.optionsPerPerson }, (_, idx) => (
                <div key={idx} style={{ display: "flex", gap: 6 }}>
                  <input value={getVal(cat, idx)} onChange={e => updateEntry(cat, idx, e.target.value)} placeholder={`Option ${idx + 1}...`}
                    style={{ ...inputStyle, padding: "8px 12px", fontSize: 14, borderColor: `${meta.color.border}60` }}
                    onFocus={e => { e.target.style.borderColor = meta.color.accent; }}
                    onBlur={e => { e.target.style.borderColor = `${meta.color.border}60`; }} />
                  <button onClick={() => fillRandom(cat, idx)} title="Random suggestion"
                    style={{ padding: "8px 10px", borderRadius: 10, border: `1px solid ${meta.color.border}60`, background: "white", cursor: "pointer", fontSize: 14, transition: "all 0.15s" }}
                    onMouseEnter={e => { e.target.style.background = meta.color.bg; }}
                    onMouseLeave={e => { e.target.style.background = "white"; }}>🎲</button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button onClick={onBack} style={{ ...btnSecondary, flex: 1, padding: "12px 0" }}>← Back</button>
        <button onClick={onNext} disabled={!allFilled}
          style={{ ...btnPrimary, flex: 2, padding: "12px 0", opacity: allFilled ? 1 : 0.5, cursor: allFilled ? "pointer" : "not-allowed" }}>
          {playerIndex === 0 ? `Pass to ${config.players[1]} →` : "Review Options →"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   VETO & REPLACE SCREEN
   Turn-based: select whose turn it is to veto, then they pick items to veto.
   The OTHER player types the replacement.
   ═══════════════════════════════════════ */
function VetoScreen({ config, entries, setEntries, onNext, onBack }) {
  const [vetos, setVetos] = useState([config.vetosPerPerson, config.vetosPerPerson]);
  const [vetoLog, setVetoLog] = useState([]);
  const [pendingVeto, setPendingVeto] = useState(null); // { player, cat, itemIdx, owner }
  const [replaceVal, setReplaceVal] = useState("");
  const [activePlayer, setActivePlayer] = useState(null); // 0 or 1 — who is currently vetoing

  const PLAYER_COLORS = [
    { main: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", light: "#ede9fe", gradient: "linear-gradient(135deg, #a855f7, #7c3aed)" },
    { main: "#db2777", bg: "#fdf2f8", border: "#fbcfe8", light: "#fce7f3", gradient: "linear-gradient(135deg, #ec4899, #db2777)" },
  ];

  const getItems = (cat) => {
    const p0 = entries[cat][0] || [];
    const p1 = entries[cat][1] || [];
    return [...p0.map((text, i) => ({ text, owner: 0, entryIdx: i })), ...p1.map((text, i) => ({ text, owner: 1, entryIdx: i }))];
  };

  const handleVeto = (cat, item) => {
    if (activePlayer === null || vetos[activePlayer] <= 0) return;
    setPendingVeto({ player: activePlayer, cat, itemIdx: item.entryIdx, owner: item.owner });
    setReplaceVal("");
  };

  const confirmReplace = () => {
    if (!replaceVal.trim() || !pendingVeto) return;
    const { player, cat, itemIdx, owner } = pendingVeto;
    const otherPlayer = player === 0 ? 1 : 0;
    const oldText = entries[cat][owner][itemIdx];

    setEntries(prev => {
      const next = { ...prev }; next[cat] = { ...next[cat] };
      next[cat][owner] = [...next[cat][owner]];
      next[cat][owner][itemIdx] = replaceVal.trim();
      return next;
    });

    setVetos(prev => { const n = [...prev]; n[player]--; return n; });
    setVetoLog(prev => [...prev, { player, otherPlayer, cat, oldText, newText: replaceVal.trim() }]);
    setPendingVeto(null);
    setReplaceVal("");
  };

  const cancelVeto = () => { setPendingVeto(null); setReplaceVal(""); };
  const hasAnyVetos = vetos[0] > 0 || vetos[1] > 0;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", animation: "fadeInUp 0.4s ease" }}>
      <div style={{ ...cardBase, marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, color: "#1f2937" }}>Review & Veto 🚫</h2>
        <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 20px", lineHeight: 1.5 }}>
          {config.vetosPerPerson === 0
            ? "Here are all the options — no vetos this game, straight to the swirl!"
            : "See something you hate? Pick who's vetoing, then tap the option to veto it. Your partner will replace it."}
        </p>

        {/* Player turn selector — who is vetoing? */}
        {config.vetosPerPerson > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, textAlign: "center" }}>
              Who's vetoing?
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              {[0, 1].map(pi => {
                const pc = PLAYER_COLORS[pi];
                const isActive = activePlayer === pi;
                const remaining = vetos[pi];
                const disabled = remaining <= 0;
                return (
                  <button key={pi}
                    onClick={() => { if (!disabled && !pendingVeto) setActivePlayer(isActive ? null : pi); }}
                    style={{
                      flex: 1, maxWidth: 220, padding: "12px 16px", borderRadius: 14,
                      border: isActive ? `3px solid ${pc.main}` : `2px solid ${disabled ? "#e5e7eb" : pc.border}`,
                      background: isActive ? pc.bg : disabled ? "#f9fafb" : "white",
                      cursor: disabled || pendingVeto ? "not-allowed" : "pointer",
                      opacity: disabled ? 0.5 : 1,
                      transition: "all 0.25s", fontFamily: "inherit",
                      boxShadow: isActive ? `0 4px 16px ${pc.main}25` : "none",
                      transform: isActive ? "scale(1.02)" : "scale(1)",
                    }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
                        background: isActive ? pc.gradient : disabled ? "#d1d5db" : pc.light,
                        color: isActive ? "white" : pc.main, fontSize: 14, fontWeight: 800, transition: "all 0.25s",
                      }}>
                        {config.players[pi].charAt(0).toUpperCase()}
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? pc.main : disabled ? "#9ca3af" : "#374151" }}>
                          {config.players[pi]}
                        </div>
                        <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
                          {Array.from({ length: config.vetosPerPerson }, (_, i) => (
                            <span key={i} style={{ fontSize: 12, opacity: i < remaining ? 1 : 0.2, transition: "opacity 0.3s" }}>🚫</span>
                          ))}
                          <span style={{ fontSize: 10, color: "#9ca3af", marginLeft: 2 }}>
                            {remaining} left
                          </span>
                        </div>
                      </div>
                    </div>
                    {isActive && !disabled && (
                      <div style={{ marginTop: 6, fontSize: 11, color: pc.main, fontWeight: 600 }}>
                        ↓ Tap an option below to veto it
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Category grids */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {CAT_NAMES.map(cat => {
            const meta = CATEGORY_META[cat];
            const items = getItems(cat);
            return (
              <div key={cat} style={{ padding: 12, borderRadius: 14, background: `${meta.color.bg}90`, border: `1px solid ${meta.color.border}40` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>{meta.emoji}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: meta.color.text }}>{cat}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {items.map((item) => {
                    const ownerColor = item.owner === 0 ? "#a855f7" : "#ec4899";
                    const isPending = pendingVeto && pendingVeto.cat === cat && pendingVeto.itemIdx === item.entryIdx && pendingVeto.owner === item.owner;
                    const canVeto = activePlayer !== null && vetos[activePlayer] > 0 && !pendingVeto;

                    return (
                      <div key={`${item.owner}-${item.entryIdx}`}
                        onClick={() => canVeto ? handleVeto(cat, item) : null}
                        style={{
                          display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 8,
                          background: isPending ? "#fef2f2" : canVeto ? `${PLAYER_COLORS[activePlayer].bg}` : "#fff",
                          border: isPending ? "2px solid #fca5a5" : canVeto ? `1.5px dashed ${PLAYER_COLORS[activePlayer].border}` : "1px solid #f0f0f0",
                          transition: "all 0.25s",
                          cursor: canVeto ? "pointer" : "default",
                        }}
                        onMouseEnter={e => { if (canVeto) { e.currentTarget.style.background = PLAYER_COLORS[activePlayer].light; e.currentTarget.style.borderColor = PLAYER_COLORS[activePlayer].main; e.currentTarget.style.transform = "scale(1.02)"; } }}
                        onMouseLeave={e => { if (canVeto) { e.currentTarget.style.background = PLAYER_COLORS[activePlayer].bg; e.currentTarget.style.borderColor = PLAYER_COLORS[activePlayer].border; e.currentTarget.style.transform = "scale(1)"; } }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                          background: ownerColor + "18", border: `1.5px solid ${ownerColor}40`,
                          fontSize: 9, fontWeight: 800, color: ownerColor,
                        }}>
                          {config.players[item.owner].charAt(0).toUpperCase()}
                        </div>
                        <span style={{ flex: 1, fontSize: 13, color: "#374151" }}>{item.text}</span>
                        {canVeto && (
                          <span style={{ fontSize: 11, color: PLAYER_COLORS[activePlayer].main, opacity: 0.5 }}>🚫</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pending veto replacement input */}
        {pendingVeto && (() => {
          const vetoer = pendingVeto.player;
          const replacer = vetoer === 0 ? 1 : 0;
          const pc = PLAYER_COLORS[replacer];
          return (
            <div style={{
              marginTop: 16, padding: 16, borderRadius: 14,
              background: `linear-gradient(135deg, ${PLAYER_COLORS[vetoer].bg}, #fff7ed)`,
              border: `2px solid ${PLAYER_COLORS[vetoer].main}40`,
              animation: "fadeInUp 0.3s ease",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
                  background: PLAYER_COLORS[vetoer].gradient, color: "white", fontSize: 12, fontWeight: 800,
                }}>
                  {config.players[vetoer].charAt(0).toUpperCase()}
                </div>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: PLAYER_COLORS[vetoer].main }}>
                    {config.players[vetoer]}
                  </span>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>
                    {" vetoed "}<strong style={{ color: "#dc2626" }}>"{entries[pendingVeto.cat][pendingVeto.owner][pendingVeto.itemIdx]}"</strong>{" in "}{pendingVeto.cat}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
                  background: pc.gradient, color: "white", fontSize: 12, fontWeight: 800,
                }}>
                  {config.players[replacer].charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: pc.main }}>
                  {config.players[replacer]}, pick a replacement:
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={replaceVal} onChange={e => setReplaceVal(e.target.value)} autoFocus
                  placeholder={`New ${pendingVeto.cat.toLowerCase()} option...`}
                  onKeyDown={e => e.key === "Enter" && confirmReplace()}
                  style={{ ...inputStyle, flex: 1, borderColor: pc.border }}
                  onFocus={e => { e.target.style.borderColor = pc.main; }}
                  onBlur={e => { e.target.style.borderColor = pc.border; }} />
                <button onClick={confirmReplace} disabled={!replaceVal.trim()}
                  style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: replaceVal.trim() ? "#22c55e" : "#d1d5db", color: "white", fontWeight: 700, fontSize: 14, cursor: replaceVal.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 0.2s" }}>
                  ✓ Replace
                </button>
                <button onClick={cancelVeto}
                  style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", background: "white", color: "#6b7280", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                  Cancel
                </button>
              </div>
            </div>
          );
        })()}

        {/* Veto log */}
        {vetoLog.length > 0 && (
          <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "#fafafa", border: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Veto History</div>
            {vetoLog.map((v, i) => (
              <div key={i} style={{ fontSize: 12, color: "#6b7280", marginBottom: 3, lineHeight: 1.4 }}>
                <span style={{ color: PLAYER_COLORS[v.player].main, fontWeight: 700 }}>{config.players[v.player]}</span>
                {" vetoed "}
                <span style={{ textDecoration: "line-through", opacity: 0.6 }}>{v.oldText}</span>
                {" → "}
                <span style={{ color: PLAYER_COLORS[v.otherPlayer].main, fontWeight: 700 }}>{config.players[v.otherPlayer]}</span>
                {" replaced with "}
                <span style={{ fontWeight: 600, color: "#374151" }}>{v.newText}</span>
                <span style={{ ...pill(CATEGORY_META[v.cat].color.bg, CATEGORY_META[v.cat].color.text), fontSize: 10, marginLeft: 4, padding: "1px 6px" }}>{v.cat}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack} style={{ ...btnSecondary, flex: 1, padding: "12px 0" }}>← Back</button>
        <button onClick={onNext} disabled={!!pendingVeto}
          style={{ ...btnPrimary, flex: 2, padding: "12px 0", opacity: pendingVeto ? 0.5 : 1, cursor: pendingVeto ? "not-allowed" : "pointer" }}>
          {hasAnyVetos ? "Done Vetoing — Swirl Time! ✨" : "On to the Swirl! ✨"}
        </button>
      </div>
    </div>
  );
}

/* ─── Dual Swirl Screen ─── */
function DualSwirlScreen({ config, swirlNumbers, setSwirlNumbers, onComplete }) {
  const [drawingP1, setDrawingP1] = useState(false);
  const [drawingP2, setDrawingP2] = useState(false);
  const [p1Done, setP1Done] = useState(false);
  const [p2Done, setP2Done] = useState(false);

  const handleP1Stop = useCallback((num) => {
    setSwirlNumbers(prev => ({ ...prev, p1: num })); setP1Done(true);
  }, [setSwirlNumbers]);
  const handleP2Stop = useCallback((num) => {
    setSwirlNumbers(prev => ({ ...prev, p2: num })); setP2Done(true);
  }, [setSwirlNumbers]);

  const combined = p1Done && p2Done ? swirlNumbers.p1 + swirlNumbers.p2 : null;

  return (
    <div style={{ ...cardBase, maxWidth: 560, margin: "0 auto", textAlign: "center", animation: "fadeInUp 0.4s ease" }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 22, color: "#1f2937" }}>The Swirl ✨</h2>
      <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 24px" }}>Each person draws a swirl and says STOP — your numbers combine!</p>

      <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
        {[0, 1].map(pi => {
          const done = pi === 0 ? p1Done : p2Done;
          const drawing = pi === 0 ? drawingP1 : drawingP2;
          const setDrawing = pi === 0 ? setDrawingP1 : setDrawingP2;
          const handleStop = pi === 0 ? handleP1Stop : handleP2Stop;
          const color = pi === 0 ? "#a855f7" : "#ec4899";
          const bgTint = pi === 0 ? "#f5f3ff" : "#fdf2f8";
          return (
            <div key={pi} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <span style={{ ...pill(bgTint, color) }}>{config.players[pi]}</span>
              {done ? (
                <div style={{ width: 180, height: 180, borderRadius: 999, background: bgTint, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `3px solid ${color}` }}>
                  <div style={{ fontSize: 42, fontWeight: 800, color }}>{swirlNumbers[pi === 0 ? "p1" : "p2"]}</div>
                  <div style={{ fontSize: 12, color: `${color}80` }}>locked in ✓</div>
                </div>
              ) : (
                <SwirlCanvas onStop={handleStop} isDrawing={drawing} setIsDrawing={setDrawing} size={180} playerColor={color} />
              )}
            </div>
          );
        })}
      </div>

      {combined !== null && (
        <div style={{ marginTop: 24, animation: "fadeInUp 0.4s ease" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "#7c3aed" }}>{swirlNumbers.p1}</span>
            <span style={{ fontSize: 20, color: "#d1d5db" }}>+</span>
            <span style={{ fontSize: 28, fontWeight: 800, color: "#db2777" }}>{swirlNumbers.p2}</span>
            <span style={{ fontSize: 20, color: "#d1d5db" }}>=</span>
            <span style={{ fontSize: 36, fontWeight: 800, padding: "4px 20px", borderRadius: 14, background: "linear-gradient(135deg,#a855f7,#ec4899)", color: "white", boxShadow: "0 4px 20px rgba(168,85,247,0.3)" }}>{combined}</span>
          </div>
          <button onClick={() => onComplete(combined)} style={btnPrimary}>Start Elimination! 🔮</button>
        </div>
      )}
    </div>
  );
}

/* ─── Elimination Screen ───
   Counts through ALL categories as one flat list.
   e.g. Dinner-1, Dinner-2, Activity-1, Activity-2, Treat-1, ... etc.
   Skips items already eliminated or in a category that already has a winner.
   ─── */
function EliminationScreen({ config, entries, elimNumber, onFinish }) {
  const [categories, setCategories] = useState(() => {
    const cats = {};
    CAT_NAMES.forEach(cat => {
      const items = [...(entries[cat][0] || []), ...(entries[cat][1] || [])];
      const owners = [...Array(entries[cat][0]?.length || 0).fill(0), ...Array(entries[cat][1]?.length || 0).fill(1)];
      cats[cat] = { items, owners, eliminated: [], winner: null };
    });
    return cats;
  });
  const [animCat, setAnimCat] = useState(null);
  const [animIdx, setAnimIdx] = useState(null);
  const [countingCat, setCountingCat] = useState(null);
  const [countingIdx, setCountingIdx] = useState(null);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    const runElim = async () => {
      // Build state we can mutate during elimination
      const state = {};
      CAT_NAMES.forEach(cat => {
        const items = [...(entries[cat][0] || []), ...(entries[cat][1] || [])];
        const owners = [...Array(entries[cat][0]?.length || 0).fill(0), ...Array(entries[cat][1]?.length || 0).fill(1)];
        state[cat] = { items, owners, eliminated: new Set(), winner: null };
      });

      // Build a flat ordered list of all slots: [{cat, idx}, ...]
      // Order: Dinner-0, Dinner-1, ..., Activity-0, Activity-1, ..., etc.
      const buildFlatList = () => {
        const flat = [];
        CAT_NAMES.forEach(cat => {
          const s = state[cat];
          s.items.forEach((_, i) => {
            if (!s.eliminated.has(i) && s.winner === null) {
              flat.push({ cat, idx: i });
            }
          });
        });
        return flat;
      };

      // Check if a category is done (1 remaining) and set its winner
      const checkWinners = () => {
        CAT_NAMES.forEach(cat => {
          const s = state[cat];
          if (s.winner !== null) return;
          const remaining = s.items.map((_, i) => i).filter(i => !s.eliminated.has(i));
          if (remaining.length === 1) {
            s.winner = remaining[0];
            setCategories(prev => ({ ...prev, [cat]: { ...prev[cat], winner: s.winner, eliminated: [...s.eliminated] } }));
          }
        });
      };

      let pointer = 0;

      // Keep eliminating until every category has a winner
      while (!CAT_NAMES.every(cat => state[cat].winner !== null)) {
        const flat = buildFlatList();
        if (flat.length === 0) break;

        // Count forward by elimNumber through the flat list
        // Show the counting animation as we step through
        let stepsLeft = elimNumber;
        let pos = pointer % flat.length;

        while (stepsLeft > 0) {
          const slot = flat[pos % flat.length];
          stepsLeft--;

          if (stepsLeft > 0) {
            // Show counting pulse (brief highlight as we count through)
            setCountingCat(slot.cat);
            setCountingIdx(slot.idx);
            await new Promise(r => setTimeout(r, 120));
            setCountingCat(null);
            setCountingIdx(null);
          }

          if (stepsLeft === 0) {
            // This one gets eliminated!
            setAnimCat(slot.cat); setAnimIdx(slot.idx);
            await new Promise(r => setTimeout(r, 450));

            state[slot.cat].eliminated.add(slot.idx);
            setCategories(prev => ({
              ...prev,
              [slot.cat]: { ...prev[slot.cat], eliminated: [...state[slot.cat].eliminated] },
            }));

            setAnimCat(null); setAnimIdx(null);

            // Check if any categories are now resolved
            checkWinners();

            await new Promise(r => setTimeout(r, 250));

            // Next round starts from the position AFTER the eliminated item
            // But in the NEW flat list (which won't include the eliminated item)
            pointer = pos; // we'll mod by new flat length next round
          }

          pos++;
        }
      }

      // Final check — set any remaining winners
      checkWinners();
      setAllDone(true);
    };
    runElim();
  }, []);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", animation: "fadeInUp 0.4s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <span style={{ ...pill("linear-gradient(135deg,#a855f7,#ec4899)", "white"), padding: "6px 18px", fontSize: 14, boxShadow: "0 4px 14px rgba(168,85,247,0.3)" }}>
          Magic Number: {elimNumber} ✨
        </span>
        <p style={{ color: "#9ca3af", fontSize: 12, margin: "8px 0 0" }}>Counting across all categories...</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {CAT_NAMES.map(catName => {
          const cat = categories[catName];
          const meta = CATEGORY_META[catName];
          return (
            <div key={catName} style={{
              background: cat.winner !== null ? meta.color.bg : "white",
              border: `2px solid ${cat.winner !== null ? meta.color.accent : meta.color.border + "80"}`,
              borderRadius: 16, padding: 14, transition: "all 0.4s",
              boxShadow: cat.winner !== null ? `0 6px 24px ${meta.color.glow}` : "0 2px 10px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{meta.emoji}</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: meta.color.text }}>{catName}</span>
                {cat.winner !== null && <span style={{ fontSize: 12, marginLeft: "auto" }}>✅</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {cat.items.map((item, i) => {
                  const isElim = cat.eliminated.includes(i);
                  const isWinner = cat.winner === i;
                  const isAnim = animCat === catName && animIdx === i;
                  const isCounting = countingCat === catName && countingIdx === i;
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 8,
                      background: isWinner ? `${meta.color.accent}15` : isCounting ? "#fef9c3" : "#f9fafb",
                      border: isWinner ? `2px solid ${meta.color.accent}` : isAnim ? "2px solid #ef4444" : isCounting ? "1.5px solid #fbbf24" : "1px solid transparent",
                      opacity: isElim ? 0.35 : 1, textDecoration: isElim ? "line-through" : "none",
                      transition: "all 0.15s", transform: isAnim ? "scale(0.95)" : isWinner ? "scale(1.02)" : "scale(1)",
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: 999, background: cat.owners[i] === 0 ? "#a855f7" : "#ec4899", flexShrink: 0, opacity: 0.6 }} />
                      {isWinner && <span style={{ fontSize: 14 }}>🎉</span>}
                      <span style={{ flex: 1, fontSize: 13, color: isElim ? "#9ca3af" : isWinner ? meta.color.text : "#374151", fontWeight: isWinner ? 700 : 400 }}>{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {allDone && (
        <div style={{ textAlign: "center", marginTop: 24, animation: "fadeInUp 0.4s ease" }}>
          <button onClick={() => onFinish(categories)} style={btnPrimary}>See Your Date Night! 💕</button>
        </div>
      )}
    </div>
  );
}

/* ─── Date Night Summary Card (reused in results + history) ─── */
function DateSummaryCard({ config, categories, date }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #fef3c7, #fce7f3, #e0e7ff)",
      borderRadius: 24, padding: 32, boxShadow: "0 8px 40px rgba(168,85,247,0.15)",
      border: "2px solid rgba(168,85,247,0.2)", textAlign: "center",
    }}>
      <div style={{ fontSize: 48, marginBottom: 4 }}>💕</div>
      <h2 style={{ margin: "0 0 2px", fontSize: 26, color: "#581c87" }}>{config.players[0]} & {config.players[1]}'s</h2>
      <h3 style={{ margin: "0 0 24px", fontSize: 20, color: "#7c3aed", fontWeight: 600 }}>Perfect Date Night</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {CAT_NAMES.map(name => {
          const cat = categories[name];
          const meta = CATEGORY_META[name];
          return (
            <div key={name} style={{ background: "rgba(255,255,255,0.9)", borderRadius: 16, padding: 18, textAlign: "center", border: `2px solid ${meta.color.accent}40`, boxShadow: `0 2px 12px ${meta.color.glow}` }}>
              <div style={{ fontSize: 30, marginBottom: 4 }}>{meta.emoji}</div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: meta.color.accent, marginBottom: 4 }}>{name}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: meta.color.text }}>{cat.items[cat.winner]}</div>
              <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>picked by {config.players[cat.owners[cat.winner]]}</div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 20, padding: "10px 16px", borderRadius: 12, background: "rgba(255,255,255,0.6)", border: "1px solid rgba(168,85,247,0.1)" }}>
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
          🗓️ {(date || new Date()).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}

/* ─── Final Result Screen ─── */
function ResultScreen({ config, categories, onPlayAgain, onFreshStart, onSaveDate, onViewHistory, historyCount }) {
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", animation: "fadeInUp 0.6s ease" }}>
      <DateSummaryCard config={config} categories={categories} />

      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
        <button onClick={onSaveDate} style={{ ...btnPrimary, padding: "12px 24px", fontSize: 15 }}
          onMouseEnter={e => { e.target.style.transform = "scale(1.04)"; }}
          onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}>
          📝 Save & Rate This Date
        </button>
        <button onClick={onPlayAgain} style={{ ...btnSecondary, padding: "12px 20px", fontSize: 14 }}>🔄 Spin Again</button>
        <button onClick={onFreshStart} style={{ ...btnSecondary, padding: "12px 20px", fontSize: 14, borderColor: "#e5e7eb", color: "#6b7280" }}>✨ New Game</button>
      </div>

      {historyCount > 0 && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button onClick={onViewHistory} style={{ background: "none", border: "none", color: "#a855f7", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
            View Date History ({historyCount} date{historyCount !== 1 ? "s" : ""})
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Save & Rate Screen ─── */
function RateDateScreen({ config, categories, onSave, onSkip }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [highlight, setHighlight] = useState("");
  const [mood, setMood] = useState(null);

  const MOODS = [
    { emoji: "😍", label: "Amazing" },
    { emoji: "😊", label: "Great" },
    { emoji: "😌", label: "Chill" },
    { emoji: "😂", label: "Hilarious" },
    { emoji: "🥰", label: "Romantic" },
    { emoji: "😴", label: "Sleepy" },
  ];

  const handleSave = () => {
    onSave({
      date: new Date().toISOString(),
      players: [...config.players],
      categories: CAT_NAMES.reduce((acc, name) => {
        acc[name] = {
          winner: categories[name].items[categories[name].winner],
          pickedBy: config.players[categories[name].owners[categories[name].winner]],
        };
        return acc;
      }, {}),
      rating,
      mood: mood !== null ? MOODS[mood] : null,
      highlight,
      notes,
    });
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", animation: "fadeInUp 0.4s ease" }}>
      <div style={{ ...cardBase }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, color: "#1f2937" }}>How Was Your Date? 💕</h2>
        <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 24px" }}>Rate tonight so you can look back on it later</p>

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
                  background: "none", border: "none", fontSize: 36, cursor: "pointer",
                  transition: "transform 0.15s", padding: 0,
                  transform: (hoverRating || rating) >= star ? "scale(1.15)" : "scale(1)",
                  filter: (hoverRating || rating) >= star ? "none" : "grayscale(1) opacity(0.3)",
                }}>
                ⭐
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
                  padding: "8px 14px", borderRadius: 999,
                  border: mood === i ? "2px solid #a855f7" : "2px solid #e5e7eb",
                  background: mood === i ? "#f5f3ff" : "white",
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                  fontSize: 13, display: "flex", alignItems: "center", gap: 4,
                }}>
                <span style={{ fontSize: 18 }}>{m.emoji}</span>
                <span style={{ fontWeight: 600, color: mood === i ? "#7c3aed" : "#6b7280" }}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Highlight moment */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Best Moment ✨</label>
          <input value={highlight} onChange={e => setHighlight(e.target.value)}
            placeholder="What was the highlight of the night?"
            style={{ ...inputStyle, marginTop: 6 }} />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Notes & Memories</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Anything you want to remember about tonight..."
            rows={3}
            style={{ ...inputStyle, marginTop: 6, resize: "vertical", minHeight: 70 }} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onSkip} style={{ ...btnSecondary, flex: 1, padding: "12px 0", fontSize: 14 }}>Skip</button>
          <button onClick={handleSave} disabled={rating === 0}
            style={{ ...btnPrimary, flex: 2, padding: "12px 0", fontSize: 14, opacity: rating === 0 ? 0.5 : 1, cursor: rating === 0 ? "not-allowed" : "pointer" }}>
            Save to Date History 💾
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── History / Timeline Screen ─── */
function HistoryScreen({ history, onBack, onExport, onImport }) {
  const [expandedIdx, setExpandedIdx] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (Array.isArray(data)) onImport(data);
      } catch { /* invalid JSON */ }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  if (history.length === 0) {
    return (
      <div style={{ ...cardBase, maxWidth: 500, margin: "0 auto", textAlign: "center", animation: "fadeInUp 0.4s ease" }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>📖</div>
        <h2 style={{ margin: "0 0 8px", fontSize: 22, color: "#1f2937" }}>No Dates Yet!</h2>
        <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
          Play your first D.A.T.E. game and save it to start building your history together.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onBack} style={btnPrimary}>← Back</button>
          <button onClick={() => fileInputRef.current?.click()} style={{ ...btnSecondary, fontSize: 14, padding: "12px 20px" }}>📂 Import History</button>
        </div>
        <input ref={fileInputRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleFileImport} />
      </div>
    );
  }

  // Group by month
  const grouped = {};
  history.forEach((entry, idx) => {
    const d = new Date(entry.date);
    const key = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({ ...entry, idx });
  });

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", animation: "fadeInUp 0.4s ease" }}>
      <div style={{ ...cardBase, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, color: "#1f2937" }}>Date Night History 📖</h2>
            <p style={{ margin: "2px 0 0", color: "#9ca3af", fontSize: 13 }}>
              {history.length} date{history.length !== 1 ? "s" : ""} and counting!
            </p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => fileInputRef.current?.click()} title="Import"
              style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontSize: 14 }}>📂</button>
            <button onClick={onExport} title="Export"
              style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontSize: 14 }}>💾</button>
          </div>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleFileImport} />
        </div>

        {/* Stats bar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, padding: 14, borderRadius: 14, background: "linear-gradient(135deg, #f5f3ff, #fdf2f8)", border: "1px solid #ede9fe" }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#7c3aed" }}>{history.length}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" }}>Dates</div>
          </div>
          <div style={{ width: 1, background: "#e5e7eb" }} />
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#ec4899" }}>
              {history.length > 0 ? (history.reduce((sum, h) => sum + (h.rating || 0), 0) / history.length).toFixed(1) : "—"}
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" }}>Avg Rating</div>
          </div>
          <div style={{ width: 1, background: "#e5e7eb" }} />
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 24 }}>
              {(() => {
                const moods = history.filter(h => h.mood).map(h => h.mood.emoji);
                if (moods.length === 0) return "—";
                const freq = {}; moods.forEach(m => { freq[m] = (freq[m] || 0) + 1; });
                return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
              })()}
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" }}>Top Vibe</div>
          </div>
        </div>

        {/* Timeline */}
        {Object.entries(grouped).map(([month, dates]) => (
          <div key={month} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, paddingLeft: 20 }}>
              {month}
            </div>
            {dates.map((entry) => {
              const d = new Date(entry.date);
              const isExpanded = expandedIdx === entry.idx;
              return (
                <div key={entry.idx} style={{ display: "flex", gap: 12, marginBottom: 4 }}>
                  {/* Timeline dot & line */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 999, background: "linear-gradient(135deg, #a855f7, #ec4899)", border: "2px solid white", boxShadow: "0 0 0 2px #ddd6fe", flexShrink: 0 }} />
                    <div style={{ width: 2, flex: 1, background: "#ede9fe", minHeight: 20 }} />
                  </div>

                  {/* Card */}
                  <div
                    onClick={() => setExpandedIdx(isExpanded ? null : entry.idx)}
                    style={{
                      flex: 1, padding: "10px 14px", borderRadius: 14, cursor: "pointer",
                      background: isExpanded ? "#faf5ff" : "white",
                      border: isExpanded ? "2px solid #ddd6fe" : "1px solid #f0f0f0",
                      transition: "all 0.25s", marginBottom: 6,
                    }}>
                    {/* Header row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>
                          {d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                        {entry.mood && <span style={{ fontSize: 16 }}>{entry.mood.emoji}</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} style={{ fontSize: 12, filter: i < entry.rating ? "none" : "grayscale(1) opacity(0.2)" }}>⭐</span>
                        ))}
                      </div>
                    </div>

                    {/* Quick summary */}
                    <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                      {CAT_NAMES.map(name => (
                        <span key={name} style={{
                          ...pill(CATEGORY_META[name].color.bg, CATEGORY_META[name].color.text),
                          fontSize: 10, padding: "2px 8px",
                        }}>
                          {CATEGORY_META[name].emoji} {entry.categories[name]?.winner}
                        </span>
                      ))}
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #ede9fe", animation: "fadeInUp 0.25s ease" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: "#7c3aed", fontWeight: 600 }}>{entry.players[0]}</span>
                          <span style={{ fontSize: 12, color: "#d1d5db" }}>&</span>
                          <span style={{ fontSize: 12, color: "#db2777", fontWeight: 600 }}>{entry.players[1]}</span>
                        </div>

                        {CAT_NAMES.map(name => {
                          const meta = CATEGORY_META[name];
                          const catData = entry.categories[name];
                          if (!catData) return null;
                          return (
                            <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                              <span style={{ fontSize: 14 }}>{meta.emoji}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: meta.color.accent, width: 80 }}>{name}</span>
                              <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{catData.winner}</span>
                              <span style={{ fontSize: 10, color: "#9ca3af" }}>({catData.pickedBy})</span>
                            </div>
                          );
                        })}

                        {entry.highlight && (
                          <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 8, background: "#fffbeb", border: "1px solid #fde68a" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#92400e" }}>✨ Best moment: </span>
                            <span style={{ fontSize: 12, color: "#78350f" }}>{entry.highlight}</span>
                          </div>
                        )}

                        {entry.notes && (
                          <div style={{ marginTop: 6, padding: "8px 10px", borderRadius: 8, background: "#f9fafb", border: "1px solid #f0f0f0" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280" }}>📝 Notes: </span>
                            <span style={{ fontSize: 12, color: "#374151" }}>{entry.notes}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <button onClick={onBack} style={{ ...btnPrimary, width: "100%" }}>← Back</button>
    </div>
  );
}

/* ═══════════════════════════════
   MAIN APP
   ═══════════════════════════════ */
export default function DATEApp() {
  const [phase, setPhase] = useState("welcome");
  const [config, setConfig] = useState({ players: ["Dominic", "Danny"], optionsPerPerson: 2, vetosPerPerson: 2 });
  const [entries, setEntries] = useState(() => {
    const e = {}; CAT_NAMES.forEach(c => { e[c] = { 0: [], 1: [] }; }); return e;
  });
  const [swirlNumbers, setSwirlNumbers] = useState({ p1: null, p2: null });
  const [elimNumber, setElimNumber] = useState(null);
  const [finalCategories, setFinalCategories] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [history, setHistory] = useState([]);
  const [returnTo, setReturnTo] = useState("welcome"); // where to go back from history

  const stepMap = { welcome: -1, setup: 0, "entry-p1": 1, "entry-p2": 2, veto: 3, swirl: 4, eliminating: 5, results: 6 };
  const stepLabels = ["Setup", "P1 Picks", "P2 Picks", "Veto", "Swirl", "Eliminate", "Results"];
  const gamePhases = ["setup", "entry-p1", "entry-p2", "veto", "swirl", "eliminating", "results"];

  const freshStart = () => {
    setPhase("welcome");
    setConfig({ players: ["Dominic", "Danny"], optionsPerPerson: 2, vetosPerPerson: 2 });
    const e = {}; CAT_NAMES.forEach(c => { e[c] = { 0: [], 1: [] }; }); setEntries(e);
    setSwirlNumbers({ p1: null, p2: null }); setElimNumber(null); setFinalCategories(null); setShowConfetti(false);
  };

  const playAgain = () => {
    setSwirlNumbers({ p1: null, p2: null }); setElimNumber(null); setFinalCategories(null); setShowConfetti(false);
    setPhase("swirl");
  };

  const saveDate = (entry) => {
    setHistory(prev => [entry, ...prev]);
    setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000);
    setPhase("history");
  };

  const exportHistory = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `date-night-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const importHistory = (data) => {
    // Merge imported data, avoiding duplicates by date
    const existingDates = new Set(history.map(h => h.date));
    const newEntries = data.filter(d => d.date && !existingDates.has(d.date));
    setHistory(prev => [...newEntries, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  const showHistory = (from) => {
    setReturnTo(from);
    setPhase("history");
  };

  return (
    <>
      <style>{`
        @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity:1; } 100% { transform: translateY(100vh) rotate(720deg); opacity:0; } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.7; } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>

      {showConfetti && <Confetti />}

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #faf5ff 0%, #fffbf5 50%, #f5faff 100%)",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: "28px 16px",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {phase !== "welcome" && phase !== "history" && (
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, background: "linear-gradient(135deg,#a855f7,#ec4899,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>D.A.T.E.</h1>
              <p style={{ margin: "2px 0 16px", color: "#9ca3af", fontSize: 12 }}>{config.players[0]} & {config.players[1]}'s Date Night</p>
            </div>
          )}

          {gamePhases.includes(phase) && phase !== "results" && (
            <StepIndicator steps={stepLabels} current={stepMap[phase]} />
          )}

          {phase === "welcome" && (
            <>
              <WelcomeScreen onStart={() => setPhase("setup")} />
              {history.length > 0 && (
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <button onClick={() => showHistory("welcome")}
                    style={{ background: "none", border: "none", color: "#a855f7", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, margin: "0 auto" }}
                    onMouseEnter={e => { e.target.style.textDecoration = "underline"; }}
                    onMouseLeave={e => { e.target.style.textDecoration = "none"; }}>
                    📖 View Date History ({history.length})
                  </button>
                </div>
              )}
            </>
          )}

          {phase === "setup" && <SetupScreen config={config} setConfig={setConfig} onNext={() => setPhase("entry-p1")} />}
          {phase === "entry-p1" && <PlayerEntryScreen playerIndex={0} config={config} entries={entries} setEntries={setEntries} onNext={() => setPhase("entry-p2")} onBack={() => setPhase("setup")} />}
          {phase === "entry-p2" && <PlayerEntryScreen playerIndex={1} config={config} entries={entries} setEntries={setEntries} onNext={() => setPhase("veto")} onBack={() => setPhase("entry-p1")} />}
          {phase === "veto" && <VetoScreen config={config} entries={entries} setEntries={setEntries} onNext={() => setPhase("swirl")} onBack={() => setPhase("entry-p2")} />}
          {phase === "swirl" && <DualSwirlScreen config={config} swirlNumbers={swirlNumbers} setSwirlNumbers={setSwirlNumbers} onComplete={(num) => { setElimNumber(num); setPhase("eliminating"); }} />}
          {phase === "eliminating" && <EliminationScreen config={config} entries={entries} elimNumber={elimNumber} onFinish={(cats) => { setFinalCategories(cats); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 4500); setPhase("results"); }} />}

          {phase === "results" && finalCategories && (
            <ResultScreen config={config} categories={finalCategories}
              onPlayAgain={playAgain} onFreshStart={freshStart}
              onSaveDate={() => setPhase("rate")}
              onViewHistory={() => showHistory("results")}
              historyCount={history.length} />
          )}

          {phase === "rate" && finalCategories && (
            <RateDateScreen config={config} categories={finalCategories}
              onSave={saveDate}
              onSkip={freshStart} />
          )}

          {phase === "history" && (
            <HistoryScreen history={history}
              onBack={() => setPhase(returnTo)}
              onExport={exportHistory}
              onImport={importHistory} />
          )}
        </div>
      </div>
    </>
  );
}
