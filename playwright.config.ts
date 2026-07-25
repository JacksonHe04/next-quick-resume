import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const local = !process.env.BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: local
    ? [
        {
          name: "Cloudflare D1 gateway",
          command: "pnpm dev:worker",
          url: "http://127.0.0.1:8787/health",
          reuseExistingServer: false,
          timeout: 120_000,
          stdout: "pipe",
          stderr: "pipe",
        },
        {
          name: "Vercel Next.js web",
          command: "pnpm dev --hostname 127.0.0.1",
          url: baseURL,
          env: {
            D1_GATEWAY_URL: "http://127.0.0.1:8787",
            D1_GATEWAY_TOKEN: "local-d1-gateway-token",
            RESEND_API_KEY: "re_test_local_only",
            RESEND_FROM_EMAIL:
              "SAYLESS Local <local@sayless.invalid>",
            SESSION_SECRET:
              "local-e2e-session-secret-32-characters",
          },
          reuseExistingServer: false,
          timeout: 120_000,
          stdout: "pipe",
          stderr: "pipe",
        },
      ]
    : undefined,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /mobile\.spec\.ts/,
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 5"] },
      testMatch: /mobile\.spec\.ts/,
    },
  ],
});
