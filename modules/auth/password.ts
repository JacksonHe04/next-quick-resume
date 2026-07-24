import {
  base64UrlToBytes,
  bytesToBase64Url,
  constantTimeEqual,
} from "@/modules/auth/encoding";

const ALGORITHM = "pbkdf2-sha256";
const ITERATIONS = 600_000;
const SALT_LENGTH = 16;
const HASH_LENGTH_BITS = 256;

async function derivePassword(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      iterations,
      salt: salt.buffer as ArrayBuffer,
    },
    key,
    HASH_LENGTH_BITS,
  );

  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const hash = await derivePassword(password, salt, ITERATIONS);

  return [
    ALGORITHM,
    ITERATIONS.toString(),
    bytesToBase64Url(salt),
    bytesToBase64Url(hash),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  encoded: string,
): Promise<boolean> {
  const [algorithm, iterationsValue, saltValue, hashValue, ...extra] =
    encoded.split("$");
  const iterations = Number.parseInt(iterationsValue ?? "", 10);

  if (
    algorithm !== ALGORITHM ||
    !Number.isSafeInteger(iterations) ||
    iterations < 1 ||
    !saltValue ||
    !hashValue ||
    extra.length > 0
  ) {
    return false;
  }

  try {
    const expected = base64UrlToBytes(hashValue);
    const actual = await derivePassword(
      password,
      base64UrlToBytes(saltValue),
      iterations,
    );

    return constantTimeEqual(actual, expected);
  } catch {
    return false;
  }
}
