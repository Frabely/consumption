import { expect, test } from "@playwright/test";
import {
  E2E_HOME_CAR_NAMES,
  E2E_HOME_MENU_LABELS,
} from "../tests/fixtures/e2e/home.fixture";
import { seedAuthSession } from "../tests/helpers/e2e/authSessionSeed";
import {
  openActionMenu,
  selectCar,
  openAddDataDialog,
} from "../tests/helpers/e2e/homeActions";

test("add-data uses kilometer of the currently selected car after browser reopen", async ({
  browser,
}) => {
  const firstContext = await browser.newContext();
  await seedAuthSession(firstContext, { defaultCar: E2E_HOME_CAR_NAMES.default });
  const firstPage = await firstContext.newPage();

  await firstPage.goto("/");
  await openActionMenu(firstPage);
  await selectCar(firstPage, E2E_HOME_CAR_NAMES.secondary);
  await openAddDataDialog(firstPage);
  await expect(
    firstPage.getByRole("heading", { name: E2E_HOME_MENU_LABELS.addDataHeading }),
  ).toBeVisible();
  await expect(firstPage.getByTestId("add-data-kilometer-input")).toHaveValue("45000");
  await firstContext.close();

  const secondContext = await browser.newContext();
  await seedAuthSession(secondContext, { defaultCar: E2E_HOME_CAR_NAMES.default });
  const secondPage = await secondContext.newPage();

  await secondPage.goto("/");
  await openActionMenu(secondPage);
  await selectCar(secondPage, E2E_HOME_CAR_NAMES.secondary);
  await openAddDataDialog(secondPage);
  await expect(
    secondPage.getByRole("heading", { name: E2E_HOME_MENU_LABELS.addDataHeading }),
  ).toBeVisible();
  await expect(secondPage.getByTestId("add-data-kilometer-input")).toHaveValue("45000");
  await secondContext.close();
});
