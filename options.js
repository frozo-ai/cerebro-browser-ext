(async function init() {
  // populate bucket dropdown
  const sel = document.getElementById("defaultBucket");
  for (const b of BUCKETS) {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    sel.appendChild(opt);
  }

  const settings = await getSettings();
  if (settings.apiKey) document.getElementById("apiKey").value = settings.apiKey;
  if (settings.defaultBucket) sel.value = settings.defaultBucket;
  if (settings.defaultProject) document.getElementById("defaultProject").value = settings.defaultProject;

  document.getElementById("save").addEventListener("click", async () => {
    const update = {
      apiKey: document.getElementById("apiKey").value.trim(),
      defaultBucket: sel.value,
      defaultProject: document.getElementById("defaultProject").value.trim(),
    };
    await setSettings(update);
    const status = document.getElementById("status");
    status.textContent = "Saved.";
    status.className = "status-ok";
    setTimeout(() => { status.textContent = ""; status.className = ""; }, 2000);
  });
})();
