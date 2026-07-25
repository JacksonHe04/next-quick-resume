import { NextResponse } from "next/server";

import { getReadDatabaseContext } from "@/modules/auth/action-context";
import {
  catalogErrorResponse,
  getCatalogActionContext,
  unauthenticatedResponse,
} from "@/modules/catalog/actions";
import {
  catalogEntitySchema,
  searchCatalogInputSchema,
} from "@/modules/catalog/schemas";
import { createCatalogRepository } from "@/modules/catalog/repository";
import {
  createPrivateCatalogEntry,
  searchCatalog,
} from "@/modules/catalog/service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ entity: string }> },
) {
  try {
    const context = await getReadDatabaseContext(request);
    const entity = catalogEntitySchema.parse((await params).entity);
    const { query } = searchCatalogInputSchema.parse({
      query: new URL(request.url).searchParams.get("q") ?? "",
    });
    const options = await searchCatalog(
      createCatalogRepository(context.database),
      context.userId,
      entity,
      query,
    );
    return NextResponse.json({ options });
  } catch (error) {
    return catalogErrorResponse(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ entity: string }> },
) {
  try {
    const context = await getCatalogActionContext(request);
    if (!context) return unauthenticatedResponse();
    const entity = catalogEntitySchema.parse((await params).entity);
    const option = await createPrivateCatalogEntry(
      context.repository,
      context.user.id,
      entity,
      await request.json(),
    );
    return NextResponse.json({ option }, { status: 201 });
  } catch (error) {
    return catalogErrorResponse(error);
  }
}
