import { expect, test } from "@playwright/test";
import { E2E_HOME_MENU_LABELS } from "../tests/fixtures/e2e/home.fixture";
import { seedAuthSession } from "../tests/helpers/e2e/authSessionSeed";
import { openActionMenu } from "../tests/helpers/e2e/homeActions";

test("opens and closes CSV download modal from action menu", async ({ browser }) => {
  const context = await browser.newContext();
  await seedAuthSession(context);
  const page = await context.newPage();

  await page.goto("/");
  await openActionMenu(page);
  await page.getByRole("button", { name: E2E_HOME_MENU_LABELS.csvDownload }).click();

  await expect(
    page.getByRole("heading", { name: E2E_HOME_MENU_LABELS.downloadCsvHeading }),
  ).toBeVisible();

  await page.getByRole("button", { name: E2E_HOME_MENU_LABELS.abort }).click();

  await expect(
    page.getByRole("heading", { name: E2E_HOME_MENU_LABELS.downloadCsvHeading }),
  ).toHaveCount(0);
  await context.close();
});
