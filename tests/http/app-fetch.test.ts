import { afterEach, describe, expect, it, vi } from "vitest";

import * as appFetchModule from "@/lib/app-fetch";

const { getLoginUrl } = appFetchModule;
const patchJson = (
  appFetchModule as typeof appFetchModule & {
    patchJson(url: string, body: unknown): Promise<unknown>;
  }
).patchJson;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("appFetch", () => {
  it("preserves the current page as the post-login return target", () => {
    expect(
      getLoginUrl({
        pathname: "/submissions",
        search: "?status=interview",
      }),
    ).toBe(
      "/login?next=%2Fsubmissions%3Fstatus%3Dinterview",
    );
  });

  it("patches a record and exposes the API error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              error: { message: "这个字段不能这样修改" },
            }),
            {
              status: 400,
              headers: { "content-type": "application/json" },
            },
          ),
        ),
    );

    await expect(
      patchJson("/api/records/a", { name: "新的名称" }),
    ).resolves.toEqual({ ok: true });
    await expect(
      patchJson("/api/records/a", { name: "" }),
    ).rejects.toThrow("这个字段不能这样修改");
  });
});
