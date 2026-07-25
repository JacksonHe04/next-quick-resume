import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

const normalizedEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("请输入有效的邮箱地址");

const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `密码至少需要 ${PASSWORD_MIN_LENGTH} 个字符`)
  .max(PASSWORD_MAX_LENGTH, `密码不能超过 ${PASSWORD_MAX_LENGTH} 个字符`);

export const requestVerificationCodeInputSchema = z.object({
  email: normalizedEmailSchema,
});

export const registerInputSchema = z.object({
  email: normalizedEmailSchema,
  code: z.string().regex(/^\d{6}$/u, "请输入 6 位邮箱验证码"),
  password: passwordSchema,
  name: z.string().trim().min(1, "请输入姓名").max(80, "姓名不能超过 80 个字符"),
});

export const loginInputSchema = z.object({
  email: normalizedEmailSchema,
  password: z.string().min(1, "请输入密码").max(PASSWORD_MAX_LENGTH),
});

export const forgotPasswordInputSchema = z.object({
  email: normalizedEmailSchema,
});

export const resetPasswordInputSchema = z.object({
  token: z.string().min(32),
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
