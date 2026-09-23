import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  // O baseline de screenshots so e comparado no CI (ubuntu-latest, Chromium do
  // Playwright). Fontes e metricas variam entre maquinas, entao localmente as
  // capturas sao ignoradas. Para regenerar o baseline: workflow "Update snapshots".
  ignoreSnapshots: !process.env.CI,
  expect: {
    // Baseline protege o design congelado (ADR-0006). Tolerancia pequena para
    // antialiasing entre versoes do runner.
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    {
      name: "phone-360",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 360, height: 780 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "tablet-768",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: "desktop-1280",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
});
