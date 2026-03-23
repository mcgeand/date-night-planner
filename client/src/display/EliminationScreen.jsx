import { useState, useEffect } from "react";
import { CAT_NAMES, CATEGORY_META } from "../shared/constants";
import { pill, btnPrimary } from "../shared/styles";

export default function EliminationScreen({ config, entries, elimNumber, elimResults, onFinish }) {
  const [categories, setCategories] = useState(() => {
    const cats = {};
    CAT_NAMES.forEach(cat => {
      const items = [...(entries[cat]?.[0] || []), ...(entries[cat]?.[1] || [])];
      const owners = [...Array(entries[cat]?.[0]?.length || 0).fill(0), ...Array(entries[cat]?.[1]?.length || 0).fill(1)];
      cats[cat] = { items, owners, eliminated: [], chosen: null };
    });
    return cats;
  });
  const [animCat, setAnimCat] = useState(null);
  const [animIdx, setAnimIdx] = useState(null);
  const [countingCat, setCountingCat] = useState(null);
  const [countingIdx, setCountingIdx] = useState(null);
  const [allDone, setAllDone] = useState(false);

  // Scale sizing based on item count per category
  const itemCount = categories[CAT_NAMES[0]]?.items.length || 4;
  const dense = itemCount >= 8;
  const medium = itemCount >= 6;

  // Use clamp() for fluid sizing — scales between min and max based on viewport width
  // vw-based values give smooth scaling as the window resizes
  const sz = {
    width: "100%",
    maxWidth: 1200,
    gridGap: dense ? "1.2vw" : medium ? "1.4vw" : "1.6vw",
    cardPad: dense ? "1vw" : medium ? "1.4vw" : "1.8vw",
    cardRadius: dense ? 12 : 16,
    headerEmoji: dense ? "clamp(14px, 1.4vw, 22px)" : medium ? "clamp(16px, 1.6vw, 24px)" : "clamp(18px, 1.8vw, 28px)",
    headerTitle: dense ? "clamp(13px, 1.2vw, 20px)" : medium ? "clamp(14px, 1.3vw, 21px)" : "clamp(15px, 1.4vw, 22px)",
    headerGap: dense ? 6 : medium ? 8 : 10,
    itemGap: dense ? "0.3vw" : medium ? "0.4vw" : "0.5vw",
    itemPadV: dense ? "0.4vw" : medium ? "0.5vw" : "0.6vw",
    itemPadH: dense ? "0.6vw" : medium ? "0.7vw" : "0.8vw",
    itemFont: dense ? "clamp(11px, 1.1vw, 18px)" : medium ? "clamp(12px, 1.2vw, 19px)" : "clamp(13px, 1.3vw, 20px)",
    itemRadius: dense ? 6 : 8,
    dot: dense ? "clamp(5px, 0.5vw, 8px)" : "clamp(6px, 0.6vw, 10px)",
    chosenEmoji: dense ? "clamp(12px, 1.2vw, 18px)" : "clamp(14px, 1.4vw, 22px)",
  };

  useEffect(() => {
    const runElim = async () => {
      const state = {};
      CAT_NAMES.forEach(cat => {
        const items = [...(entries[cat]?.[0] || []), ...(entries[cat]?.[1] || [])];
        const owners = [...Array(entries[cat]?.[0]?.length || 0).fill(0), ...Array(entries[cat]?.[1]?.length || 0).fill(1)];
        state[cat] = { items, owners, eliminated: new Set(), chosen: null };
      });

      const buildFlatList = () => {
        const flat = [];
        CAT_NAMES.forEach(cat => {
          const s = state[cat];
          s.items.forEach((_, i) => {
            if (!s.eliminated.has(i) && s.chosen === null) {
              flat.push({ cat, idx: i });
            }
          });
        });
        return flat;
      };

      const checkChosen = () => {
        CAT_NAMES.forEach(cat => {
          const s = state[cat];
          if (s.chosen !== null) return;
          const remaining = s.items.map((_, i) => i).filter(i => !s.eliminated.has(i));
          if (remaining.length === 1) {
            s.chosen = remaining[0];
            setCategories(prev => ({ ...prev, [cat]: { ...prev[cat], chosen: s.chosen, eliminated: [...s.eliminated] } }));
          }
        });
      };

      // Scale animation speed for more items
      const countDelay = dense ? 80 : medium ? 100 : 120;
      const elimDelay = dense ? 300 : medium ? 380 : 450;
      const pauseDelay = dense ? 150 : medium ? 200 : 250;

      let pointer = 0;

      while (!CAT_NAMES.every(cat => state[cat].chosen !== null)) {
        const flat = buildFlatList();
        if (flat.length === 0) break;

        let stepsLeft = elimNumber;
        let pos = pointer % flat.length;

        while (stepsLeft > 0) {
          const slot = flat[pos % flat.length];
          stepsLeft--;

          if (stepsLeft > 0) {
            setCountingCat(slot.cat);
            setCountingIdx(slot.idx);
            await new Promise(r => setTimeout(r, countDelay));
            setCountingCat(null);
            setCountingIdx(null);
          }

          if (stepsLeft === 0) {
            setAnimCat(slot.cat); setAnimIdx(slot.idx);
            await new Promise(r => setTimeout(r, elimDelay));

            state[slot.cat].eliminated.add(slot.idx);
            setCategories(prev => ({
              ...prev,
              [slot.cat]: { ...prev[slot.cat], eliminated: [...state[slot.cat].eliminated] },
            }));

            setAnimCat(null); setAnimIdx(null);
            checkChosen();
            await new Promise(r => setTimeout(r, pauseDelay));
            pointer = pos;
          }
          pos++;
        }
      }

      checkChosen();
      setAllDone(true);
    };
    runElim();
  }, []);

  return (
    <div style={{ width: sz.width, maxWidth: sz.maxWidth, margin: "0 auto", animation: "fadeInUp 0.4s ease" }}>
      <div style={{ textAlign: "center", marginBottom: dense ? 12 : 20 }}>
        <span style={{ ...pill("linear-gradient(135deg,#a855f7,#ec4899)", "white"), padding: "clamp(6px, 0.6vw, 12px) clamp(18px, 1.8vw, 32px)", fontSize: "clamp(14px, 1.4vw, 22px)", boxShadow: "0 4px 14px rgba(168,85,247,0.3)" }}>
          Magic Number: {elimNumber} {"\u2728"}
        </span>
        <p style={{ color: "#9ca3af", fontSize: "clamp(12px, 1vw, 16px)", margin: "8px 0 0" }}>Counting across all categories...</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: sz.gridGap }}>
        {CAT_NAMES.map(catName => {
          const cat = categories[catName];
          const meta = CATEGORY_META[catName];
          return (
            <div key={catName} style={{
              background: cat.chosen !== null ? meta.color.bg : "white",
              border: `2px solid ${cat.chosen !== null ? meta.color.accent : meta.color.border + "80"}`,
              borderRadius: sz.cardRadius, padding: sz.cardPad, transition: "all 0.4s",
              boxShadow: cat.chosen !== null ? `0 6px 24px ${meta.color.glow}` : "0 2px 10px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: sz.headerGap }}>
                <span style={{ fontSize: sz.headerEmoji }}>{meta.emoji}</span>
                <span style={{ fontWeight: 700, fontSize: sz.headerTitle, color: meta.color.text }}>{catName}</span>
                {cat.chosen !== null && <span style={{ fontSize: 12, marginLeft: "auto" }}>{"\u2705"}</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: sz.itemGap }}>
                {cat.items.map((item, i) => {
                  const isElim = cat.eliminated.includes(i);
                  const isChosen = cat.chosen === i;
                  const isAnim = animCat === catName && animIdx === i;
                  const isCounting = countingCat === catName && countingIdx === i;
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: dense ? 4 : 6,
                      padding: `${sz.itemPadV}px ${sz.itemPadH}px`, borderRadius: sz.itemRadius,
                      background: isChosen ? `${meta.color.accent}15` : isCounting ? "#fef9c3" : "#f9fafb",
                      border: isChosen ? `2px solid ${meta.color.accent}` : isAnim ? "2px solid #ef4444" : isCounting ? "1.5px solid #fbbf24" : "1px solid transparent",
                      opacity: isElim ? 0.35 : 1, textDecoration: isElim ? "line-through" : "none",
                      transition: "all 0.15s", transform: isAnim ? "scale(0.95)" : isChosen ? "scale(1.02)" : "scale(1)",
                    }}>
                      <div style={{ width: sz.dot, height: sz.dot, borderRadius: 999, background: cat.owners[i] === 0 ? "#a855f7" : "#ec4899", flexShrink: 0, opacity: 0.6 }} />
                      {isChosen && <span style={{ fontSize: sz.chosenEmoji }}>{"\u{1F389}"}</span>}
                      <span style={{ flex: 1, fontSize: sz.itemFont, color: isElim ? "#9ca3af" : isChosen ? meta.color.text : "#374151", fontWeight: isChosen ? 700 : 400 }}>{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {allDone && (
        <div style={{ textAlign: "center", marginTop: dense ? 16 : 24, animation: "fadeInUp 0.4s ease" }}>
          <p style={{ color: "#7c3aed", fontWeight: 600, fontSize: 16 }}>
            {"\u2728"} Elimination complete! Tap "See Your Date Night" on your phone.
          </p>
        </div>
      )}
    </div>
  );
}
