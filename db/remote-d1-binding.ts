type GatewayParameter = string | number | null;

type GatewayOperation = {
  sql: string;
  params: GatewayParameter[];
  method?: "run" | "all" | "first" | "raw";
  column?: string;
  columnNames?: boolean;
};

type GatewaySuccess = {
  result: unknown;
};

type RemoteD1BindingOptions = {
  url: string;
  token: string;
  fetcher?: typeof fetch;
  maxRetries?: number;
  timeoutMs?: number;
  onRetry?: (info: {
    attempt: number;
    maxRetries: number;
    delayMs: number;
    error: unknown;
  }) => void;
};

// Network error codes worth retrying. Persistent HTTP failures (4xx/5xx) are
// not retried here — the gateway already surfaces those to the caller.
const TRANSIENT_ERROR_CODES = new Set([
  "ECONNRESET",
  "ETIMEDOUT",
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "EPIPE",
  "UND_ERR_SOCKET",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_BODY_TIMEOUT",
]);

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_TIMEOUT_MS = 8_000;
const BACKOFF_BASE_MS = 100;
const BACKOFF_FACTOR = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: unknown }).code;
  if (typeof code === "string" && TRANSIENT_ERROR_CODES.has(code)) return true;
  // Node 18+ wraps undici socket failures as TypeError("fetch failed").
  if (
    error instanceof TypeError &&
    /fetch failed/i.test(error.message)
  ) {
    return true;
  }
  return false;
}

function backoffDelayMs(attempt: number): number {
  // attempt 0 -> ~100ms, attempt 1 -> ~300ms, attempt 2 -> ~900ms
  return BACKOFF_BASE_MS * BACKOFF_FACTOR ** attempt;
}

class RemoteD1Client {
  private readonly endpoint: string;
  private readonly token: string;
  private readonly fetcher: typeof fetch;
  private readonly maxRetries: number;
  private readonly timeoutMs: number;
  private readonly onRetry: NonNullable<RemoteD1BindingOptions["onRetry"]>;

  constructor({
    url,
    token,
    fetcher = fetch,
    maxRetries = DEFAULT_MAX_RETRIES,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    onRetry,
  }: RemoteD1BindingOptions) {
    this.endpoint = `${url.replace(/\/+$/, "")}/v1/query`;
    this.token = token;
    this.fetcher = fetcher;
    this.maxRetries = Math.max(0, maxRetries);
    this.timeoutMs = Math.max(1, timeoutMs);
    this.onRetry =
      onRetry ??
      ((info) => {
        const reason =
          info.error instanceof Error
            ? (info.error as { code?: string }).code ??
              info.error.name ??
              info.error.message
            : String(info.error);
        console.warn(
          `[remote-d1] retry ${info.attempt + 1}/${info.maxRetries} after ${info.delayMs}ms (${reason})`,
        );
      });
  }

  prepare(sql: string) {
    return new RemoteD1Statement(this, sql);
  }

  async batch(statements: RemoteD1Statement[]) {
    return this.request({
      batch: statements.map((statement) => statement.operation()),
    });
  }

  async execute(operation: GatewayOperation) {
    return this.request({ operation });
  }

  private async request(body: {
    operation?: GatewayOperation;
    batch?: GatewayOperation[];
  }) {
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const response = await this.fetcher(this.endpoint, {
          method: "POST",
          headers: {
            authorization: `Bearer ${this.token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify(body),
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`D1 gateway request failed (${response.status})`);
        }

        const payload = (await response.json()) as GatewaySuccess;
        return payload.result;
      } catch (error) {
        lastError = error;
        const transient = isTransientError(error);
        const abortedByTimeout =
          error instanceof Error && error.name === "AbortError";
        if (abortedByTimeout) {
          lastError = new Error(
            `D1 gateway request timed out after ${this.timeoutMs}ms`,
          );
        }
        if (!transient || attempt === this.maxRetries) {
          throw lastError;
        }
        const delayMs = backoffDelayMs(attempt);
        this.onRetry({
          attempt,
          maxRetries: this.maxRetries,
          delayMs,
          error: lastError,
        });
        await sleep(delayMs);
      } finally {
        clearTimeout(timer);
      }
    }
    throw lastError;
  }
}

class RemoteD1Statement {
  private parameters: GatewayParameter[] = [];

  constructor(
    private readonly client: RemoteD1Client,
    private readonly sql: string,
  ) {}

  bind(...parameters: unknown[]) {
    const statement = new RemoteD1Statement(this.client, this.sql);
    statement.parameters = parameters as GatewayParameter[];
    return statement;
  }

  operation(
    method?: GatewayOperation["method"],
    options: Pick<GatewayOperation, "column" | "columnNames"> = {},
  ): GatewayOperation {
    return {
      sql: this.sql,
      params: this.parameters,
      ...(method ? { method } : {}),
      ...options,
    };
  }

  async run() {
    return this.client.execute(this.operation("run"));
  }

  async all() {
    return this.client.execute(this.operation("all"));
  }

  async first(column?: string) {
    return this.client.execute(this.operation("first", { column }));
  }

  async raw(options?: { columnNames?: boolean }) {
    return this.client.execute(
      this.operation("raw", {
        columnNames: options?.columnNames,
      }),
    );
  }
}

export function createRemoteD1Binding(
  options: RemoteD1BindingOptions,
): D1Database {
  const client = new RemoteD1Client(options);

  return {
    prepare: (sql: string) => client.prepare(sql),
    batch: (statements: D1PreparedStatement[]) =>
      client.batch(statements as unknown as RemoteD1Statement[]),
  } as unknown as D1Database;
}
