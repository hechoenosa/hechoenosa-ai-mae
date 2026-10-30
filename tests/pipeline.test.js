// Logic tests with a fake model: `npm test`. No API key needed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { pipeline, codeChecks, loadKnowledge } from "../lib/pipeline.js";
import { parseJson } from "../lib/anthropic.js";

const kb = loadKnowledge(join(import.meta.dirname, "..", "knowledge"));

function fake({ gate = { area: "week1", lang: "en", problem: "other" }, answer = "Hey there! Click Settings, then Emails.", check = { on_topic: true, grounded: true, does_their_work: false } } = {}) {
  const calls = { answer: [] };
  return {
    calls,
    json: async (prompt) => (prompt.startsWith("Classify") ? gate : check),
    answer: async (system, messages, opts) => { calls.answer.push({ system, messages, opts }); return answer; },
  };
}
const run = (llm, extra = {}) => pipeline({ llm, kb, q: "help", who: "kids", c: { week: 1, step: 3 }, uiLang: "es", history: [], ...extra });

test("organisation question gets the fixed reply in Russian, the model never answers", async () => {
  const llm = fake({ gate: { area: "org", lang: "ru", problem: "other" } });
  const r = await run(llm, { q: "когда демо дэй?" });
  assert.equal(r.kind, "org"); assert.match(r.text, /Announcements/); assert.match(r.text, /[а-я]/);
  assert.equal(llm.calls.answer.length, 0);
});
test("off-topic gets the fixed reply in Spanish", async () => {
  const r = await run(fake({ gate: { area: "out", lang: "es", problem: "other" } }), { q: "tarea de mate" });
  assert.equal(r.kind, "out"); assert.match(r.text, /fuera/);
});
test("unknown language gets Spanish and English", async () => {
  const r = await run(fake({ gate: { area: "out", lang: "other", problem: "other" } }), { q: "hallo" });
  assert.match(r.text, /fuera/); assert.match(r.text, /outside/);
});
test("an answer with a date is blocked with a kind fallback", async () => {
  const r = await run(fake({ answer: "It's due Sunday 1 November!" }));
  assert.equal(r.kind, "fallback"); assert.ok(r.human); assert.doesNotMatch(r.text, /mentor/); assert.match(r.text, /different way/);
});
test("an answer linking an unknown site is blocked", async () => {
  const r = await run(fake({ answer: "Get it at https://free-vscode-download.ru/setup.exe" }));
  assert.equal(r.kind, "fallback");
});
test("official links pass", async () => {
  const r = await run(fake({ answer: "Get it at https://code.visualstudio.com and https://docs.github.com/en/desktop" }));
  assert.equal(r.kind, "answer");
});
test("not grounded in the pages → blocked", async () => {
  assert.equal((await run(fake({ check: { on_topic: true, grounded: false, does_their_work: false } }))).kind, "fallback");
});
test("did their Week 3 work → blocked", async () => {
  assert.equal((await run(fake({ check: { on_topic: true, grounded: true, does_their_work: true } }))).kind, "fallback");
});
test("[HUMAN] tag hands off and is hidden from the kid", async () => {
  const r = await run(fake({ answer: "That's outside what I know for now.\n[HUMAN]" }));
  assert.ok(r.human); assert.doesNotMatch(r.text, /HUMAN/);
});
test("version numbers are not dates", () => {
  assert.deepEqual(codeChecks("You should see git version 2.47.0."), []);
});
test("a screenshot goes to the stronger model", async () => {
  const llm = fake();
  await run(llm, { q: "", image: { data: "xx", mediaType: "image/png" } });
  assert.equal(llm.calls.answer[0].opts.tier, "default"); assert.ok(llm.calls.answer[0].opts.image);
});
test("text-only uses the fast model", async () => {
  const llm = fake();
  await run(llm);
  assert.equal(llm.calls.answer[0].opts.tier, "quick");
});
test("Week 3 questions only see Week 3 pages", async () => {
  const llm = fake({ gate: { area: "week3", lang: "en", problem: "week3-step" } });
  await run(llm);
  const sys = llm.calls.answer[0].system;
  assert.match(sys, /05-week-3/); assert.doesNotMatch(sys, /02-week-1/);
});
test("parents get the parent rules", async () => {
  const llm = fake();
  await run(llm, { who: "parents" });
  assert.match(llm.calls.answer[0].system, /your Builder/);
});
test("JSON is read even with extra words around it", () => {
  assert.deepEqual(parseJson('Sure:\n```json\n{"a":1}\n```'), { a: 1 });
  assert.deepEqual(parseJson('{"a":2} done'), { a: 2 });
});
