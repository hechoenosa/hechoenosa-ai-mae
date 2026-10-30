// Runs on every Vercel deploy. If an edit broke something, the deploy stops here
// with a clear message, and the last working version stays live.
import { readFileSync, readdirSync } from "node:fs";

const problems = [];
let ui;
try { ui = JSON.parse(readFileSync("public/ui-text.json", "utf8")); }
catch (e) { console.error("\n✕ public/ui-text.json is not valid: " + e.message + "\n  Usually a missing comma or quote near that spot.\n"); process.exit(1); }

const langs = ui.languages.map((l) => l[0]);
const keys = Object.keys(ui.text.en);
for (const l of langs) {
  if (!ui.text[l]) { problems.push(`ui-text.json: no "${l}" section in "text"`); continue; }
  for (const k of keys) if (ui.text[l][k] === undefined) problems.push(`ui-text.json: "${l}" is missing "${k}"`);
  for (const k of ["gen6", "par"]) if (!Array.isArray(ui.text[l][k])) problems.push(`ui-text.json: "${l}" → "${k}" must be a list`);
  if (!String(ui.text[l].askWord).includes("{word}")) problems.push(`ui-text.json: "${l}" → "askWord" must contain {word}`);
}
for (const w of ui.words) for (const l of langs) if (!w[l]) problems.push(`ui-text.json: word "${w.term}" has no "${l}" explanation`);

const kb = readdirSync("knowledge").filter((f) => f.endsWith(".md"));
for (const p of ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10"]) if (!kb.some((f) => f.startsWith(p))) problems.push(`knowledge/: no file starting with ${p}`);
for (const f of kb) if (!readFileSync("knowledge/" + f, "utf8").startsWith("# ")) problems.push(`knowledge/${f}: must start with a "# Title" line`);

if (problems.length) { console.error("\n✕ Can't publish yet:\n  " + problems.join("\n  ") + "\n"); process.exit(1); }
console.log(`✓ ui-text.json and ${kb.length} knowledge pages look good`);
