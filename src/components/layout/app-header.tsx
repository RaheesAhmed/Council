export function AppHeader({ onOpenWorkspace, isWorkspace = false }: { onOpenWorkspace?: () => void; isWorkspace?: boolean }) {
  return <header className="app-header">
    <a className="wordmark" href="workspace.html" aria-label="Council home"><span className="wordmark-symbol" aria-hidden="true">C</span><span>Council</span></a>
    <div className="header-actions">
      {isWorkspace && <span className="local-status"><span aria-hidden="true" />Local & private</span>}
      {onOpenWorkspace && <button className="header-button" type="button" onClick={onOpenWorkspace}>Open Workspace <span aria-hidden="true">↗</span></button>}
    </div>
  </header>;
}
