import { expect, test } from "@playwright/test";

import { login } from "@/e2e/helpers";

test("lets visitors browse, requires login on write, and supports login", async ({
  page,
}) => {
  await page.goto("/app");
  await expect(
    page.getByRole("heading", { name: /欢迎体验.*继续向前/ }),
  ).toBeVisible();

  await page.goto("/app/batches");
  await page.getByRole("button", { name: "新建批次" }).first().click();
  const batchDialog = page.getByRole("dialog", { name: "新建批次" });
  await batchDialog
    .getByRole("textbox", { name: "批次名称", exact: true })
    .fill("访客不可写");
  await batchDialog.getByRole("button", { name: "创建批次" }).click();
  await expect(page).toHaveURL(
    /\/login\?next=%2Fapp%2Fbatches$/,
  );

  await login(page);
  await expect(
    page.getByRole("heading", { name: /继续向前/ }),
  ).toBeVisible();

  await page.getByRole("button", { name: "退出" }).click();
  await expect(page).toHaveURL(/\/login$/);
});
