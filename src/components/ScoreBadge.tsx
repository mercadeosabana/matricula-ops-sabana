import {
  SCORE_CLASS,
  SCORE_LABEL,
  type ScoreLabel,
} from "@/lib/scoring";

export function ScoreBadge({
  score,
  className = "",
}: {
  score: ScoreLabel;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${SCORE_CLASS[score]} ${className}`}
      title={`Score lead: ${SCORE_LABEL[score]}`}
    >
      {SCORE_LABEL[score]}
    </span>
  );
}
