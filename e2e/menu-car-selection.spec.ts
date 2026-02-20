import { expect, test } from "@playwright/test";
import { E2E_HOME_CAR_NAMES } from "@/tests/fixtures/e2e/home.fixture";
import { seedAuthSession } from "@/tests/helpers/e2e/authSessionSeed";
import { openActionMenu, selectCar } from "@/tests/helpers/e2e/homeActions";

test("menu select remains usable after browser reopen and can switch cars", async ({ browser }) => {
  const firstContext = await browser.newContext();
  await seedAuthSession(firstContext, { defaultCar: E2E_HOME_CAR_NAMES.default });
  const firstPage = await firstContext.newPage();

  await firstPage.goto("/");
  await expect(firstPage.getByTestId("action-menu-primary")).toBeVisible();
  await openActionMenu(firstPage);
  await expect(firstPage.getByTestId("custom-select-toggle")).toContainText(
    E2E_HOME_CAR_NAMES.default,
  );
  await selectCar(firstPage, E2E_HOME_CAR_NAMES.secondary);
  await firstContext.close();

  const secondContext = await browser.newContext();
  await seedAuthSession(secondContext, { defaultCar: E2E_HOME_CAR_NAMES.default });
  const secondPage = await secondContext.newPage();

  await secondPage.goto("/");
  await expect(secondPage.getByTestId("action-menu-primary")).toBeVisible();
  await openActionMenu(secondPage);
  await expect(secondPage.getByTestId("custom-select-toggle")).toContainText(
    E2E_HOME_CAR_NAMES.default,
  );
  await selectCar(secondPage, E2E_HOME_CAR_NAMES.secondary);
  await secondContext.close();
});
