(async function init() {
  const bucketSel = document.getElementById("bucket");
  for (const b of BUCKETS) {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    bucketSel.appendChild(opt);
  }

  const settings = await getSettings();
  if (settings.defaultBucket) bucketSel.value = settings.defaultBucket;

  if (!settings.apiKey) {
    document.getElementById("missing-key").hidden = false;
    document.getElementById("send").disabled = true;
    document.getElementById("openOptions").addEventListener("click", (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });
    return;
  }

  // Pre-fill from active tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      document.getElementById("title").value = (tab.title || "").slice(0, 200);
      try {
        const [res] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => window.getSelection ? window.getSelection().toString() : "",
        });
        document.getElementById("body").value = res?.result || "";
      } catch {
        // some pages block scripting (chrome://, store pages) — leave body blank
      }
    }
  } catch {}

  document.getElementById("send").addEventListener("click", async () => {
    const status = document.getElementById("status");
    const sendBtn = document.getElementById("send");
    const settings = await getSettings();
    if (!settings.apiKey) {
      status.textContent = "Set the API key in options first.";
      status.className = "err";
      return;
    }
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const args = {
      bucket: bucketSel.value,
      title: (document.getElementById("title").value || "(web capture)").slice(0, 200),
      body: document.getElementById("body").value || "",
      tags: ["web-capture", `url:${tab?.url || ""}`],
      source: { connector_kind: "browser-ext", url: tab?.url || "" },
    };
    if (settings.defaultProject) args.project = settings.defaultProject;

    sendBtn.disabled = true;
    status.textContent = "Sending…";
    status.className = "";
    const result = await memoryWrite(settings.apiKey, args);
    sendBtn.disabled = false;
    if (!result.ok) {
      status.textContent = `Error: ${result.error}`;
      status.className = "err";
      return;
    }
    if (result.warning) {
      status.textContent = `Saved with warning: ${result.warning.slice(0, 80)}`;
      status.className = "warn";
    } else {
      status.textContent = `Saved: ${result.memory_id || "ok"}`;
      status.className = "ok";
    }
  });
})();
