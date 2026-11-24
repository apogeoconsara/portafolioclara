# Sarahí Cruz Salazar — AI consulting landing page

React + TypeScript + Tailwind + Framer Motion (Vite). Independent of the Clara demo in the repo root.

```bash
cd sarahi-site && npm install
npm run dev      # local development
npm test         # KPI model tests
npm run build    # outputs dist/
```

Netlify: set **Base directory** to `sarahi-site` (build `npm run build`, publish `dist`); `netlify.toml` is included.
Before sharing, fill in `src/content/profile.ts` (LinkedIn, email). Empty values are not rendered.
