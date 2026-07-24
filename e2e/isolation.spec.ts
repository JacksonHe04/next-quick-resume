import { expect, test } from "@playwright/test";

import {
  ISOLATED_EMAIL,
  ISOLATED_PASSWORD,
  login,
} from "@/e2e/helpers";

test("keeps private catalog entries isolated between accounts", async ({
  browser,
}) => {
  const privateName = `私有公司 ${Date.now()}`;
  const firstContext = await browser.newContext();
  const firstPage = await firstContext.newPage();
  await login(firstPage);
  const created = await firstPage.request.post("/api/catalog/company", {
    data: { name: privateName },
  });
  expect(created.ok()).toBeTruthy();
  const visible = await firstPage.request.get(
    `/api/catalog/company?q=${encodeURIComponent(privateName)}`,
  );
  expect((await visible.json()).options).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: privateName, source: "private" }),
    ]),
  );

  const secondContext = await browser.newContext();
  const secondPage = await secondContext.newPage();
  await login(secondPage, ISOLATED_EMAIL, ISOLATED_PASSWORD);
  const hidden = await secondPage.request.get(
    `/api/catalog/company?q=${encodeURIComponent(privateName)}`,
  );
  expect((await hidden.json()).options).not.toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: privateName, source: "private" }),
    ]),
  );

  await firstContext.close();
  await secondContext.close();
});
