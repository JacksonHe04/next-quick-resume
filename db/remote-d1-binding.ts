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
};

class RemoteD1Client {
  private readonly endpoint: string;
  private readonly token: string;
  private readonly fetcher: typeof fetch;

  constructor({ url, token, fetcher = fetch }: RemoteD1BindingOptions) {
    this.endpoint = `${url.replace(/\/+$/, "")}/v1/query`;
    this.token = token;
    this.fetcher = fetcher;
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
    const response = await this.fetcher(this.endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`D1 gateway request failed (${response.status})`);
    }

    const payload = (await response.json()) as GatewaySuccess;
    return payload.result;
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
