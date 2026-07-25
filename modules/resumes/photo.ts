export const MAX_RESUME_PHOTO_SIZE_MB = 10;
export const MAX_RESUME_PHOTO_SIZE_BYTES =
  MAX_RESUME_PHOTO_SIZE_MB * 1024 * 1024;

type ResumePhotoFile = Pick<File, "size" | "type">;

export function getResumePhotoValidationError(
  file: ResumePhotoFile,
): string | undefined {
  if (!file.type.startsWith("image/")) {
    return "请选择 JPG、PNG 或 WebP 图片";
  }
  if (file.size > MAX_RESUME_PHOTO_SIZE_BYTES) {
    return `头像不能超过 ${MAX_RESUME_PHOTO_SIZE_MB} MB`;
  }
}
