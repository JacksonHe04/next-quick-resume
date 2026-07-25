type DevelopmentLoginEnvironment = {
  NODE_ENV?: string;
  SAYLESS_DEV_LOGIN_EMAIL?: string;
  SAYLESS_DEV_LOGIN_PASSWORD?: string;
};

export type DevelopmentLoginCredentials = {
  email: string;
  password: string;
};

export function getDevelopmentLoginCredentials(
  environment: DevelopmentLoginEnvironment = process.env,
): DevelopmentLoginCredentials | null {
  const email = environment.SAYLESS_DEV_LOGIN_EMAIL
    ?.trim()
    .toLowerCase();
  const password = environment.SAYLESS_DEV_LOGIN_PASSWORD;

  if (
    environment.NODE_ENV !== "development" ||
    !email ||
    !password
  ) {
    return null;
  }

  return { email, password };
}
