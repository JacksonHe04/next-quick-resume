import { expect, test } from "@playwright/test";

import { login } from "@/e2e/helpers";

test("completes the job-search lifecycle", async ({ page }) => {
  const suffix = Date.now().toString().slice(-6);
  const batchName = `E2E 批次 ${suffix}`;
  const positionName = `E2E 产品经理 ${suffix}`;
  const interviewName = `E2E 一面 ${suffix}`;
  const questionText = `如何复盘 ${interviewName}`;

  await login(page);

  await page.goto("/batches");
  await page.getByRole("button", { name: "新建批次" }).first().click();
  const batchDialog = page.getByRole("dialog", { name: "新建批次" });
  await batchDialog
    .getByRole("textbox", { name: "批次名称", exact: true })
    .fill(batchName);
  await batchDialog.getByRole("button", { name: "创建批次" }).click();
  await expect(page.getByText(batchName)).toBeVisible();
  const batchRow = page.getByRole("row").filter({
    hasText: batchName,
  });
  await expect(batchRow).toHaveCount(1);
  await batchRow
    .getByRole("button", { name: "设为当前批次" })
    .click();
  await expect(
    batchRow.getByText("当前批次", { exact: true }),
  ).toBeVisible();
  await page.goto("/resumes");
  await expect(
    page.getByText(`当前阶段：${batchName}`),
  ).toBeVisible();

  await page.goto("/submissions");
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

  await page.goto("/interviews");
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
  const interviewRow = page.getByRole("row").filter({
    hasText: interviewName,
  });
  await interviewRow
    .getByRole("link", { name: "打开选拔详情" })
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

  await page.goto("/questions");
  const questionRow = page.getByRole("row").filter({
    hasText: questionText,
  });
  await questionRow
    .getByRole("link", { name: "打开问题详情" })
    .click();
  await expect(
    page.getByRole("link", { name: interviewName, exact: true }),
  ).toBeVisible();

  await page.goto("/interviews");
  await page
    .getByLabel("按选拔阶段筛选")
    .selectOption({ label: "一面" });
  await page
    .getByLabel("按选拔状态筛选")
    .selectOption("passed");
  await expect(page).toHaveURL(/stage=stage-first/);
  await expect(page.getByText(interviewName)).toBeVisible();

  await page.goto("/submissions");
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

  await page.goto("/batches");
  const archivedBatchRow = page.getByRole("row").filter({
    hasText: batchName,
  });
  await archivedBatchRow
    .getByRole("button", { name: "归档批次" })
    .click();
  await expect(archivedBatchRow.getByText("已归档")).toBeVisible();
});
