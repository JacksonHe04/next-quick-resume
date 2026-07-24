export type AuthErrorCode =
  | "EMAIL_ALREADY_REGISTERED"
  | "INVALID_CREDENTIALS"
  | "INVALID_RESET_TOKEN"
  | "INVALID_VERIFICATION_CODE"
  | "RATE_LIMITED"
  | "EMAIL_DELIVERY_FAILED";

export class AuthError extends Error {
  constructor(
    public readonly code: AuthErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}
