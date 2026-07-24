import { createNodeD1Binding } from "@/db/node-d1-binding";

export function createTestD1Binding() {
  return createNodeD1Binding({ migrate: true });
}
