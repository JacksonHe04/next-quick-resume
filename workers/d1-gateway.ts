type D1GatewayEnvironment = {
  DB: D1Database;
  D1_GATEWAY_TOKEN: string;
};

type D1GatewayParameter = string | number | null;

type D1GatewayOperation = {
  sql: string;
  params: D1GatewayParameter[];
  method?: "run" | "all" | "first" | "raw";
  column?: string;
  columnNames?: boolean;
};

const MAX_BODY_BYTES = 1_000_000;
const MAX_SQL_LENGTH = 100_000;
const MAX_BATCH_SIZE = 100;

function json(value: unknown, status = 200): Response {
  return Response.json(value, {
    status,
    headers: {
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

function errorResponse(
  status: number,
  code: string,
  message: string,
): Response {
  return json({ error: { code, message } }, status);
}

async function tokensMatch(actual: string, expected: string) {
  const encoder = new TextEncoder();
  const [actualHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(actual)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const left = new Uint8Array(actualHash);
  const right = new Uint8Array(expectedHash);
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

async function isAuthorized(
  request: Request,
  environment: D1GatewayEnvironment,
) {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ", 2);
  if (scheme !== "Bearer" || !token || !environment.D1_GATEWAY_TOKEN) {
    return false;
  }
  return tokensMatch(token, environment.D1_GATEWAY_TOKEN);
}

function isParameter(value: unknown): value is D1GatewayParameter {
  return (
    value === null ||
    typeof value === "string" ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

function parseOperation(
  value: unknown,
  requireMethod: boolean,
): D1GatewayOperation | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const operation = value as Record<string, unknown>;
  if (
    typeof operation.sql !== "string" ||
    operation.sql.length === 0 ||
    operation.sql.length > MAX_SQL_LENGTH ||
    !Array.isArray(operation.params) ||
    !operation.params.every(isParameter)
  ) {
    return null;
  }
  const methods = ["run", "all", "first", "raw"];
  if (
    (requireMethod &&
      (typeof operation.method !== "string" ||
        !methods.includes(operation.method))) ||
    (!requireMethod &&
      operation.method !== undefined &&
      (typeof operation.method !== "string" ||
        !methods.includes(operation.method))) ||
    (operation.column !== undefined &&
      typeof operation.column !== "string") ||
    (operation.columnNames !== undefined &&
      typeof operation.columnNames !== "boolean")
  ) {
    return null;
  }

  return operation as D1GatewayOperation;
}

function prepare(
  environment: D1GatewayEnvironment,
  operation: D1GatewayOperation,
) {
  return environment.DB.prepare(operation.sql).bind(...operation.params);
}

async function executeSingle(
  environment: D1GatewayEnvironment,
  operation: D1GatewayOperation,
) {
  const statement = prepare(environment, operation);
  switch (operation.method) {
    case "run":
      return statement.run();
    case "all":
      return statement.all();
    case "first":
      return operation.column
        ? statement.first(operation.column)
        : statement.first();
    case "raw":
      return operation.columnNames
        ? statement.raw({ columnNames: true })
        : statement.raw();
    default:
      throw new Error("Unsupported D1 operation");
  }
}

export async function handleD1GatewayRequest(
  request: Request,
  environment: D1GatewayEnvironment,
): Promise<Response> {
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === "/health") {
    return json({ ok: true });
  }
  if (url.pathname !== "/v1/query" || request.method !== "POST") {
    return errorResponse(404, "NOT_FOUND", "Not found");
  }
  if (!(await isAuthorized(request, environment))) {
    return errorResponse(401, "UNAUTHORIZED", "Unauthorized");
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return errorResponse(413, "PAYLOAD_TOO_LARGE", "Payload too large");
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return errorResponse(400, "INVALID_REQUEST", "Invalid request");
    }

    if (body.operation !== undefined && body.batch === undefined) {
      const operation = parseOperation(body.operation, true);
      if (!operation) {
        return errorResponse(400, "INVALID_REQUEST", "Invalid request");
      }
      return json({ result: await executeSingle(environment, operation) });
    }

    if (
      Array.isArray(body.batch) &&
      body.operation === undefined &&
      body.batch.length > 0 &&
      body.batch.length <= MAX_BATCH_SIZE
    ) {
      const operations = body.batch.map((operation) =>
        parseOperation(operation, false),
      );
      if (operations.some((operation) => operation === null)) {
        return errorResponse(400, "INVALID_REQUEST", "Invalid request");
      }
      const statements = (operations as D1GatewayOperation[]).map(
        (operation) => prepare(environment, operation),
      );
      return json({ result: await environment.DB.batch(statements) });
    }

    return errorResponse(400, "INVALID_REQUEST", "Invalid request");
  } catch (error) {
    console.error("D1 gateway request failed", error);
    return errorResponse(500, "QUERY_FAILED", "Database request failed");
  }
}

export default {
  fetch: handleD1GatewayRequest,
} satisfies ExportedHandler<D1GatewayEnvironment>;
