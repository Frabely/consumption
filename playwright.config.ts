import {defineConfig, devices} from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    workers: 1,
    timeout: 30_000,
    expect: {
        timeout: 10_000
    },
    use: {
        baseURL: "http://localhost:3000",
        trace: "on-first-retry"
    },
    webServer: {
        command: "npm run dev -- --port 3000",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        env: {
            NEXT_PUBLIC_E2E_MOCK_DATA: "1"
        }
    },
    projects: [
        {
            name: "chromium",
            use: {...devices["Desktop Chrome"]}
        }
    ]
});
