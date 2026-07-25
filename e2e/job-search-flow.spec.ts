import { expect, test } from "@playwright/test";

import { login } from "@/e2e/helpers";

test("completes the job-search lifecycle", async ({ page }) => {
  const suffix = Date.now().toString().slice(-6);
  const batchName = `E2E 批次 ${suffix}`;
  const positionName = `E2E 产品经理 ${suffix}`;
  const interviewName = `E2E 一面 ${suffix}`;
  const questionText = `如何复盘 ${interviewName}`;

  await login(page);

  await page.goto("/app/batches");
  await page.getByRole("button", { name: "新建批次" }).first().click();
  await page.getByLabel("批次名称").fill(batchName);
  await page.getByRole("button", { name: "创建批次" }).click();
  await expect(page.getByText(batchName)).toBeVisible();
  const batchCard = page.locator('[data-slot="card"]').filter({
    has: page.getByRole("heading", {
      name: batchName,
      exact: true,
    }),
  });
  await expect(batchCard).toHaveCount(1);
  await batchCard.getByRole("button", { name: "设为当前" }).click();
  await expect(
    batchCard.getByText("当前批次", { exact: true }),
  ).toBeVisible();
  await page.goto("/app");
  await expect(
    page.getByText(`当前阶段：${batchName}`),
  ).toBeVisible();

  await page.goto("/app/submissions");
  await page.getByRole("button", { name: "记录投递" }).click();
  const submissionDialog = page.getByRole("dialog", {
    name: "记录投递",
  });
  const company = submissionDialog.getByRole("combobox", {
    name: "公司",
  });
  await company.fill("OpenAI");
  await submissionDialog
    .getByRole("option", { name: "OpenAI 官方", exact: true })
    .click();
  const position = submissionDialog.getByRole("combobox", {
    name: "岗位",
  });
  await position.fill("产品经理");
  await submissionDialog
    .getByRole("option", { name: "产品经理 官方", exact: true })
    .click();
  await submissionDialog.getByLabel("岗位名称").fill(positionName);
  await submissionDialog
    .getByLabel("批次")
    .selectOption({ label: batchName });
  await submissionDialog
    .getByRole("button", { name: "保存投递" })
    .click();
  await expect(
    page.getByRole("table").getByText(positionName),
  ).toBeVisible();
  await page
    .getByLabel("按批次筛选")
    .selectOption({ label: batchName });
  await expect(page).toHaveURL(/batch=/);
  await expect(
    page.getByRole("table").getByText(positionName),
  ).toBeVisible();

  await page.goto("/app/interviews");
  await page.getByRole("button", { name: "添加选拔" }).click();
  const interviewDialog = page.getByRole("dialog", {
    name: "添加选拔事件",
  });
  await interviewDialog
    .getByLabel("对应投递")
    .selectOption({ label: `OpenAI · ${positionName}` });
  await interviewDialog
    .getByLabel("选拔阶段")
    .selectOption({ label: "一面" });
  await interviewDialog.getByLabel("状态").selectOption("passed");
  await interviewDialog.getByLabel("选拔名称").fill(interviewName);
  await interviewDialog
    .getByRole("button", { name: "保存选拔事件" })
    .click();
  await expect(page.getByText(interviewName)).toBeVisible();
  await page
    .getByRole("link", { name: interviewName, exact: true })
    .click();
  await page.getByRole("button", { name: "沉淀面试问题" }).click();
  const questionDialog = page.getByRole("dialog", {
    name: "沉淀面试问题",
  });
  await questionDialog
    .getByRole("textbox", { name: "问题", exact: true })
    .fill(questionText);
  await questionDialog
    .getByRole("textbox", { name: "标准答案" })
    .fill("## 标准答案\n\n这是一份持续迭代的复盘答案。");
  await questionDialog
    .getByRole("button", { name: "创建并关联当前面试" })
    .click();
  await expect(questionDialog).toBeHidden();

  await page.goto("/app/questions");
  await page
    .getByRole("link", { name: questionText, exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: interviewName, exact: true }),
  ).toBeVisible();

  await page.goto("/app/interviews");
  await page
    .getByLabel("按选拔阶段筛选")
    .selectOption({ label: "一面" });
  await page
    .getByLabel("按选拔状态筛选")
    .selectOption("passed");
  await expect(page).toHaveURL(/stage=stage-first/);
  await expect(page.getByRole("heading", { name: "历史" })).toBeVisible();
  await expect(page.getByText(interviewName)).toBeVisible();

  await page.goto("/app/submissions");
  const submissionRow = page.getByRole("row").filter({
    hasText: positionName,
  });
  await expect(submissionRow.getByText("一面过")).toBeVisible();
  await submissionRow
    .getByRole("link", { name: "OpenAI", exact: true })
    .click();
  await page.getByLabel("手动投递状态").selectOption("offer");
  await page
    .getByRole("button", { name: "更新投递状态" })
    .click();
  await expect(page.getByRole("status")).toHaveText(
    "投递状态已手动更新",
  );
  await expect(
    page.locator("span").filter({ hasText: /^Offer$/ }),
  ).toBeVisible();

  await page.goto("/app/batches");
  const archivedBatchCard = page.locator('[data-slot="card"]').filter({
    has: page.getByRole("heading", {
      name: batchName,
      exact: true,
    }),
  });
  await archivedBatchCard.getByRole("button", { name: "归档" }).click();
  await expect(archivedBatchCard.getByText("已归档")).toBeVisible();
});
