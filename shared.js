// shared.js
const CEREBRO_BASE = "https://cerebro.frozo.ai";
const MCP_URL = `${CEREBRO_BASE}/mcp`;
const STORAGE_KEYS = ["apiKey", "defaultBucket", "defaultProject"];
const BUCKETS = ["decision", "observation", "learning", "todo", "question", "entity"];

async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEYS, (data) => resolve(data || {}));
  });
}

async function setSettings(update) {
  return new Promise((resolve) => {
    chrome.storage.local.set(update, resolve);
  });
}

// Call MCP memory_write. Returns { ok, memory_id?, warning?, error? }.
async function memoryWrite(apiKey, args) {
  const payload = {
    jsonrpc: "2.0",
    id: Date.now(),
    method: "tools/call",
    params: { name: "memory_write", arguments: args },
  };
  let res;
  try {
    res = await fetch(MCP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return { ok: false, error: "Network error — is cerebro.frozo.ai reachable?" };
  }
  let body;
  try { body = await res.json(); } catch {
    return { ok: false, error: `HTTP ${res.status} (non-JSON response)` };
  }
  if (body?.error) {
    return { ok: false, error: body.error.message || "MCP error" };
  }
  // MCP success — content[0].text usually carries either "Memory written. id: <mem_…>" or a JSON-encoded warning payload from B.1
  const text = body?.result?.content?.[0]?.text || "";
  const idMatch = text.match(/mem_\d{4}-\d{2}-\d{2}_[a-f0-9]{6}/);
  // B.1 near-duplicate warning is surfaced inline as a "warnings" field in the structured result; treat as soft signal
  const isWarning = /near[- ]?duplicate/i.test(text);
  return { ok: true, memory_id: idMatch ? idMatch[0] : null, warning: isWarning ? text : null, raw: text };
}
