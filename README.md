# Cerebro browser extension

Right-click any web page selection → ingest as a Cerebro memory. Or click the toolbar icon for a popup form pre-filled with the page's selection.

Built on Manifest V3. Plain JavaScript — no build step.

## Install (sideload, while we wait on store review)

### Chrome / Edge / Brave
1. Clone this repo or download the zip.
2. Open `chrome://extensions/` → enable Developer mode.
3. "Load unpacked" → pick this directory.
4. Pin the Cerebro icon → click → "Open extension options" → paste your API key from https://cerebro.frozo.ai/admin/mcp.

### Firefox
1. Clone this repo.
2. Open `about:debugging#/runtime/this-firefox` → "Load Temporary Add-on…" → pick `manifest.json`.
3. (Same options setup as above.)

## Configuration

Settings live in `chrome.storage.local` (never synced, never sent off-device except as part of the MCP write payload):

- **API key** — from `/admin/mcp` on cerebro.frozo.ai.
- **Default bucket** — what type of memory new captures default to (observation, decision, learning, etc.).
- **Default project slug** — optional. If unset, the default project tied to the API key receives the memory.

## How memories are written

Every capture issues a JSON-RPC `tools/call` to `memory_write` at `https://cerebro.frozo.ai/mcp`. Tags `web-capture` + `url:<page-url>` are attached automatically, and `source.connector_kind` is `browser-ext`.

The MCP's pre-write dedup (B.1) can return a near-duplicate warning — the popup surfaces this inline so you can decide whether to merge via `memory_supersede` after the fact.

## Privacy

Plain text only. No analytics. The API key + URL of the active tab are the only data leaving your browser — both go directly to your Cerebro instance.

## Roadmap

- v0.3 — bucket guess from page metadata (Open Graph + headings)
- v0.4 — submit to Chrome Web Store + Firefox AMO
- v1.0 — hover-link to past memories of the same domain

## License

MIT. The Cerebro Cloud product is proprietary; this extension is open-source for trust + Chrome Web Store policy alignment.
