import { expect, Page } from "@playwright/test";

/**
 * Opens the floating action menu popover.
 * @param page Current playwright page.
 * @returns Promise resolved after the menu is opened.
 */
export const openActionMenu = async (page: Page): Promise<void> => {
  await page.getByTestId("action-menu-toggle").dispatchEvent("click");
};

/**
 * Selects a specific car via CustomSelect in the action menu.
 * @param page Current playwright page.
 * @param carName Visible option/test-id car name.
 * @returns Promise resolved when the car is selected and visible on toggle.
 */
export const selectCar = async (page: Page, carName: string): Promise<void> => {
  const selectToggle = page.getByTestId("custom-select-toggle");
  await selectToggle.click();
  await page.getByTestId(`custom-select-option-${carName}`).click({ force: true });
  await expect(selectToggle).toContainText(carName);
};

/**
 * Opens the add-data modal by clicking the primary action button.
 * @param page Current playwright page.
 * @returns Promise resolved when the add-data heading is visible.
 */
export const openAddDataDialog = async (page: Page): Promise<void> => {
  await expect(page.getByTestId("action-menu-primary")).toBeVisible();
  await page.getByTestId("action-menu-primary").click();
};
