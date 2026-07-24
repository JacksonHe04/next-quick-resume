import { expect, test } from "@playwright/test";

import { login } from "@/e2e/helpers";

test("completes the job-search lifecycle", async ({ page }) => {
  const suffix = Date.now().toString().slice(-6);
  const batchName = `E2E 批次 ${suffix}`;
  const positionName = `E2E 产品经理 ${suffix}`;
  const interviewName = `E2E 一面 ${suffix}`;

  await login(page);

  await page.goto("/app/batches");
  await page.getByRole("button", { name: "新建批次" }).first().click();
  await page.getByLabel("批次名称").fill(batchName);
  await page.getByRole("button", { name: "创建批次" }).click();
  await expect(page.getByText(batchName)).toBeVisible();
  const batchCard = page
    .locator("article, div")
    .filter({ hasText: batchName })
    .last();
  const currentButton = batchCard.getByRole("button", {
    name: "设为当前",
  });
  if (await currentButton.isVisible().catch(() => false)) {
    await currentButton.click();
  }

  await page.goto("/app/submissions");
  await page.getByRole("button", { name: "记录投递" }).click();
  const company = page.getByRole("combobox").first();
  await company.fill("OpenAI");
  await page.getByRole("option", { name: /OpenAI/ }).click();
  const position = page.getByRole("combobox").first();
  await position.fill("产品经理");
  await page
    .getByRole("option", { name: "产品经理 官方", exact: true })
    .click();
  await page.getByLabel("岗位名称").fill(positionName);
  await page.getByLabel("批次").selectOption({ label: batchName });
  await page.getByRole("button", { name: "保存投递" }).click();
  await expect(page.getByText(positionName)).toBeVisible();

  await page.goto("/app/interviews");
  await page.getByRole("button", { name: "添加选拔" }).click();
  await page
    .getByLabel("对应投递")
    .selectOption({ label: `OpenAI · ${positionName}` });
  await page.getByLabel("选拔阶段").selectOption({ label: "一面" });
  await page.getByLabel("状态").selectOption("passed");
  await page.getByLabel("选拔名称").fill(interviewName);
  await page.getByRole("button", { name: "保存选拔事件" }).click();
  await expect(page.getByText(interviewName)).toBeVisible();

  await page.goto("/app/submissions");
  const submissionRow = page.getByRole("row").filter({
    hasText: positionName,
  });
  await expect(submissionRow.getByText("一面过")).toBeVisible();
});
