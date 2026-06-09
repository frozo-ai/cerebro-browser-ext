// background.js — service worker for Manifest V3
importScripts("shared.js");

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "send-to-cerebro",
    title: "Send selection to Cerebro",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "send-to-cerebro") return;
  const settings = await getSettings();
  if (!settings.apiKey) {
    chrome.runtime.openOptionsPage();
    return;
  }
  const title = (tab.title || "(web capture)").slice(0, 200);
  const body = info.selectionText || "";
  const args = {
    bucket: settings.defaultBucket || "observation",
    title,
    body,
    tags: ["web-capture", `url:${tab.url || ""}`],
    source: { connector_kind: "browser-ext", url: tab.url || "" },
  };
  if (settings.defaultProject) args.project = settings.defaultProject;

  const result = await memoryWrite(settings.apiKey, args);
  // Show notification via a temp action badge — service workers can't show notification API without permission
  const badge = result.ok ? (result.warning ? "!" : "✓") : "x";
  const color = result.ok ? (result.warning ? "#f59e0b" : "#10b981") : "#ef4444";
  chrome.action.setBadgeText({ text: badge });
  chrome.action.setBadgeBackgroundColor({ color });
  setTimeout(() => chrome.action.setBadgeText({ text: "" }), 4000);
});
