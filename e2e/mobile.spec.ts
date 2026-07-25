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

  await page.goto("/app/submissions");
  await expect(page.getByRole("table")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "卡片视图" }),
  ).toBeVisible();
});

test("creates and filters a question on mobile", async ({ page }) => {
  const suffix = Date.now().toString().slice(-6);
  const question = `移动端题目 ${suffix}`;

  await login(page);
  await page.goto("/app/questions");
  await page.getByRole("button", { name: "新建问题" }).click();
  const dialog = page.getByRole("dialog", { name: "新建问题" });
  await dialog
    .getByRole("textbox", { name: "问题", exact: true })
    .fill(question);
  await dialog
    .getByRole("textbox", { name: "分类（可选）" })
    .fill("移动端");
  await dialog
    .getByRole("textbox", { name: "标准答案" })
    .fill("一份持续迭代的答案");
  await dialog.getByRole("button", { name: "保存问题" }).click();
  await expect(page.getByText(question)).toBeVisible();

  await page.getByLabel("按分类筛选").selectOption("移动端");
  await expect(page.getByText(question)).toBeVisible();
});
