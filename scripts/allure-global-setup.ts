// scripts/allure-global-setup.ts
// ─────────────────────────────────────────────────────────────
// Playwright globalSetup — runs ONCE before every `playwright test`
// invocation (however it is launched: full suite, a single spec, --grep,
// the VS Code runner, or `npm run test:allure`).
//
// The allure-playwright reporter APPENDS result files to ./allure-results;
// it never cleans them, and `allure generate --clean` only wipes the
// generated *report* folder — not the raw results. Without this hook, a
// run of one spec would still leave older specs' results behind, so the
// report would show every spec ever run. Clearing the results here makes
// each report reflect exactly the run that produced it.
//
// The `history` sub-folder (Allure trend data, seeded by
// scripts/allure-report.mjs) is preserved so trends survive across runs.
// ─────────────────────────────────────────────────────────────
import { existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const RESULTS_DIR = 'allure-results';

export default function globalSetup(): void {
  if (!existsSync(RESULTS_DIR)) return;

  let removed = 0;
  for (const entry of readdirSync(RESULTS_DIR)) {
    if (entry === 'history') continue; // keep trend history
    rmSync(path.join(RESULTS_DIR, entry), { recursive: true, force: true });
    removed += 1;
  }

  if (removed > 0) {
    // eslint-disable-next-line no-console
    console.log(`[allure] cleared ${removed} stale entr${removed === 1 ? 'y' : 'ies'} from ./${RESULTS_DIR} (kept history)`);
  }
}
