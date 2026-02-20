import {expect, test} from "@playwright/test";

const AUTH_SESSION_STORAGE_KEY = "consumption.auth.session";
const E2E_MOCK_STORAGE_KEY = "consumption.e2e.mock-data";
const SEEDED_SESSION = {
    schemaVersion: 1,
    userId: "playwright-user",
    role: 2,
    defaultCar: "Zoe",
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
};

/**
 * Seeds the persisted auth session before app scripts execute.
 * @param pageContext Page or browser context instance that supports addInitScript.
 * @returns Promise resolved when session seeding script is registered.
 */
const seedAuthSession = async (pageContext: {
    addInitScript: (callback: (payload: { key: string; session: string; mockKey: string }) => void, payload: {
        key: string;
        session: string;
        mockKey: string;
    }) => Promise<void>;
}): Promise<void> => {
    await pageContext.addInitScript(({key, session, mockKey}) => {
        window.localStorage.setItem(key, session);
        window.localStorage.setItem(mockKey, "1");
    }, {
        key: AUTH_SESSION_STORAGE_KEY,
        session: JSON.stringify(SEEDED_SESSION),
        mockKey: E2E_MOCK_STORAGE_KEY
    });
};

test("menu select remains usable after browser reopen and can switch cars", async ({browser}) => {
    const firstContext = await browser.newContext();
    await seedAuthSession(firstContext);
    const firstPage = await firstContext.newPage();

    await firstPage.goto("/");
    await expect(firstPage.getByTestId("action-menu-primary")).toBeVisible();
    await firstPage.getByTestId("action-menu-toggle").click();
    const firstSelectToggle = firstPage.getByTestId("custom-select-toggle");
    await expect(firstSelectToggle).toContainText("Zoe");
    await firstSelectToggle.click();
    await firstPage.getByTestId("custom-select-option-BMW").click({force: true});
    await expect(firstSelectToggle).toContainText("BMW");
    await firstContext.close();

    const secondContext = await browser.newContext();
    await seedAuthSession(secondContext);
    const secondPage = await secondContext.newPage();

    await secondPage.goto("/");
    await expect(secondPage.getByTestId("action-menu-primary")).toBeVisible();
    await secondPage.getByTestId("action-menu-toggle").click();
    const secondSelectToggle = secondPage.getByTestId("custom-select-toggle");
    await expect(secondSelectToggle).toContainText("Zoe");
    await secondSelectToggle.click();
    await secondPage.getByTestId("custom-select-option-BMW").click({force: true});
    await expect(secondSelectToggle).toContainText("BMW");
    await secondContext.close();
});
