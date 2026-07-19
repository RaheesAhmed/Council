import { registerMessageRouter } from "./message-router";

chrome.runtime.onInstalled.addListener(() => {
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});
registerMessageRouter();
