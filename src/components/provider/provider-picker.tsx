import { PROVIDER_DETAILS } from "../../shared/constants";
import { PROVIDER_IDS, type ProviderConnection, type ProviderId } from "../../shared/types";

interface ProviderPickerProps { connections: ProviderConnection[]; selectedProviders: ProviderId[]; onSelectionChange(selected: ProviderId[]): void; onOpen(providerId: ProviderId): void }
export function ProviderPicker({ connections, selectedProviders, onSelectionChange, onOpen }: ProviderPickerProps) {
  return <div className="provider-list" role="group" aria-label="Council providers">
    {PROVIDER_IDS.map((providerId) => {
      const connection = connections.find((item) => item.providerId === providerId);
      const isSelected = selectedProviders.includes(providerId);
      const toggleSelection = () => onSelectionChange(isSelected ? selectedProviders.filter((id) => id !== providerId) : [...selectedProviders, providerId]);
      const providerStatus = connection?.status ?? "not_open";
      return <div className={`provider-row ${isSelected ? "is-selected" : ""}`} key={providerId}>
        <div className="provider-row-main">
          <button className="provider-select" type="button" aria-pressed={isSelected} onClick={toggleSelection}>
            <span className="provider-mark" aria-hidden="true">{isSelected ? "✓" : ""}</span>
            <span className="provider-identity"><strong>{PROVIDER_DETAILS[providerId].name}</strong><small>{connection?.diagnostics?.currentUrl ? new URL(connection.diagnostics.currentUrl).hostname : "No connected tab"}</small></span>
          </button>
          <span className={`status-label status-${providerStatus}`}><span className="status-dot" />{providerStatus.replaceAll("_", " ")}</span>
          {(providerStatus === "not_open" || providerStatus === "error") && <button className="quiet-button" type="button" onClick={() => onOpen(providerId)}>{providerStatus === "error" ? "Focus Tab" : "Open"}</button>}
        </div>
        {(connection?.error || connection?.diagnostics) && <details className="provider-diagnostics">
          <summary>{connection.error ? "Connection error" : "Connection details"}</summary>
          {connection.error && <p className="diagnostic-error">{connection.error}</p>}
          {connection.recoveryAction && <p><strong>Fix:</strong> {connection.recoveryAction}</p>}
          {connection.diagnostics && <dl><div><dt>Script</dt><dd>{connection.diagnostics.contentScriptState}</dd></div><div><dt>Page</dt><dd>{connection.diagnostics.documentState ?? "unknown"}</dd></div><div><dt>Selector</dt><dd>{connection.diagnostics.matchedSelector ?? "none matched"}</dd></div><div><dt>Tab</dt><dd>{connection.tabId ?? "none"}</dd></div></dl>}
        </details>}
      </div>;
    })}
  </div>;
}
