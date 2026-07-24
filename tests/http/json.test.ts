import { describe, expect, it } from "vitest";
import { z } from "zod";

import { readJson } from "@/lib/http/json";

const payloadSchema = z.object({
  name: z.string().min(1),
});

describe("readJson", () => {
  it("returns a typed value when the request body matches the schema", async () => {
    const request = new Request("https://sayless.app/api/test", {
      method: "POST",
      body: JSON.stringify({ name: "SAYLESS" }),
      headers: { "content-type": "application/json" },
    });

    await expect(readJson(request, payloadSchema)).resolves.toEqual({
      name: "SAYLESS",
    });
  });

  it("rejects JSON values that do not satisfy the schema", async () => {
    const request = new Request("https://sayless.app/api/test", {
      method: "POST",
      body: JSON.stringify({ name: "" }),
      headers: { "content-type": "application/json" },
    });

    await expect(readJson(request, payloadSchema)).rejects.toMatchObject({
      name: "ZodError",
    });
  });
});
