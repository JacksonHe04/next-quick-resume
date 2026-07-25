import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createRemoteD1Binding } from "@/db/remote-d1-binding";
import * as schema from "@/db/schema";
import { officialCompanies } from "@/db/schema";
import { handleD1GatewayRequest } from "@/workers/d1-gateway";
import { createTestD1Binding } from "@/tests/db/d1-test-binding";

describe("remote D1 binding", () => {
  let close: () => void;
  let localBinding: D1Database;

  beforeEach(() => {
    const testDatabase = createTestD1Binding();
    close = testDatabase.close;
    localBinding = testDatabase.binding;
  });

  afterEach(() => close());

  function createBinding(token = "gateway-test-token") {
    return createRemoteD1Binding({
      url: "https://database.sayless.test",
      token,
      fetcher: (input, init) =>
        handleD1GatewayRequest(new Request(input, init), {
          DB: localBinding,
          D1_GATEWAY_TOKEN: "gateway-test-token",
        }),
    });
  }

  it("supports Drizzle reads and writes through the Worker boundary", async () => {
    const database = drizzle(createBinding(), { schema });

    await database
      .insert(officialCompanies)
      .values({
        id: "company-test",
        name: "测试公司",
        normalizedName: "测试公司",
        createdAt: new Date("2026-07-25T00:00:00.000Z"),
        updatedAt: new Date("2026-07-25T00:00:00.000Z"),
      })
      .run();

    await expect(
      database
        .select()
        .from(officialCompanies)
        .where(eq(officialCompanies.id, "company-test")),
    ).resolves.toEqual([
      expect.objectContaining({
        id: "company-test",
        name: "测试公司",
      }),
    ]);
  });

  it("supports D1 batches and preserves result order", async () => {
    const database = drizzle(createBinding(), { schema });

    const result = await database.batch([
      database
        .insert(officialCompanies)
        .values({
          id: "company-batch",
          name: "批量公司",
          normalizedName: "批量公司",
          createdAt: new Date("2026-07-25T00:00:00.000Z"),
          updatedAt: new Date("2026-07-25T00:00:00.000Z"),
        }),
      database
        .select({ name: officialCompanies.name })
        .from(officialCompanies)
        .where(eq(officialCompanies.id, "company-batch")),
    ]);

    expect(result[0]).toMatchObject({ success: true });
    expect(result[1]).toEqual([{ name: "批量公司" }]);
  });

  it("preserves an invalid gateway token response as the query error cause", async () => {
    const database = drizzle(createBinding("wrong-token"), { schema });

    await expect(
      database.select().from(officialCompanies),
    ).rejects.toMatchObject({
      cause: {
        message: "D1 gateway request failed (401)",
      },
    });
  });
});
