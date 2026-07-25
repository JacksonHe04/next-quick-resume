import { describe, expect, it, vi } from "vitest";

import { handleD1GatewayRequest } from "@/workers/d1-gateway";

function createEnvironment(binding: Partial<D1Database> = {}) {
  return {
    DB: binding as D1Database,
    D1_GATEWAY_TOKEN: "worker-secret",
  };
}

describe("D1 gateway Worker", () => {
  it("exposes a public health check without database details", async () => {
    const response = await handleD1GatewayRequest(
      new Request("https://api.sayless.test/health"),
      createEnvironment(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("requires the service token for database operations", async () => {
    const prepare = vi.fn();
    const response = await handleD1GatewayRequest(
      new Request("https://api.sayless.test/v1/query", {
        method: "POST",
        body: JSON.stringify({
          operation: { sql: "SELECT secret FROM users", params: [] },
        }),
      }),
      createEnvironment({ prepare }),
    );

    expect(response.status).toBe(401);
    expect(prepare).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: { code: "UNAUTHORIZED", message: "Unauthorized" },
    });
  });

  it("binds parameters and returns a prepared statement result", async () => {
    const all = vi.fn().mockResolvedValue({
      success: true,
      results: [{ id: "company-openai" }],
      meta: {},
    });
    const bind = vi.fn().mockReturnValue({ all });
    const prepare = vi.fn().mockReturnValue({ bind });
    const response = await handleD1GatewayRequest(
      new Request("https://api.sayless.test/v1/query", {
        method: "POST",
        headers: {
          authorization: "Bearer worker-secret",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          operation: {
            sql: "SELECT id FROM companies WHERE id = ?",
            params: ["company-openai"],
            method: "all",
          },
        }),
      }),
      createEnvironment({ prepare }),
    );

    expect(response.status).toBe(200);
    expect(prepare).toHaveBeenCalledWith(
      "SELECT id FROM companies WHERE id = ?",
    );
    expect(bind).toHaveBeenCalledWith("company-openai");
    expect(all).toHaveBeenCalledOnce();
    await expect(response.json()).resolves.toEqual({
      result: {
        success: true,
        results: [{ id: "company-openai" }],
        meta: {},
      },
    });
  });

  it("uses an atomic D1 batch for multiple statements", async () => {
    const statements = [{ name: "first" }, { name: "second" }];
    const prepare = vi
      .fn()
      .mockReturnValueOnce({
        bind: vi.fn().mockReturnValue(statements[0]),
      })
      .mockReturnValueOnce({
        bind: vi.fn().mockReturnValue(statements[1]),
      });
    const batch = vi.fn().mockResolvedValue([
      { success: true, results: [], meta: { changes: 1 } },
      { success: true, results: [{ id: "two" }], meta: {} },
    ]);
    const response = await handleD1GatewayRequest(
      new Request("https://api.sayless.test/v1/query", {
        method: "POST",
        headers: {
          authorization: "Bearer worker-secret",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          batch: [
            { sql: "INSERT INTO things VALUES (?)", params: ["one"] },
            { sql: "SELECT id FROM things", params: [] },
          ],
        }),
      }),
      createEnvironment({ prepare, batch }),
    );

    expect(response.status).toBe(200);
    expect(batch).toHaveBeenCalledWith(statements);
    await expect(response.json()).resolves.toEqual({
      result: [
        { success: true, results: [], meta: { changes: 1 } },
        { success: true, results: [{ id: "two" }], meta: {} },
      ],
    });
  });

  it("rejects malformed operations before preparing SQL", async () => {
    const prepare = vi.fn();
    const response = await handleD1GatewayRequest(
      new Request("https://api.sayless.test/v1/query", {
        method: "POST",
        headers: {
          authorization: "Bearer worker-secret",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          operation: { sql: "", params: [{ unsafe: true }] },
        }),
      }),
      createEnvironment({ prepare }),
    );

    expect(response.status).toBe(400);
    expect(prepare).not.toHaveBeenCalled();
  });
});
