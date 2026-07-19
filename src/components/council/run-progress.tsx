import type { CouncilRun } from "../../shared/types";

const STAGE_LABELS: Record<CouncilRun["stages"][number]["id"], string> = { understanding: "Understanding task", independent: "Independent answers", review: "Peer review", revision: "Revision", synthesis: "Final synthesis" };
export function RunProgress({ councilRun }: { councilRun: CouncilRun }) {
  return <section className="progress-section" aria-live="polite" aria-label="Council progress">
    <div className="section-heading"><h2>Progress</h2><span>{councilRun.status}</span></div>
    <ol className="stage-list">{councilRun.stages.map((stage, index) => <li className={`stage stage-${stage.status}`} key={stage.id}>
      <span className="stage-index">{stage.status === "completed" ? "✓" : index + 1}</span><span>{STAGE_LABELS[stage.id]}</span>
    </li>)}</ol>
  </section>;
}
