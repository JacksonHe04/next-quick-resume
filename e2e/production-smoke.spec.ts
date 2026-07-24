import { expect, test } from "@playwright/test";

test("serves the public SAYLESS entry points", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /别让求职/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "免费开始" }),
  ).toHaveAttribute("href", "/register");

  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "继续你的求职路径" }),
  ).toBeVisible();

  await page.goto("/register");
  await expect(
    page.getByRole("heading", { name: "建立你的求职空间" }),
  ).toBeVisible();
});
