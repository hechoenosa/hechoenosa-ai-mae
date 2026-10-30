// The real model behind AI-Mae: the Anthropic API.
// Model names can be changed in Vercel → Settings → Environment Variables without touching code.
import Anthropic from "@anthropic-ai/sdk";

const MODELS = {
  quick: process.env.AIMAE_MODEL_QUICK || "claude-haiku-5-5",
  default: process.env.AIMAE_MODEL_DEFAULT || "claude-sonnet-5-5",
};

export function parseJson(text) {
  try { return JSON.parse(text); } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) try { return JSON.parse(fence[1]); } catch {}
  const a = text.search(/[\[{]/), b = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  if (a >= 0 && b > a) try { return JSON.parse(text.slice(a, b + 1)); } catch {}
  throw new Error("model did not return JSON");
}

export function anthropicLLM(apiKey = process.env.ANTHROPIC_API_KEY) {
  const client = new Anthropic({ apiKey });
  const textOf = (r) => r.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
  return {
    async json(prompt, { tier = "quick" } = {}) {
      const r = await client.messages.create({
        model: MODELS[tier], max_tokens: 300,
        messages: [{ role: "user", content: prompt + "\n\nReply with the JSON only." }],
      });
      return parseJson(textOf(r));
    },
    async answer(system, messages, { tier = "quick", image } = {}) {
      const msgs = messages.map((m) => ({ role: m.role, content: m.content }));
      if (image) {
        const last = msgs[msgs.length - 1];
        last.content = [{ type: "image", source: { type: "base64", media_type: image.mediaType, data: image.data } }, { type: "text", text: last.content }];
      }
      const r = await client.messages.create({
        model: MODELS[tier], max_tokens: 600,
        // The knowledge pages are the same for every question in an area, so they are cached
        system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
        messages: msgs,
      });
      return textOf(r);
    },
  };
}
