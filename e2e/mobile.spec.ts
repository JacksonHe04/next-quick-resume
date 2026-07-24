import { expect, test } from "@playwright/test";

import { login } from "@/e2e/helpers";

test("opens the Chinese product navigation on mobile", async ({ page }) => {
  await login(page);
  await expect(
    page.getByRole("navigation", { name: "主要导航" }),
  ).toBeHidden();
  await page.getByRole("button", { name: "打开导航" }).click();
  const navigation = page.getByRole("navigation", {
    name: "主要导航",
  });
  await expect(navigation).toBeVisible();
  await expect(
    navigation.getByRole("link").allTextContents(),
  ).resolves.toEqual([
    "SAYLESS",
    "简历",
    "投递",
    "面试",
    "题库",
    "公司",
    "批次",
  ]);
});
