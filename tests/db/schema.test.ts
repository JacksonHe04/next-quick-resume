import { describe, expect, it } from "vitest";

import * as schema from "@/db/schema";

describe("database schema", () => {
  it("exports the user table required by every private domain", () => {
    expect(schema.users).toBeDefined();
  });
});
