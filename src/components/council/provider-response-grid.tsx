import { PROVIDER_DETAILS } from "../../shared/constants";
import type { CouncilRun, ProviderId } from "../../shared/types";

interface ProviderResponseGridProps { councilRun: CouncilRun; onFocusProvider?(providerId: ProviderId): void }
export function ProviderResponseGrid({ councilRun, onFocusProvider }: ProviderResponseGridProps) {
  return <section className="responses-section" aria-label="Live provider responses"><div className="section-heading"><h2>Live Room</h2><span>{councilRun.responses.filter((response) => response.status === "completed").length} / {councilRun.responses.length} complete</span></div>
    <div className="response-grid">{councilRun.responses.map((response, index) => <article className="response-panel" key={response.providerId}>
      <header><div><span className="response-number">0{index + 1}</span><h3>{PROVIDER_DETAILS[response.providerId].name}</h3></div><div className="response-actions"><span className={`status-label status-${response.status}`}><span className="status-dot" />{response.status}</span>{onFocusProvider && <button type="button" className="focus-provider-button" onClick={() => onFocusProvider(response.providerId)}>View Tab <span aria-hidden="true">↗</span></button>}</div></header>
      {response.error ? <p className="error-message">{response.error} Reload the provider tab and retry.</p> : <div className="response-copy" tabIndex={0}>{response.text || <span className="waiting-copy"><i aria-hidden="true" />Waiting for the first words…</span>}</div>}
    </article>)}</div>
  </section>;
}
