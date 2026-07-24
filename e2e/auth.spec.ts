import { expect, test } from "@playwright/test";

import { login } from "@/e2e/helpers";

test("redirects a signed-out visitor and supports email password login", async ({
  page,
}) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login$/);

  await login(page);
  await expect(
    page.getByRole("heading", { name: /继续向前/ }),
  ).toBeVisible();

  await page.getByRole("button", { name: "退出" }).click();
  await expect(page).toHaveURL(/\/login$/);
});
