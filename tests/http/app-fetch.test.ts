import { describe, expect, it } from "vitest";

import { getLoginUrl } from "@/lib/app-fetch";

describe("appFetch", () => {
  it("preserves the current page as the post-login return target", () => {
    expect(
      getLoginUrl({
        pathname: "/app/submissions",
        search: "?status=interview",
      }),
    ).toBe(
      "/login?next=%2Fapp%2Fsubmissions%3Fstatus%3Dinterview",
    );
  });
});
