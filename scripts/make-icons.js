// Render the toolbar icons from the supplied Cerebro artwork.
// Uses ImageMagick, or the system image utility on macOS.
const { spawnSync, execFileSync } = require("node:child_process");
const path = require("node:path");

const icons = path.resolve(__dirname, "../icons");
const source = path.join(icons, "cerebro-logo.png");
const hasMagick = spawnSync("magick", ["-version"]).status === 0;
for (const size of [16, 48, 128]) {
  const target = path.join(icons, "icon-" + size + ".png");
  if (hasMagick) {
    execFileSync("magick", [source, "-resize", size + "x" + size, target]);
  } else {
    execFileSync("sips", ["-z", String(size), String(size), source, "--out", target]);
  }
}
