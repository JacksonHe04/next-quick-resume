import { expect, test } from "@playwright/test";

import { login } from "@/e2e/helpers";

async function shareUrlOf(page: import("@playwright/test").Page, id: string) {
  return `${new URL(page.url()).origin}/resumes/share/${id}`;
}

test("switches, clones, shares, and persists resumes from the three-column workspace", async ({
  page,
  browser,
}) => {
  const suffix = Date.now().toString().slice(-6);
  const editedName = `E2E 简历 ${suffix} 已编辑`;
  const candidateName = `候选人 ${suffix}`;

  await login(page);
  await page.goto("/resumes");
  // /resumes 直达编辑器（最近更新的简历）
  await expect(page).toHaveURL(/\/resumes\/[^/]+$/u);
  await expect(page.getByRole("main", { name: "简历预览" })).toBeVisible();
  const listSidebar = page.getByRole("complementary", {
    name: "简历列表",
  });
  await expect(listSidebar).toBeVisible();

  // 右侧列表点击切换：瞬时、URL 更新、顶栏名称与预览跟随，无骨架屏
  const firstItem = listSidebar.locator("button[aria-label^='切换到']").first();
  const firstName = (await firstItem.getAttribute("aria-label"))!.replace(
    "切换到",
    "",
  );
  const start = Date.now();
  await firstItem.click();
  await expect(
    page.getByRole("button", { name: `编辑简历名称：${firstName}` }),
  ).toBeVisible({ timeout: 2000 });
  const switchMs = Date.now() - start;
  expect(switchMs).toBeLessThan(1000);
  await expect(page).toHaveURL(new RegExp(`/resumes/[^/]+$`));
  // 不出现加载骨架
  await expect(page.getByText("简历编辑器加载中")).toHaveCount(0);

  // 顶栏克隆当前简历并切换到副本
  await page.getByRole("button", { name: "克隆简历" }).click();
  await expect(
    page.getByRole("button", { name: `编辑简历名称：${firstName}（副本）` }),
  ).toBeVisible({ timeout: 5000 });

  // 重命名副本
  await page
    .getByRole("button", { name: `编辑简历名称：${firstName}（副本）` })
    .click();
  await page.getByLabel("简历名称").fill(editedName);
  await page.getByRole("button", { name: "确认" }).click();

  // JSON tab：修改头部姓名，自动保存后刷新验证已持久化
  await page.getByRole("button", { name: "JSON" }).click();
  const jsonEditor = page.getByLabel("简历内容 JSON");
  const resumeData = JSON.parse(await jsonEditor.inputValue());
  resumeData.header.name = candidateName;
  await jsonEditor.fill(JSON.stringify(resumeData, null, 2));
  await page.waitForTimeout(1200);
  await page.reload();
  await page.getByRole("button", { name: "JSON" }).click();
  const reloadedData = JSON.parse(
    await page.getByLabel("简历内容 JSON").inputValue(),
  );
  expect(reloadedData.header.name).toBe(candidateName);

  // 顶栏公开分享 popover：开启后展示链接
  await page.getByRole("button", { name: "公开分享" }).click();
  await page.getByRole("switch", { name: "开启公开分享" }).click();
  await expect(
    page.getByRole("switch", { name: "停止公开分享" }),
  ).toBeVisible();
  const linkRow = page.getByText(/\/resumes\/share\//);
  await expect(linkRow).toBeVisible();
  const shareUrl = await linkRow.getAttribute("title");

  // 未登录访客可访问分享页：只展示「新建简历」时的模板简历（mock），
  // 绝不泄露真实内容；只有简历渲染本身
  const anonymousContext = await browser.newContext();
  const anonymousPage = await anonymousContext.newPage();
  await anonymousPage.goto(shareUrl!);
  await expect(anonymousPage.locator("#resume-preview")).toBeVisible();
  await expect(
    anonymousPage.getByRole("heading", { name: "小咕嘎" }),
  ).toBeVisible();
  await expect(
    anonymousPage.getByRole("heading", { name: candidateName }),
  ).toHaveCount(0);
  await expect(anonymousPage.getByRole("banner")).toHaveCount(0);
  await expect(anonymousPage.getByRole("complementary")).toHaveCount(0);

  // 未公开的原始简历 404
  await listSidebar
    .getByRole("button", { name: `切换到${firstName}`, exact: true })
    .click();
  const originalId = new URL(page.url()).pathname.split("/").at(-1);
  const originalShareResponse = await anonymousPage.goto(
    await shareUrlOf(page, originalId!),
  );
  expect(originalShareResponse?.status()).toBe(404);

  await anonymousContext.close();
});

test("lets unauthenticated visitors edit the template and continue on the same resume from the same browser", async ({
  browser,
}) => {
  const context = await browser.newContext();
  const guestPage = await context.newPage();
  await guestPage.goto("/resumes");

  // 首次访问（新设备）：访客直接看到 demo 简历编辑器，且没有克隆 / 分享 / 简历列表
  await expect(
    guestPage.getByRole("main", { name: "简历预览" }),
  ).toBeVisible();
  // 访客看到的是「新建简历」时的模板简历（mock），绝不泄露任何真实简历
  await expect(
    guestPage.getByRole("heading", { name: "小咕嘎" }),
  ).toBeVisible();
  await expect(
    guestPage.getByRole("button", { name: "克隆简历" }),
  ).toHaveCount(0);
  await expect(
    guestPage.getByRole("complementary", { name: "简历列表" }),
  ).toHaveCount(0);
  await expect(
    guestPage.getByRole("button", { name: "公开分享" }),
  ).toHaveCount(0);

  // 修改模板简历内容
  await guestPage.getByRole("button", { name: "内容" }).click();
  const nameInput = guestPage.getByLabel("姓名");
  const editedName = `访客 ${Date.now().toString().slice(-6)}`;
  await nameInput.fill(editedName);

  // 先等自动保存完成（防抖 650ms + POST 物化落库），再刷新验证续编
  await guestPage.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().includes("/api/resumes"),
    { timeout: 10_000 },
  );

  // 同一浏览器（同一匿名设备）刷新后：回到同一份简历继续编辑，改动已落库
  await expect
    .poll(async () => {
      await guestPage.reload();
      await guestPage.getByRole("button", { name: "内容" }).click();
      return await guestPage.getByLabel("姓名").inputValue();
    })
    .toBe(editedName);

  // 回访依旧是访客视角：没有克隆 / 分享 / 简历列表
  await expect(
    guestPage.getByRole("button", { name: "克隆简历" }),
  ).toHaveCount(0);
  await expect(
    guestPage.getByRole("complementary", { name: "简历列表" }),
  ).toHaveCount(0);

  // 换一个全新浏览器上下文（另一台设备）：回到模板，看不到上一台设备保存的简历
  await context.close();
  const otherContext = await browser.newContext();
  const otherPage = await otherContext.newPage();
  await otherPage.goto("/resumes");
  await expect(
    otherPage.getByRole("heading", { name: "小咕嘎" }),
  ).toBeVisible();
  await otherPage.getByRole("button", { name: "内容" }).click();
  expect(await otherPage.getByLabel("姓名").inputValue()).not.toBe(editedName);
  await otherContext.close();
});
