// Logic tests with a fake model: `npm test`. No API key needed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { pipeline, codeChecks, loadKnowledge } from "../lib/pipeline.js";
import { parseJson } from "../lib/anthropic.js";

const kb = loadKnowledge(join(import.meta.dirname, "..", "knowledge"));

function fake({ gate = { area: "week1", lang: "en", problem: "other" }, answer = "Hey there! Click Settings, then Emails.", answers, check = { on_topic: true, grounded: true, does_their_work: false }, checks } = {}) {
  const calls = { answer: [] };
  let j = 0;
  return {
    calls,
    json: async (prompt) => (prompt.startsWith("Classify") ? gate : checks ? checks[Math.min(j++, checks.length - 1)] : check),
    answer: async (system, messages, opts) => { calls.answer.push({ system, messages, opts }); return answers ? answers[Math.min(calls.answer.length - 1, answers.length - 1)] : answer; },
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
test("text answers also use the stronger model", async () => {
  const llm = fake();
  await run(llm);
  assert.equal(llm.calls.answer[0].opts.tier, "default");
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

test("a blocked first answer gets one rewrite and the rewrite is shown", async () => {
  const llm = fake({ answers: ["Long answer. ".repeat(120), "Ask a parent to help you make a free email, then go back to github.com/signup."] });
  const r = await run(llm, { q: "i dont have an email", c: { week: 1, step: 2 } });
  assert.equal(r.kind, "answer"); assert.equal(llm.calls.answer.length, 2);
  assert.match(llm.calls.answer[1].messages.at(-1).content, /too long/);
});
test("checker says not grounded twice → kind fallback after one rewrite", async () => {
  const llm = fake({ check: { on_topic: true, grounded: false, does_their_work: false } });
  const r = await run(llm);
  assert.equal(r.kind, "fallback"); assert.equal(llm.calls.answer.length, 2);
});
test("Step 2 knowledge covers a Builder with no email", () => {
  assert.match(kb.find((f) => f.name.startsWith("02")).text, /No email yet/);
});
test("Week 3 sees the field week guide with safety rules", async () => {
  const llm = fake({ gate: { area: "week3", lang: "en", problem: "interviews" } });
  await run(llm, { c: { week: 3, step: 4 } });
  const sys = llm.calls.answer[0].system;
  assert.match(sys, /13-field-week/); assert.match(sys, /adult they trust is always nearby/);
});
