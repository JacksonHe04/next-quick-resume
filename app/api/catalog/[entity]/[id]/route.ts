import { NextResponse } from "next/server";

import {
  catalogErrorResponse,
  getCatalogActionContext,
  unauthenticatedResponse,
} from "@/modules/catalog/actions";
import { catalogEntitySchema } from "@/modules/catalog/schemas";
import { renamePrivateCatalogEntry } from "@/modules/catalog/service";

export async function PATCH(
  request: Request,
  {
    params,
  }: { params: Promise<{ entity: string; id: string }> },
) {
  try {
    const context = await getCatalogActionContext(request);
    if (!context) return unauthenticatedResponse();
    const { entity, id } = await params;
    await renamePrivateCatalogEntry(
      context.repository,
      context.user.id,
      catalogEntitySchema.parse(entity),
      id,
      await request.json(),
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return catalogErrorResponse(error);
  }
}
