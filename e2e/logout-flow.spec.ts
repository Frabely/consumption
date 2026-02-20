import { expect, test } from "@playwright/test";
import { seedAuthSession } from "@/tests/helpers/e2e/authSessionSeed";
import { openActionMenu } from "@/tests/helpers/e2e/homeActions";

test("logout from action menu returns to login screen", async ({ browser }) => {
  const context = await browser.newContext();
  await seedAuthSession(context);
  const page = await context.newPage();

  await page.goto("/");
  await expect(page.getByTestId("action-menu-primary")).toBeVisible();

  await openActionMenu(page);
  await page.getByRole("button", { name: "Logout" }).click();

  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
  await context.close();
});
