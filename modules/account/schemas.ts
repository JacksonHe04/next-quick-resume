import { z } from "zod";

import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/modules/auth/schemas";

const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `密码至少需要 ${PASSWORD_MIN_LENGTH} 个字符`)
  .max(PASSWORD_MAX_LENGTH, `密码不能超过 ${PASSWORD_MAX_LENGTH} 个字符`);

export const updateProfileInputSchema = z.object({
  name: z.string().trim().min(1, "请输入姓名").max(80, "姓名不能超过 80 个字符"),
});

export const changePasswordInputSchema = z.object({
  currentPassword: z.string().min(1, "请输入当前密码"),
  newPassword: passwordSchema,
});

export const deleteAccountInputSchema = z.object({
  password: z.string().min(1, "请输入当前密码"),
});
