# AI-Mae · Hecho en Osa help desk

AI-Mae is the junior AI help desk for the Hecho en Osa Hackathon + Science Fair 2026 assignments. Builders and their families open one link, pick their week and step, type what happened and add a screenshot. Five languages: Spanish, English, Russian, French, Hebrew.

## Change what AI-Mae says (no code)

| To change | Edit this file on github.com |
|---|---|
| What AI-Mae knows (steps, fixes, rules) | `knowledge/*.md` |
| How AI-Mae behaves and talks | `knowledge/00-ai-mae-rules.md` |
| Buttons, greetings, the Words tab | `public/ui-text.json` |

Click the file → pencil icon → edit → **Commit changes**. Vercel publishes it in about a minute. If an edit breaks something (a missing comma in `ui-text.json`, say), Vercel stops the deploy, shows what's wrong, and the last working version stays live.

## How an answer is made

1. **Sort the question.** A fast model labels it: Week 1, Week 3, general help, organisation, off-topic, or someone who seems upset. Organisation and off-topic questions get a fixed reply, word for word, in the Builder's language.
2. **Answer from our pages only.** Each area loads only its own knowledge pages.
3. **Check before showing.** Code blocks any date, any link outside the official list, and long answers. A second model checks the answer is on topic, comes from our pages, and doesn't do a Builder's Week 3 work for them. If anything fails, the Builder is told to take a screenshot and reach out to their mentor.

Nothing a Builder types or uploads is stored. Logs only count which area and language a question was. Screenshots are shrunk on the Builder's phone and sent once.

## Setup (one time)

1. **Anthropic:** console.anthropic.com → add credit → **Settings → Limits** → set a monthly spend limit → **API Keys** → create a key. Keep it secret.
2. **Vercel:** **Add New → Project** → import `hechoenosa/hechoenosa-ai-mae` → before deploying, open **Environment Variables** and add `ANTHROPIC_API_KEY` = your key → **Deploy**.
3. **Name the link:** Project → **Settings → Domains** → edit the `.vercel.app` name, for example `ai-mae-hechoenosa.vercel.app`.

Optional settings (Environment Variables): `AIMAE_LIMIT_PER_HOUR` (questions per device per hour, default 30), `AIMAE_MODEL_QUICK`, `AIMAE_MODEL_DEFAULT`.

## Tests

- `npm test`: 15 logic tests with a fake model. No key needed.
- `ANTHROPIC_API_KEY=… npm run eval`: 12 real questions through the real model, graded. A few cents per run.
- Add `#debug` to the link to see the checks under each answer.
