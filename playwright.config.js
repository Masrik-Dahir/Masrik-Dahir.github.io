// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:8765',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10000,
    // The war-mode tests drive a requestAnimationFrame-based battle simulation.
    // When several headless pages run in parallel, Chromium throttles rAF and
    // timers in the non-focused (backgrounded) renderers, which starves the
    // sim and makes those tests flaky. These flags keep every page running at
    // full speed so the suite is deterministic regardless of worker count.
    launchOptions: {
      args: [
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
      ],
    },
  },
  webServer: {
    command: 'npx http-server . -p 8765 -s',
    port: 8765,
    reuseExistingServer: true,
    timeout: 15000,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
