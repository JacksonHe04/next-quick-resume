import { expect, test, type Browser } from "@playwright/test";

import { login } from "@/e2e/helpers";

async function shareUrlOf(page: import("@playwright/test").Page, id: string) {
  return `${new URL(page.url()).origin}/resumes/share/${id}`;
}

test("edits, clones, and shares resumes from the editor workspace", async ({
  page,
  browser,
}) => {
  const suffix = Date.now().toString().slice(-6);
  const resumeName = `E2E 简历 ${suffix}`;
  const editedName = `${resumeName} 已编辑`;
  const candidateName = `候选人 ${suffix}`;

  await login(page);
  // /resumes 直接就是编辑 + 预览页（演示用户已有种子简历）
  await page.goto("/resumes");
  await expect(page.getByRole("main", { name: "简历预览" })).toBeVisible();

  // 在“简历列表”tab 中新建一份简历，并进入其编辑器
  await page.getByRole("button", { name: "简历列表" }).click();
  await page.getByRole("button", { name: "新建简历" }).click();
  await expect(page).toHaveURL(/\/resumes\/[^/]+$/u);

  // 重命名
  await page
    .getByRole("button", { name: "编辑简历名称：我的简历" })
    .click();
  await page.getByLabel("简历名称").fill(editedName);
  await page.getByRole("button", { name: "确认" }).click();

  // 内容 tab：通过 JSON 修改头部姓名，等待自动保存后刷新验证已持久化
  await page.getByRole("button", { name: "内容" }).click();
  await page.getByLabel("JSON 编辑区域").click();
  const jsonEditor = page.getByLabel("简历内容 JSON");
  const resumeData = JSON.parse(await jsonEditor.inputValue());
  resumeData.header.name = candidateName;
  await jsonEditor.fill(JSON.stringify(resumeData, null, 2));
  await page.waitForTimeout(1200);
  await page.reload();
  await page.getByRole("button", { name: "内容" }).click();
  await page.getByLabel("JSON 编辑区域").click();
  const reloadedData = JSON.parse(
    await page.getByLabel("简历内容 JSON").inputValue(),
  );
  expect(reloadedData.header.name).toBe(candidateName);

  // 简历列表不展示简历第一行（头部姓名）
  await page.getByRole("button", { name: "简历列表" }).click();
  const sidebar = page.getByRole("complementary", { name: "简历配置" });
  await expect(sidebar.getByText(editedName)).toBeVisible();
  await expect(sidebar.getByText(candidateName)).toHaveCount(0);

  // 克隆：三点菜单 -> 克隆简历，列表出现“（副本）”
  await sidebar
    .getByRole("button", { name: `更多操作：${editedName}` })
    .click();
  await sidebar.getByRole("button", { name: "克隆简历" }).click();
  await expect(sidebar.getByText(`${editedName}（副本）`)).toBeVisible();

  // 公开分享：开启后展示链接
  await sidebar
    .getByRole("button", { name: `更多操作：${editedName}` })
    .click();
  await sidebar.getByRole("switch", { name: "开启公开分享" }).click();
  await expect(sidebar.getByRole("switch", { name: "停止公开分享" })).toBeVisible();
  const linkRow = sidebar.getByText(/\/resumes\/share\//);
  await expect(linkRow).toBeVisible();
  const shareUrl = await linkRow.getAttribute("title");

  // 未登录的访客可以直接访问分享页：只有简历渲染本身
  const anonymousContext = await browser.newContext();
  const anonymousPage = await anonymousContext.newPage();
  await anonymousPage.goto(shareUrl!);
  await expect(anonymousPage.locator("#resume-preview")).toBeVisible();
  await expect(
    anonymousPage.getByRole("heading", { name: candidateName }),
  ).toBeVisible();
  await expect(anonymousPage.getByRole("banner")).toHaveCount(0);
  await expect(
    anonymousPage.getByRole("complementary"),
  ).toHaveCount(0);

  // 未公开的副本访问返回 404
  await sidebar
    .getByRole("link", { name: `切换到${editedName}（副本）` })
    .click();
  await expect(page).toHaveURL(/\/resumes\/[^/]+$/u);
  const cloneId = new URL(page.url()).pathname.split("/").at(-1);
  const cloneShareResponse = await anonymousPage.goto(
    await shareUrlOf(page, cloneId!),
  );
  expect(cloneShareResponse?.status()).toBe(404);

  await anonymousContext.close();
});

test("resumes land directly on the editor when none exist", async ({
  browser,
}: {
  browser: Browser;
}) => {
  const context = await browser.newContext();
  const isolatedPage = await context.newPage();
  await login(isolatedPage, "isolated@local.sayless.app", "sayless-isolated-2026");
  await isolatedPage.goto("/resumes");
  await expect(
    isolatedPage.getByRole("heading", { name: "还没有简历" }),
  ).toBeVisible();
  await isolatedPage.getByRole("button", { name: "新建简历" }).click();
  await expect(isolatedPage).toHaveURL(/\/resumes\/[^/]+$/u);
  await expect(
    isolatedPage.getByRole("main", { name: "简历预览" }),
  ).toBeVisible();
  await context.close();
});
