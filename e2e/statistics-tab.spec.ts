import { expect, test } from "@playwright/test";
import { E2E_HOME_TAB_LABELS } from "../tests/fixtures/e2e/home.fixture";
import { seedAuthSession } from "../tests/helpers/e2e/authSessionSeed";

test("switches to statistics tab and shows kpi labels", async ({ browser }) => {
  const context = await browser.newContext();
  await seedAuthSession(context);
  const page = await context.newPage();

  await page.goto("/");
  await page.getByRole("tab", { name: E2E_HOME_TAB_LABELS.statistics }).click();

  await expect(page.getByText("Geladene Menge")).toBeVisible();
  await expect(page.getByText("Zurückgelegte Kilometer")).toBeVisible();
  await context.close();
});
