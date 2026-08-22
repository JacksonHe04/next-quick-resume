import { describe, expect, it } from "vitest";

import {
  ANON_COOKIE_NAME,
  isValidAnonRawId,
  readAnonRawIdFromRequest,
} from "@/modules/auth/anon-id";

describe("anon id", () => {
  it("accepts only well-formed UUID values", () => {
    expect(
      isValidAnonRawId("9f5e6c1a-2b3c-4d5e-8f90-123456789abc"),
    ).toBe(true);
    expect(isValidAnonRawId("9F5E6C1A-2B3C-4D5E-8F90-123456789ABC")).toBe(
      true,
    );
    // 拒绝任何非 UUID：用户 id、demo 账号名、空白、截断值
    expect(isValidAnonRawId("demo-user")).toBe(false);
    expect(isValidAnonRawId("")).toBe(false);
    expect(isValidAnonRawId("9f5e6c1a-2b3c-4d5e")).toBe(false);
    expect(
      isValidAnonRawId("9f5e6c1a2b3c4d5e8f90123456789abc"),
    ).toBe(false);
    expect(isValidAnonRawId("9f5e6c1a-2b3c-4d5e-8f90-123456789ab")).toBe(
      false,
    );
    expect(isValidAnonRawId("9f5e6c1a-2b3c-4d5e-8f90-123456789abc ")).toBe(
      false,
    );
  });

  it("reads the anon cookie from a request, ignoring malformed values", () => {
    const uuid = "9f5e6c1a-2b3c-4d5e-8f90-123456789abc";
    const request = new Request("http://localhost/api/resumes", {
      headers: { cookie: `${ANON_COOKIE_NAME}=${uuid}; other=1` },
    });
    expect(readAnonRawIdFromRequest(request)).toBe(uuid);

    // 没有 cookie / 值非法 / 值被篡改为非 UUID → 一律 null
    expect(
      readAnonRawIdFromRequest(new Request("http://localhost/api/resumes")),
    ).toBeNull();
    expect(
      readAnonRawIdFromRequest(
        new Request("http://localhost/api/resumes", {
          headers: { cookie: `${ANON_COOKIE_NAME}=demo-user` },
        }),
      ),
    ).toBeNull();
    expect(
      readAnonRawIdFromRequest(
        new Request("http://localhost/api/resumes", {
          headers: { cookie: `${ANON_COOKIE_NAME}=` },
        }),
      ),
    ).toBeNull();
    // 同名前缀不算数（sayless_anon_extra ≠ sayless_anon）
    expect(
      readAnonRawIdFromRequest(
        new Request("http://localhost/api/resumes", {
          headers: { cookie: `sayless_anon_extra=${uuid}` },
        }),
      ),
    ).toBeNull();
  });
});
