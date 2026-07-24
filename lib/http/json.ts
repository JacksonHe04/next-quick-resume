import type { z } from "zod";

export async function readJson<TSchema extends z.ZodTypeAny>(
  request: Pick<Request, "json">,
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  return schema.parse(await request.json());
}
