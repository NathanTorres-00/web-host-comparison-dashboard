# Web Host Comparison Dashboard

Interactive decision-support UI to compare 10 major web hosting providers with:

- Adjustable **weights** (price, security, ease, support, performance)
- **Scenario presets** (balanced, budget-first, security-first, ease-first)
- **Weighted scores** with a documented formula
- **Sortable/filterable** comparison table, **pin** rows, **hide uniform columns**
- **Top 3** recommendations with sub-score breakdown
- **Sources & caveats** (illustrative pricing — verify before purchase)

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

```bash
npm run build   # production build → dist/
npm run preview # serve dist
```

Data is static in `src/data/hosts.ts`. Scoring logic lives in `src/lib/scoring.ts`.
