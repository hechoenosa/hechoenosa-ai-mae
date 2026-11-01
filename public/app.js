// AI-Mae chat page. All words people see come from ui-text.json, so they can be edited without code.
(async () => {
const $ = (id) => document.getElementById(id);
const log = $("log"), chips = $("chips");
const UI = await fetch("/ui-text.json").then((r) => r.json());
const T = UI.text, WORDS = UI.words, STEPS = UI.steps, OS_STEPS = UI.steps_that_ask_mac_or_windows;
const debug = location.hash === "#debug";
if (debug) document.body.classList.add("debug");

let lang = "es", mode = "kids", turns = [], ctx = { week: null, step: null, os: null }, shot = null, word = null, busy = false;
const tries = {};
try { const l = localStorage.getItem("aimae-lang"); if (l && T[l]) lang = l; } catch {}
const t = (k) => T[lang][k];

function linkify(el, text) {
  for (const part of text.split(/(https?:\/\/[^\s)]+)/g)) {
    if (/^https?:\/\//.test(part)) { const a = document.createElement("a"); a.href = part; a.target = "_blank"; a.rel = "noopener"; a.textContent = part.replace(/^https:\/\//, ""); el.append(a); }
    else el.append(part);
  }
}
function bubble(who, text, img) {
  const d = document.createElement("div"); d.className = "msg " + who; d.dir = "auto";
  if (img) { const i = document.createElement("img"); i.src = img; i.alt = ""; d.append(i); }
  if (text) { const s = document.createElement("span"); linkify(s, text); d.append(s); }
  log.append(d); log.scrollTop = log.scrollHeight; return d;
}
function render(d, text) { d.textContent = ""; d.classList.remove("thinking"); linkify(d, text); log.scrollTop = log.scrollHeight; }
function handoff() {
  const h = document.createElement("div"); h.className = "handoff"; h.dir = "auto";
  const b = document.createElement("b"); b.textContent = t("sent");
  const s = document.createElement("span"); s.textContent = t("sentD");
  h.append(b, s); log.append(h); log.scrollTop = log.scrollHeight;
}
function trace(el, rows) {
  if (!rows) return;
  const d = document.createElement("div"); d.className = "trace";
  for (const [ok, label] of rows) { const s = document.createElement("span"); s.className = ok ? "ok" : "bad"; s.textContent = (ok ? "✓ " : "✕ ") + label; d.append(s); }
  el.after(d);
}
let backFn = null;
function setChips(items, back = backFn) {
  chips.textContent = "";
  if (back) items = [...items, [t("back"), back]];
  for (const [label, fn, num] of items) {
    if (fn === "heading") { const h = document.createElement("div"); h.className = "tier"; h.textContent = label; chips.append(h); continue; }
    const b = document.createElement("button"); b.type = "button"; b.dir = "auto";
    if (num) { const n = document.createElement("b"); n.textContent = num; b.append(n); }
    b.append(label); b.onclick = fn; chips.append(b);
  }
}
function showCtx() {
  const c = $("ctx"); c.textContent = "";
  if (mode !== "kids" || !ctx.week) return;
  const parts = [ctx.week === "general" ? t("gen") : t("w" + ctx.week)];
  if (ctx.step) parts.push(t("stepW") + " " + ctx.step);
  if (ctx.os) parts.push(ctx.os);
  for (const p of parts) { const b = document.createElement("b"); b.textContent = p; c.append(b); }
}
const osChips = () => [["Mac", () => pickOS("Mac")], ["Windows", () => pickOS("Windows")], [t("other"), () => pickOS("Chromebook, tablet or phone")]];

function weekMenu() {
  backFn = null;
  setChips([[t("w1"), () => pickWeek(1)], [t("w3"), () => pickWeek(3)], [t("gen"), pickGeneral]], null);
}
function stepMenu(w) {
  ctx = { week: w, step: null, os: null }; showCtx();
  backFn = weekMenu;
  const tiers = (UI.tiers || {})[w];
  const chip = (i) => [STEPS[w][i - 1], () => pickStep(i), String(i)];
  if (!tiers) return setChips(STEPS[w].map((n, i) => chip(i + 1)));
  setChips(tiers.flatMap((tr) => [[t(tr.key), "heading"], ...tr.steps.map(chip)]));
}
function pickWeek(w) {
  bubble("me", t("w" + w)); bubble("bot", t("step"));
  stepMenu(w);
}
function pickGeneral() {
  ctx = { week: "general", step: null, os: null }; showCtx();
  bubble("me", t("gen")); bubble("bot", t("genQ"));
  backFn = weekMenu;
  setChips(t("gen6").map((g) => [g, () => ask(g)]));
}
function pickStep(n) {
  ctx.step = n; showCtx();
  const k = ctx.week + "-" + n; tries[k] = (tries[k] || 0) + 1;
  bubble("me", t("stepW") + " " + n + " · " + STEPS[ctx.week][n - 1]);
  const w = ctx.week; backFn = () => stepMenu(w);
  if ((OS_STEPS[ctx.week] || []).includes(n)) { bubble("bot", t("os")); setChips([...osChips(), [t("notSure"), osHelp]]); }
  else askWhat();
}
function osHelp() { bubble("me", t("notSure")); bubble("bot", t("osHelp")); setChips(osChips()); }
function pickOS(o) { ctx.os = o; showCtx(); bubble("me", o); askWhat(); }
function askWhat() { setChips([]); bubble("bot", t("what")); $("q").focus(); }
function greet() {
  log.textContent = ""; turns = []; ctx = { week: null, step: null, os: null }; showCtx(); clearShot();
  const intro = document.createElement("div"); intro.className = "intro"; intro.dir = "ltr";
  const st = document.createElement("strong"); st.textContent = "Hackathon + Science Fair 2026";
  const rule = document.createElement("i");
  intro.append(st, rule); log.append(intro);
  if (mode === "kids") { bubble("bot", t("greetK")); weekMenu(); }
  else { backFn = null; bubble("bot", t("greetP")); setChips(t("par").map((c) => [c, () => ask(c)]), null); }
}

function paint() {
  document.documentElement.lang = lang;
  $("screen").dir = lang === "he" ? "rtl" : "ltr";
  $("v-help-t").textContent = t("help"); $("v-words-t").textContent = t("words"); $("v-kit-t").textContent = UI.kit[lang].tab;
  $("fam-t").textContent = t("fam"); $("restart").textContent = t("restart"); $("human").textContent = t("person"); $("guides").textContent = t("guides");
  $("q").placeholder = mode === "kids" ? t("phK") : t("phP");
  $("attach").setAttribute("aria-label", t("attach")); $("attach").title = t("attach");
  $("shot-t").textContent = t("shotT"); $("shot-x").textContent = t("remove");
  $("ws").placeholder = t("ws"); $("whint").textContent = t("whint"); $("wask").textContent = t("wask"); $("wrand").textContent = t("wrand");
  for (const b of $("langs").children) b.setAttribute("aria-pressed", b.dataset.l === lang);
  drawWords(); if (word) showWord(word); drawKit();
}
const NAMES = { es: "Español", en: "English", ru: "Русский", fr: "Français", he: "עברית" };
for (const [code, label] of UI.languages) {
  const b = document.createElement("button"); b.type = "button"; b.dataset.l = code; b.textContent = label; b.setAttribute("aria-label", NAMES[code] || code);
  b.onclick = () => { lang = code; try { localStorage.setItem("aimae-lang", code); } catch {} paint(); greet(); };
  $("langs").append(b);
}
function view(v) {
  for (const k of ["help", "kit", "words"]) { $("p-" + k).hidden = v !== k; $("v-" + k).setAttribute("aria-selected", v === k); }
}
for (const k of ["help", "kit", "words"]) $("v-" + k).onclick = () => view(k);
$("fam").onclick = () => { mode = mode === "kids" ? "parents" : "kids"; $("phone").classList.toggle("parents", mode === "parents"); $("fam").setAttribute("aria-pressed", mode === "parents"); paint(); greet(); };

// Words tab
function drawWords() {
  const q = $("ws").value.trim().toLowerCase(), list = $("wlist"); list.textContent = "";
  for (const [group, label] of [["ideas", "wIdeas"], ["computer", "wComputer"]]) {
    const items = WORDS.filter((w) => (w.group || "computer") === group && (!q || w.term.toLowerCase().includes(q) || (w[lang] || "").toLowerCase().includes(q) || ((w.name && w.name[lang]) || "").toLowerCase().includes(q)));
    if (!items.length) continue;
    const h = document.createElement("h4"); h.className = "wgroup"; h.textContent = t(label); list.append(h);
    if (group === "ideas" && !q) { const m = document.createElement("p"); m.className = "motto"; m.textContent = t("motto"); list.append(m); }
    const row = document.createElement("div"); row.className = "wrow";
    for (const w of items) {
      const b = document.createElement("button"); b.type = "button"; b.dir = "auto"; b.dataset.term = w.term; b.textContent = (w.name && w.name[lang]) || w.term; b.setAttribute("aria-pressed", word === w.term); b.onclick = () => showWord(w.term); row.append(b);
    }
    list.append(row);
  }
}
function showWord(term) {
  word = term; const w = WORDS.find((x) => x.term === term);
  $("wcard").hidden = false; $("wterm").textContent = (w.name && w.name[lang]) || term; $("wdef").textContent = w[lang] || w.en;
  for (const b of $("wlist").querySelectorAll("button")) b.setAttribute("aria-pressed", b.dataset.term === term);
}
$("ws").oninput = drawWords;
$("wrand").onclick = () => { const o = WORDS.filter((x) => x.term !== word); showWord(o[Math.floor(Math.random() * o.length)].term); };
$("wask").onclick = () => { if (!word) return; view("help"); ctx = { week: "general", step: null, os: null }; showCtx(); backFn = weekMenu; ask(t("askWord").replace("{word}", $("wterm").textContent)); };

// Field kit tab (Week 3): a trail of the 5 ideas + interview cards to read from in the field
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const STOP_STEP = [3, 3, 3, 4, 5];
let openStop = -1;
function drawKit() {
  const K = UI.kit[lang];
  $("k-title").textContent = K.title; $("k-sub").textContent = K.sub;
  $("k-start-t").textContent = K.start; $("k-start-s").textContent = K.startSub;
  $("k-rules-t").textContent = K.rulesT; $("k-motto").textContent = K.motto;
  $("k-rules").replaceChildren(...K.rules.map((r) => el("li", null, r)));
  $("k-trail").replaceChildren(...K.stops.map((st, i) => {
    const li = el("li"); li.append(el("span", "num", String(i + 1)));
    const b = el("button", "stop"); b.type = "button"; b.setAttribute("aria-expanded", openStop === i);
    b.append(el("span", "e", st.e), el("span", null, st.t), el("span", "chev", "›"));
    b.onclick = () => { openStop = openStop === i ? -1 : i; drawKit(); };
    li.append(b);
    if (openStop === i) {
      const body = el("div", "sbody"); body.append(el("p", null, st.what));
      if (i === 1) body.append(ladder(K));
      else { const ex = el("p", "ex"); ex.append(el("span", "lab", K.exT), st.ex); body.append(ex); }
      const turn = el("p", "turn"); turn.append(el("span", "lab", K.turnT), st.turn); body.append(turn);
      const go = el("button", "go", K.askBtn); go.type = "button";
      go.onclick = () => { view("help"); ctx = { week: 3, step: STOP_STEP[i], os: null }; showCtx(); backFn = () => stepMenu(3); ask(K.ask.replace("{x}", st.t)); };
      body.append(go); li.append(body);
    }
    return li;
  }));
}
function ladder(K) {
  const box = el("div", "ladder"); let n = 1;
  const btn = el("button", null, K.why); btn.type = "button";
  const draw = () => {
    box.replaceChildren(...K.ladder.slice(0, n).map((x, j) => el("span", j === K.ladder.length - 1 ? "real" : null, x)));
    if (n < K.ladder.length) box.prepend(btn);
  };
  btn.onclick = () => { n++; draw(); };
  draw(); return box;
}
$("k-start").onclick = () => { ivLang = lang; ivAt = 0; ivOk = new Set(); $("iv").hidden = false; drawIv(); };
$("iv-x").onclick = () => { $("iv").hidden = true; };

// Interview mode: safety check → hello → 5 questions → thank you → write it down
let ivLang = "es", ivAt = 0, ivOk = new Set();
function drawIv() {
  const K = UI.kit[ivLang], V = K.iv, ui = UI.kit[lang].iv, total = V.questions.length + 4;
  $("iv").dir = ivLang === "he" ? "rtl" : "ltr";
  $("iv-dots").replaceChildren(...Array.from({ length: total }, (_, j) => el("i", j <= ivAt ? "on" : null)));
  $("iv-lang").replaceChildren(...[...new Set([lang, "es", "en"])].map((l) => {
    const b = el("button", null, l.toUpperCase()); b.type = "button"; b.setAttribute("aria-pressed", l === ivLang);
    b.title = ui.askIn + " " + l.toUpperCase(); b.onclick = () => { ivLang = l; drawIv(); }; return b;
  }));
  $("iv-x").setAttribute("aria-label", ui.close);
  const card = $("iv-card"), deeper = $("iv-deeper"); card.replaceChildren(); deeper.replaceChildren();
  const q = ivAt - 2;
  if (ivAt === 0) {
    card.append(el("span", "lab", V.safetyT));
    V.safety.forEach((s, j) => {
      const lab = el("label"), c = el("input"); c.type = "checkbox"; c.checked = ivOk.has(j);
      c.onchange = () => { c.checked ? ivOk.add(j) : ivOk.delete(j); $("iv-next").disabled = ivOk.size < V.safety.length; };
      lab.append(c, s); card.append(lab);
    });
  } else if (ivAt === 1) card.append(el("span", "lab", V.openerT), el("p", "big", V.opener));
  else if (q < V.questions.length) {
    card.append(el("span", "lab", V.qT + " " + (q + 1) + " / " + V.questions.length), el("p", "big", V.questions[q]));
    if (q === 0) card.append(el("p", "never", V.never));
    deeper.append(el("b", null, V.deeperT), ...V.deeper.map((d) => el("span", null, d)));
  } else if (ivAt === total - 2) card.append(el("span", "lab", V.thanksT), el("p", "big", V.thanks));
  else { const ol = el("ol"); ol.append(...V.after.map((a) => el("li", null, a))); card.append(el("span", "lab", V.afterT), ol); }
  const back = $("iv-back"), next = $("iv-next");
  back.textContent = ui.back; back.hidden = ivAt === 0;
  next.textContent = ivAt === 0 ? ui.go : ivAt === total - 1 ? ui.done : ui.next;
  next.disabled = ivAt === 0 && ivOk.size < V.safety.length;
}
$("iv-back").onclick = () => { ivAt = Math.max(0, ivAt - 1); drawIv(); };
$("iv-next").onclick = () => { const total = UI.kit[ivLang].iv.questions.length + 4; if (ivAt >= total - 1) { $("iv").hidden = true; return; } ivAt++; drawIv(); };

// Screenshots: shrunk on the phone before sending, never stored
function clearShot() { shot = null; $("shot").hidden = true; $("file").value = ""; }
async function shrink(file) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas"); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  const url = c.toDataURL("image/jpeg", 0.85);
  return { url, data: url.split(",")[1], mediaType: "image/jpeg" };
}
$("attach").onclick = () => $("file").click();
$("file").onchange = async () => {
  const f = $("file").files[0]; if (!f) return;
  try { shot = await shrink(f); $("shot-img").src = shot.url; $("shot").hidden = false; } catch { clearShot(); }
};
$("shot-x").onclick = clearShot;

async function ask(q) {
  q = (q || "").trim(); if ((!q && !shot) || busy) return;
  busy = true; $("send").disabled = true;
  const img = shot; clearShot(); setChips([]);
  $("q").value = ""; bubble("me", q, img?.url);
  const out = bubble("bot", ""); out.classList.add("thinking"); out.textContent = t("thinking");
  const k = ctx.week + "-" + ctx.step;
  try {
    const r = await fetch("/api/chat", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ q, image: img ? { data: img.data, mediaType: img.mediaType } : null, who: mode, ctx: { ...ctx, tries: tries[k] || 0 }, lang, history: turns }),
    }).then((x) => x.json());
    render(out, r.text || t("sentD"));
    if (r.kind === "answer" && r.user) turns.push({ role: "user", content: r.user }, { role: "assistant", content: r.text });
    if (debug) trace(out, r.checks);
    if (mode === "kids") setChips([]);
  } catch {
    render(out, T[lang].sentD);
  } finally { busy = false; $("send").disabled = false; }
}

