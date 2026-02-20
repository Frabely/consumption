import { expect, test } from "@playwright/test";
import { seedAuthSession } from "../tests/helpers/e2e/authSessionSeed";

test("restores persisted session and opens home directly", async ({ browser }) => {
  const context = await browser.newContext();
  await seedAuthSession(context);
  const page = await context.newPage();

  await page.goto("/");

  await expect(page.getByTestId("action-menu-primary")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Login" })).toHaveCount(0);
  await context.close();
});
