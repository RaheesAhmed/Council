import { useEffect, useState } from "react";
import type { CouncilMode, ProviderId } from "../shared/types";
import { AppHeader } from "../components/layout/app-header";
import { ProviderPicker } from "../components/provider/provider-picker";
import { RunProgress } from "../components/council/run-progress";
import { useProviderStore } from "../stores/use-provider-store";
import { useRunStore } from "../stores/use-run-store";

export function SidePanelApp() {
  const [task, setTask] = useState(""); const [mode, setMode] = useState<CouncilMode>("deep_debate"); const [selectedProviders, setSelectedProviders] = useState<ProviderId[]>(["chatgpt", "claude"]);
  const { connections, checkConnections, openProvider } = useProviderStore(); const { activeRun, startRun } = useRunStore();
  useEffect(() => { void checkConnections(); }, [checkConnections]);
  return <><a className="skip-link" href="#sidepanel-main">Skip to Main Content</a><AppHeader onOpenWorkspace={() => void chrome.runtime.sendMessage({ type: "WORKSPACE_OPEN" })} /><main className={`sidepanel-shell ${activeRun ? "has-active-run" : ""}`} id="sidepanel-main">
    {activeRun ? <><section className="panel-active-header"><p className="eyebrow">Council in Session</p><h1>{activeRun.task}</h1></section><RunProgress councilRun={activeRun} /><button className="primary-button full-width" type="button" onClick={() => void chrome.runtime.sendMessage({ type: "WORKSPACE_OPEN" })}>Open Live Room <span aria-hidden="true">↗</span></button></> : <>
    <section className="panel-intro"><p className="eyebrow">New Session</p><h1>Ask the room.</h1><p>Independent answers. Structured debate. One considered response.</p></section>
    <section className="panel-composer"><label htmlFor="sidepanel-task">Council Brief</label><textarea id="sidepanel-task" name="sidepanel-task" autoComplete="off" rows={6} value={task} onChange={(event) => setTask(event.target.value)} placeholder="Describe what you need resolved…" /></section>
    <section><div className="section-title compact"><div><span>01</span><h2>Experts</h2></div><button className="quiet-button" type="button" onClick={() => void checkConnections()}>Refresh</button></div><ProviderPicker connections={connections} selectedProviders={selectedProviders} onSelectionChange={setSelectedProviders} onOpen={(id) => void openProvider(id)} /></section>
    <label className="select-field"><span>Method</span><select name="council-mode" value={mode} onChange={(event) => setMode(event.target.value as CouncilMode)}><option value="deep_debate">Deep Debate</option><option value="quick">Quick Council</option><option value="adversarial">Adversarial Review</option><option value="code">Code Council</option></select></label>
    <button className="primary-button full-width" disabled={!task.trim() || selectedProviders.length < 2} onClick={() => void startRun(task.trim(), mode, selectedProviders)}>Convene Council <span aria-hidden="true">→</span></button></>}
  </main></>;
}
