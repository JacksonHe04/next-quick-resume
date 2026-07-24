import {
  base64UrlToBytes,
  bytesToBase64Url,
  constantTimeEqual,
} from "@/modules/auth/encoding";

async function signValue(value: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );

  return new Uint8Array(signature);
}

export async function hashKeyedValue(
  value: string,
  secret: string,
): Promise<string> {
  return bytesToBase64Url(await signValue(value, secret));
}

export async function verifyKeyedValue(
  value: string,
  encodedHash: string,
  secret: string,
): Promise<boolean> {
  try {
    return constantTimeEqual(
      await signValue(value, secret),
      base64UrlToBytes(encodedHash),
    );
  } catch {
    return false;
  }
}
