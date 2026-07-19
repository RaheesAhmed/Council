import { useEffect, useState } from "react";
import { COUNCIL_MODES } from "../shared/constants";
import type { CouncilMode, ProviderId } from "../shared/types";
import { AppHeader } from "../components/layout/app-header";
import { ProviderPicker } from "../components/provider/provider-picker";
import { RunProgress } from "../components/council/run-progress";
import { ProviderResponseGrid } from "../components/council/provider-response-grid";
import { useProviderStore } from "../stores/use-provider-store";
import { useRunStore } from "../stores/use-run-store";

export function WorkspaceApp() {
  const [task, setTask] = useState(""); const [mode, setMode] = useState<CouncilMode>("deep_debate");
  const [selectedProviders, setSelectedProviders] = useState<ProviderId[]>(["chatgpt", "claude"]);
  const { connections, checkConnections, openProvider } = useProviderStore();
  const { activeRun, startRun, stopRun } = useRunStore();
  useEffect(() => { void checkConnections(); }, [checkConnections]);
  const canStart = task.trim().length > 0 && selectedProviders.length >= 2 && !activeRun?.status.includes("running");
  const startConfiguredCouncil = (): void => { if (canStart) void startRun(task.trim(), mode, selectedProviders); };
  const readyProviderCount = connections.filter((connection) => connection.status === "ready").length;
  return <><a className="skip-link" href="#workspace-main">Skip to Main Content</a><AppHeader isWorkspace /><main className="workspace-shell" id="workspace-main">
    <aside className="workspace-rail" aria-label="Workspace status">
      <p className="rail-label">Session</p><p className="rail-title">Untitled Council</p>
      <div className="rail-rule" />
      <dl className="rail-metadata"><div><dt>Connected</dt><dd>{readyProviderCount} / 5</dd></div><div><dt>Selected</dt><dd>{selectedProviders.length}</dd></div><div><dt>Mode</dt><dd>{COUNCIL_MODES[mode].name}</dd></div></dl>
      <p className="rail-note">Council works through your open browser sessions. Nothing is sent to a Council server.</p>
    </aside>
    <div className="workspace-content">
      {activeRun ? <section className="active-session" aria-labelledby="active-session-heading">
        <header className="active-session-header"><div><p className="eyebrow">Council in Session</p><h1 id="active-session-heading">{activeRun.task}</h1></div><button className="secondary-button" type="button" onClick={() => void stopRun()}>Stop Session</button></header>
        <RunProgress councilRun={activeRun} />
        <ProviderResponseGrid councilRun={activeRun} onFocusProvider={(providerId) => void openProvider(providerId)} />
      </section> : <><section className="composer-section" aria-labelledby="task-heading">
        <div className="workspace-intro"><p className="eyebrow">New Session</p><h1 id="task-heading">What are we solving?</h1><p>Give the council a decision, problem, or brief. Each model starts independently before the debate begins.</p></div>
        <div className="task-composer"><label htmlFor="council-task">Council Brief</label><textarea id="council-task" name="council-task" autoComplete="off" value={task} onChange={(event) => setTask(event.target.value)} onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") { event.preventDefault(); startConfiguredCouncil(); } }} placeholder="Describe the problem, constraints, and what a strong answer must include…" rows={7} /><div className="composer-meta"><span>{task.length.toLocaleString()} characters</span><span>⌘ ↵ to start</span></div></div>
        <div className="setup-section"><div className="section-title"><div><span>01</span><h2>Invite Experts</h2></div><button className="quiet-button" type="button" onClick={() => void checkConnections()}>Check Connections</button></div><ProviderPicker connections={connections} selectedProviders={selectedProviders} onSelectionChange={setSelectedProviders} onOpen={(id) => void openProvider(id)} /></div>
        <fieldset className="setup-section mode-fieldset"><legend><span>02</span>Choose a Method</legend><div className="mode-list">{Object.entries(COUNCIL_MODES).map(([modeId, details]) => <label className={mode === modeId ? "mode-option is-selected" : "mode-option"} key={modeId}><input type="radio" name="mode" value={modeId} checked={mode === modeId} onChange={() => setMode(modeId as CouncilMode)} /><span><strong>{details.name}</strong><small>{details.description}</small></span><i aria-hidden="true" /></label>)}</div></fieldset>
        <div className="composer-actions"><p aria-live="polite">{selectedProviders.length < 2 ? "Select at least 2 providers to begin." : `${selectedProviders.length} experts will join this council.`}</p><button className="primary-button" type="button" disabled={!canStart} onClick={startConfiguredCouncil}>Convene Council <span aria-hidden="true">→</span></button></div>
      </section><section className="empty-ledger"><span aria-hidden="true">—</span><p>The record of discussion will appear here.</p></section></>}
    </div>
  </main></>;
}
