export type ScoreBand = "low" | "medium" | "high";

export function getScoreBand(score: number): ScoreBand {
  if (score < 50) return "low";
  if (score < 75) return "medium";
  return "high";
}

const BAND_STYLES: Record<
  ScoreBand,
  { stroke: string; text: string; chip: string; label: string }
> = {
  low: {
    stroke: "#ef4444",
    text: "text-red-600",
    chip: "bg-red-50 text-red-700",
    label: "Needs work",
  },
  medium: {
    stroke: "#d97706",
    text: "text-amber-600",
    chip: "bg-amber-50 text-amber-700",
    label: "Good match",
  },
  high: {
    stroke: "#059669",
    text: "text-emerald-600",
    chip: "bg-emerald-50 text-emerald-700",
    label: "Great match",
  },
};

const SIZE = 152;
const STROKE_WIDTH = 12;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreGauge({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, score));
  const band = getScoreBand(clamped);
  const styles = BAND_STYLES[band];
  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;

  return (
    <div data-testid="score-gauge" data-band={band} className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            className="text-slate-100"
            strokeWidth={STROKE_WIDTH}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={styles.stroke}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-extrabold tracking-tight ${styles.text}`}>
            {Math.round(clamped)}
          </span>
          <span className="text-xs font-medium text-slate-400">out of 100</span>
        </div>
      </div>
      <span className={`rounded-full px-3 py-1 text-sm font-semibold ${styles.chip}`}>
        {styles.label}
      </span>
    </div>
  );
}
