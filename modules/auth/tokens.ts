import { bytesToBase64Url } from "@/modules/auth/encoding";

export function createOpaqueToken(byteLength = 32): string {
  return bytesToBase64Url(
    crypto.getRandomValues(new Uint8Array(byteLength)),
  );
}

export async function hashOpaqueToken(rawToken: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(rawToken),
  );

  return bytesToBase64Url(new Uint8Array(digest));
}
