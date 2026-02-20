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
 * Seeds persisted auth session and enables e2e mock mode before app scripts run.
 * @param pageContext Browser context that provides addInitScript.
 * @returns Promise resolved when init script is registered.
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

test("add-data modal hydrates kilometer value after reopen when cars are initially missing", async ({browser}) => {
    const firstContext = await browser.newContext();
    await seedAuthSession(firstContext);
    const firstPage = await firstContext.newPage();

    await firstPage.goto("/");
    await expect(firstPage.getByTestId("action-menu-primary")).toBeVisible();
    await firstPage.getByTestId("action-menu-primary").click();
    await expect(firstPage.getByRole("heading", {name: "Daten hinzufügen"})).toBeVisible();
    await expect(firstPage.getByTestId("add-data-kilometer-input")).toHaveValue("12000");
    await firstContext.close();

    const secondContext = await browser.newContext();
    await seedAuthSession(secondContext);
    const secondPage = await secondContext.newPage();

    await secondPage.goto("/");
    await expect(secondPage.getByTestId("action-menu-primary")).toBeVisible();
    await secondPage.getByTestId("action-menu-primary").click();
    await expect(secondPage.getByRole("heading", {name: "Daten hinzufügen"})).toBeVisible();
    await expect(secondPage.getByTestId("add-data-kilometer-input")).toHaveValue("12000");
    await secondContext.close();
});
