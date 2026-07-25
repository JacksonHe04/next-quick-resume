import { describe, expect, it } from "vitest";

import {
  getResumePhotoValidationError,
  MAX_RESUME_PHOTO_SIZE_BYTES,
} from "@/modules/resumes/photo";

describe("resume photo validation", () => {
  it("accepts an image whose size is exactly 10 MB", () => {
    expect(
      getResumePhotoValidationError({
        type: "image/jpeg",
        size: MAX_RESUME_PHOTO_SIZE_BYTES,
      }),
    ).toBeUndefined();
  });

  it("rejects an image larger than 10 MB", () => {
    expect(
      getResumePhotoValidationError({
        type: "image/png",
        size: MAX_RESUME_PHOTO_SIZE_BYTES + 1,
      }),
    ).toBe("头像不能超过 10 MB");
  });

  it("continues to reject non-image files", () => {
    expect(
      getResumePhotoValidationError({
        type: "application/pdf",
        size: 1024,
      }),
    ).toBe("请选择 JPG、PNG 或 WebP 图片");
  });
});
