import { CAT_NAMES } from "../shared/constants";
import DateSummaryCard from "../shared/DateSummaryCard";

export default function ResultScreen({ config, elimResults }) {
  const categories = {};
  for (const cat of CAT_NAMES) {
    const r = elimResults[cat];
    if (r && r.chosen !== null) {
      categories[cat] = {
        chosen: r.chosenText || r.items[r.chosen],
        pickedBy: config.players[r.chosenBy],
        items: r.items,
        owners: r.owners,
        chosenBy: r.chosenBy,
      };
    }
  }

  return (
    <div style={{ maxWidth: "clamp(480px, 50vw, 760px)", margin: "0 auto", animation: "fadeInUp 0.6s ease" }}>
      <DateSummaryCard players={config.players} categories={categories} />

      <p style={{ textAlign: "center", color: "#7c3aed", fontWeight: 600, fontSize: "clamp(14px, 1.3vw, 22px)", margin: "clamp(16px, 2vw, 32px) 0 0" }}>
        Rate this date and plan your next one from your phones!
      </p>
    </div>
  );
}
