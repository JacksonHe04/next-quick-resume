import { expect, test } from "@playwright/test";

import { login } from "@/e2e/helpers";

test("requires the password before destructive account deletion", async ({
  page,
}) => {
  await login(page);
  await page.goto("/app/settings");
  await expect(
    page.getByRole("heading", { name: "个人设置" }),
  ).toBeVisible();
  await page
    .getByLabel("输入当前密码确认")
    .fill("incorrect-password");
  await page
    .getByRole("button", { name: "永久删除账户" })
    .click();
  await expect(page.getByText("当前密码不正确")).toBeVisible();
});
