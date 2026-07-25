import { expect, test } from "@playwright/test";

import { login } from "@/e2e/helpers";

test("creates, edits, and clones an independent resume", async ({
  page,
}) => {
  const suffix = Date.now().toString().slice(-6);
  const resumeName = `E2E 简历 ${suffix}`;
  const editedName = `${resumeName} 已编辑`;
  const candidateName = `候选人 ${suffix}`;

  await login(page);
  await page.goto("/app/resumes");
  await page.getByLabel("新简历名称").fill(resumeName);
  await page.getByRole("button", { name: "新建简历" }).click();
  await expect(page).toHaveURL(/\/app\/resumes\/[^/]+$/u);

  await page
    .getByRole("button", { name: `编辑简历名称：${resumeName}` })
    .click();
  await page.getByLabel("简历名称").fill(editedName);
  await page.getByRole("button", { name: "确认" }).click();
  await page.getByRole("button", { name: "内容" }).click();
  const jsonEditor = page.getByLabel("简历内容 JSON");
  const resumeData = JSON.parse(await jsonEditor.inputValue());
  resumeData.header.name = candidateName;
  await jsonEditor.fill(JSON.stringify(resumeData, null, 2));
  await expect(page.getByRole("status")).toHaveText("保存中…");
  await expect(page.getByRole("status")).toContainText("已保存");

  await page.getByRole("link", { name: "返回简历列表" }).click();
  const resumeRow = page.getByRole("row").filter({
    hasText: editedName,
  });
  await expect(resumeRow).toHaveCount(1);
  await expect(resumeRow.getByText(candidateName)).toBeVisible();
  await resumeRow.getByRole("button", { name: "克隆简历" }).click();

  await expect(
    page.getByRole("button", {
      name: `编辑简历名称：${editedName}（副本）`,
    }),
  ).toBeVisible();
});
