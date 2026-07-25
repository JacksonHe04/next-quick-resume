import { expect, type Page } from "@playwright/test";

export const DEMO_EMAIL = "demo@local.sayless.app";
export const DEMO_PASSWORD = "sayless-demo-2026";
export const ISOLATED_EMAIL = "isolated@local.sayless.app";
export const ISOLATED_PASSWORD = "sayless-isolated-2026";

export async function login(
  page: Page,
  email = DEMO_EMAIL,
  password = DEMO_PASSWORD,
) {
  await page.goto("/login");
  await page.getByLabel("邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page
    .getByRole("button", { name: "登录", exact: true })
    .click();
  await expect(page).toHaveURL(/\/app$/);
}
