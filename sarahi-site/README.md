# Sarahí Cruz Salazar: AI consulting portfolio

The landing page (hero, video interview, consulting approach, selected experience) plus an interactive workbench for a hypothetical bank (`#discover`, `#design`, `#implement`, `#adopt`, `#optimize`, `#questions`).

React + TypeScript + Tailwind (Vite). A hypothetical scenario: plan an AI customer-service rollout for a fictional bank, test a guarded assistant, and see simulated impact. Independent of the Clara demo in the repo root.

```bash
npm install
npm run dev      # local development (rule-based mode)
npm test         # planner, assistant rules, grounding check
npm run build    # outputs dist/
```

## Claude mode (optional)

The assistant works without any key, using rules only. To enable Claude on Netlify:

1. Site settings → Environment variables → add `ANTHROPIC_API_KEY`. The key stays on the server, in `netlify/functions/claude.mjs`.
2. Optional: `AI_MODEL_FAST` (default `claude-haiku-5-5`), `AI_MODEL_SMART` (default `claude-sonnet-5-5`), `AI_RATE_LIMIT` (requests per IP per 10 minutes, default 30).
3. In the Anthropic console, set a monthly spend limit: the site is public.

Claude is used for four fixed jobs only: classify an unclear customer message, rewrite approved text in the customer's language, answer a free-text client question from the prepared notes on the Client questions page, and draft a client summary from the plan. Sensitive topics never reach the model, and a grounding check rejects replies that add facts or numbers. Prompts live in `netlify/functions/_prompts.mjs` and are shown in the UI.

## Deploy

Netlify: set **Base directory** to `sarahi-site` (build `npm run build`, publish `dist`, functions `netlify/functions`; all in `netlify.toml`).
Before sharing, fill in `src/content/profile.ts`. Videos: see `public/videos/README.md`. Experience cards live in `src/content/portfolio.ts`; confirm each one before publishing.
