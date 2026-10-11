import { defineConfig, devices } from '@playwright/test';
import { ADMIN_UI_TEST_SECRET } from './tests/e2e/fixtures/admin-session';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROME_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROME_PATH }
      : {},
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: [
    {
      command: 'node tests/e2e/fixtures/catalog.mjs',
      port: 4000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        'bash scripts/package-next-standalone.sh web .tmp/e2e/web && HOSTNAME=127.0.0.1 PORT=3000 node .tmp/e2e/web/apps/web/server.js',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        'bash scripts/package-next-standalone.sh admin .tmp/e2e/admin && HOSTNAME=127.0.0.1 PORT=3001 node .tmp/e2e/admin/apps/admin/server.js',
      env: { AUTH_SECRET: ADMIN_UI_TEST_SECRET },
      url: 'http://localhost:3001/login',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
