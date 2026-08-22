export const MAX_RESUME_PHOTO_SIZE_MB = 10;
export const MAX_RESUME_PHOTO_SIZE_BYTES =
  MAX_RESUME_PHOTO_SIZE_MB * 1024 * 1024;

// 压缩后最长边（像素）。头像尺寸足够小，能显著减小 base64 体积
export const MAX_RESUME_PHOTO_DIMENSION = 1024;

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

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("图片解码失败，请换一张图片"));
    image.src = source;
  });
}

/**
 * 把图片压缩为 JPEG data URL（最长边不超过 MAX_RESUME_PHOTO_DIMENSION）。
 * 压缩后的体积远小于原图，保证上传体量可控、云端落库成功。
 */
export async function compressResumePhoto(
  file: File,
): Promise<string> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("读取图片失败"));
    reader.readAsDataURL(file);
  });

  let image: HTMLImageElement;
  try {
    image = await loadImage(rawDataUrl);
  } catch {
    // 无法解码时退回原图，由服务端体积校验兜底
    return rawDataUrl;
  }

  const scale = Math.min(
    1,
    MAX_RESUME_PHOTO_DIMENSION / Math.max(image.width, image.height),
  );
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return rawDataUrl;
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.82);
}
