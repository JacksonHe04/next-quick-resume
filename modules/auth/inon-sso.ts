import { createInonSso } from "@inon-ai/inon-sso";

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for the iNon SSO client.`);
  }
  return value;
}

function publicOrigin(): string {
  return (
    process.env.INON_SSO_PUBLIC_ORIGIN ??
    (process.env.NODE_ENV === "production"
      ? "https://sayless.inon.space"
      : "http://localhost:3000")
  );
}

let client: ReturnType<typeof createInonSso> | undefined;

export function getInonProjectSso() {
  const appOrigin = publicOrigin();
  client ??= createInonSso({
    project: "sayless",
    clientId: requiredEnvironmentVariable("INON_SSO_CLIENT_ID"),
    clientSecret: requiredEnvironmentVariable("INON_SSO_CLIENT_SECRET"),
    sessionSecret: requiredEnvironmentVariable("INON_SSO_SESSION_SECRET"),
    appOrigin,
    secureCookies: appOrigin.startsWith("https://"),
  });
  return client;
}
