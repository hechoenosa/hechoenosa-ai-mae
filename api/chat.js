// POST /api/chat — the only server code. The API key stays here, never in the browser.
// Nothing a child types or uploads is stored. Logs hold only counts (area, language, result).
import { join } from "node:path";
import { pipeline, loadKnowledge, pick, LANGS } from "../lib/pipeline.js";
import { anthropicLLM } from "../lib/anthropic.js";

const KB = loadKnowledge(join(process.cwd(), "knowledge"));
const LIMIT_PER_HOUR = Number(process.env.AIMAE_LIMIT_PER_HOUR || 30);
const hits = new Map(); // best effort, per server instance

function limited(ip) {
  const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < 3600e3);
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > LIMIT_PER_HOUR;
}

function clean(body) {
  const q = typeof body.q === "string" ? body.q.slice(0, 1500) : "";
  const who = body.who === "parents" ? "parents" : "kids";
  const lang = LANGS.includes(body.lang) ? body.lang : "es";
  const c = body.ctx && typeof body.ctx === "object" ? body.ctx : {};
  const ctx = {
    week: [1, 3, "general"].includes(c.week) ? c.week : null,
    step: Number.isInteger(c.step) && c.step > 0 && c.step < 20 ? c.step : null,
    os: typeof c.os === "string" ? c.os.slice(0, 40) : null,
    tries: Number.isInteger(c.tries) ? Math.min(c.tries, 9) : 0,
  };
  const history = Array.isArray(body.history) ? body.history.slice(-10)
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 3000) })) : [];
  while (history.length && history[0].role !== "user") history.shift();
  let image = null;
  if (body.image && typeof body.image.data === "string" && ["image/png", "image/jpeg", "image/webp"].includes(body.image.mediaType) && body.image.data.length < 2_800_000) {
    image = { data: body.image.data, mediaType: body.image.mediaType };
  }
  return { q, who, lang, ctx, history, image };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const { q, who, lang, ctx, history, image } = clean(body);
  if (!q && !image) return res.status(400).json({ error: "empty" });
  if (limited(ip)) return res.status(429).json({ kind: "limit", text: pick("fallback", lang) });
  try {
    const r = await pipeline({ llm: anthropicLLM(), kb: KB, q, image, who, c: ctx, uiLang: lang, history });
    console.log(JSON.stringify({ kind: r.kind, area: r.gate?.area, lang: r.gate?.lang, problem: r.gate?.problem, image: !!image }));
    res.status(200).json({ kind: r.kind, text: r.text, human: r.human, checks: r.checks, user: r.user || null });
  } catch (e) {
    console.error("pipeline error", e?.status || "", e?.message || e);
    res.status(502).json({ kind: "error", text: pick("fallback", lang) });
  }
}