$("f").addEventListener("submit", (e) => { e.preventDefault(); ask($("q").value); });
$("restart").onclick = greet;
$("human").onclick = () => { bubble("me", t("wantPerson")); handoff(); };

// Faint palm fronds behind liquid glass
function fronds(cv, seed) {
  const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
  if (!r.width) return;
  cv.width = r.width * dpr; cv.height = r.height * dpr;
  const c = cv.getContext("2d"); c.scale(dpr, dpr);
  c.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--frond").trim() || "#0d6f73";
  let x = seed; const rnd = () => (x = (x * 16807) % 2147483647) / 2147483647;
  const W = r.width, H = r.height, S = Math.max(W, H);
  const set = [[W * 1.02, H * .08, Math.PI * .82, S * .62], [-W * .04, H * .55, -Math.PI * .12, S * .55], [W * .98, H * .92, Math.PI * 1.1, S * .5], [W * .15, H * 1.04, -Math.PI * .38, S * .45], [W * .55, -H * .03, Math.PI * .55, S * .4]];
  for (const [fx, fy, ang, len] of set) {
    const bend = (rnd() - .5) * .9, n = 34;
    const pt = (t) => { const a = ang + bend * t * t; return [fx + Math.cos(ang) * len * t + Math.cos(a + Math.PI / 2) * len * .18 * bend * t * t, fy + Math.sin(ang) * len * t + Math.sin(a + Math.PI / 2) * len * .18 * bend * t * t]; };
    c.beginPath(); c.lineWidth = 2.2; c.strokeStyle = c.fillStyle; const p0 = pt(0); c.moveTo(p0[0], p0[1]);
    for (let i = 1; i <= n; i++) { const p = pt(i / n); c.lineTo(p[0], p[1]); } c.stroke();
    for (let i = 2; i < n; i++) {
      const t = i / n, [px, py] = pt(t), [qx, qy] = pt(Math.min(1, t + .01)), dir = Math.atan2(qy - py, qx - px);
      const L = len * .3 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15)), .8) * (1 - t * .35);
      for (const side of [-1, 1]) {
        const a = dir + side * (.95 - .25 * t) + .18 * side * rnd(), w = L * .085;
        const tx = px + Math.cos(a) * L, ty = py + Math.sin(a) * L, nx = Math.cos(a + Math.PI / 2) * w, ny = Math.sin(a + Math.PI / 2) * w;
        const mx = px + Math.cos(a) * L * .45, my = py + Math.sin(a) * L * .45;
        c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(mx + nx, my + ny, tx, ty); c.quadraticCurveTo(mx - nx, my - ny, px, py); c.fill();
      }
    }
  }
}
function drawJungle() { fronds($("jungle"), 7); fronds($("page-jungle"), 19); }
let jt; addEventListener("resize", () => { clearTimeout(jt); jt = setTimeout(drawJungle, 150); });
matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", drawJungle);

paint(); greet(); drawJungle();
})();
