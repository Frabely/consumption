import { expect, test } from "@playwright/test";
import { E2E_AUTH_PIN } from "@/tests/fixtures/e2e/authSession.fixture";

test("login with a valid 4-digit pin opens home menu", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();

  await page.getByPlaceholder("Nutzerkürzel").fill(E2E_AUTH_PIN);

  await expect(page.getByTestId("action-menu-primary")).toBeVisible();
});
