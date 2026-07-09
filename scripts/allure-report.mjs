// scripts/allure-report.mjs
// ─────────────────────────────────────────────────────────────
// One-command Allure workflow:
//   1. Clean stale raw results (but KEEP the previous report's history so
//      the new report keeps its trend graphs).
//   2. Run the Playwright suite — the allure-playwright reporter writes
//      fresh raw results (+ environment.properties, categories.json) to
//      ./allure-results during the run.
//   3. Seed this run's results with the preserved history.
//   4. Generate the browsable HTML report into ./allure-report.
//   5. Open the report in the default browser.
//
// Steps 3-5 run even when tests fail, because a failing run is exactly
// when you want the report. Any CLI args are forwarded to Playwright, e.g.
//   npm run test:allure -- --project=desktop-chromium
//   npm run test:allure -- tests/Footer
// ─────────────────────────────────────────────────────────────
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, rmSync } from 'node:fs';

const RESULTS = 'allure-results';
const REPORT = 'allure-report';
const HISTORY_TMP = '.allure-history';

// `shell: true` lets npx/allure resolution work identically on Windows
// (cmd) and POSIX shells.
const run = (cmd, args) => spawnSync(cmd, args, { stdio: 'inherit', shell: true });

const forwarded = process.argv.slice(2);

// 1. Preserve previous trend history, then wipe stale raw results so the
//    report reflects ONLY this run (Playwright's reporter appends, it does
//    not clean the results dir itself).
rmSync(HISTORY_TMP, { recursive: true, force: true });
if (existsSync(`${REPORT}/history`)) {
  cpSync(`${REPORT}/history`, HISTORY_TMP, { recursive: true });
}
rmSync(RESULTS, { recursive: true, force: true });
console.log('🧹 Cleaned previous allure-results');

// 2. Run the Playwright suite.
console.log('\n▶  Running Playwright tests…');
const test = run('npx', ['playwright', 'test', ...forwarded]);

// The Allure command-line generator is a JVM app and needs Java 8+ on the
// PATH. Fail loud and clear rather than letting `allure` print an opaque error.
const hasJava = run('java', ['-version']).status === 0;
if (!hasJava) {
  console.error(
    '\n✖  Java was not found on your PATH, so the Allure HTML report cannot be generated.' +
      `\n   The test results ARE written to ./${RESULTS} — install Java 8+ and run` +
      '\n   `npm run allure:report` to render them.' +
      '\n   Install Java: https://adoptium.net/  (then re-open your terminal)\n',
  );
  process.exit(test.status ?? 0);
}

// 3. Seed this run's results with the preserved history (enables trends).
if (existsSync(HISTORY_TMP)) {
  cpSync(HISTORY_TMP, `${RESULTS}/history`, { recursive: true });
  rmSync(HISTORY_TMP, { recursive: true, force: true });
  console.log('📈 Restored trend history from the previous report');
}

// 4. Generate the HTML report.
console.log('\n▶  Generating Allure report…');
run('npx', ['allure', 'generate', RESULTS, '--clean', '-o', REPORT]);

// 5. Serve it on a fixed URL. `allure open` is a foreground web server
//    (the report is an Angular app that must be served over HTTP, not
//    file://). It stays running until you press Ctrl+C — that is normal,
//    not a hang. A fixed host/port means you always have a URL to open
//    manually at http://localhost:8080 if the browser doesn't auto-launch.
console.log('\n▶  Serving Allure report at http://localhost:8080  (Ctrl+C to stop)…');
run('npx', ['allure', 'open', '--host', 'localhost', '--port', '8080', REPORT]);

// Preserve the test run's exit code so CI still fails on test failures.
process.exit(test.status ?? 0);
