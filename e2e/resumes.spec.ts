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

  await page.getByLabel("简历名称").fill(editedName);
  await page.getByLabel("姓名").fill(candidateName);
  await expect(page.getByRole("status")).toHaveText("保存中…");
  await expect(page.getByRole("status")).toContainText("已保存");

  await page.getByRole("link", { name: "返回简历列表" }).click();
  const resumeLink = page.getByRole("link", {
    name: editedName,
    exact: true,
  });
  await expect(resumeLink).toBeVisible();
  const resumeCard = resumeLink.locator(
    "xpath=ancestor::*[.//button[@aria-label='克隆简历']][1]",
  );
  await expect(resumeCard.getByText(candidateName)).toBeVisible();
  await resumeCard.getByRole("button", { name: "克隆简历" }).click();

  await expect(
    page.getByRole("link", {
      name: `${editedName}（副本）`,
      exact: true,
    }),
  ).toBeVisible();
});
