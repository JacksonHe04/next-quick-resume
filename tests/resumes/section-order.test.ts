import { describe, expect, it } from "vitest";

import { orderDataBySections } from "@/modules/resumes/section-order";
import type { ResumeData } from "@/types";

const data: ResumeData = {
  // 故意按“声明顺序”排列（about 在 education 前），模拟旧数据/类型声明顺序
  header: {
    name: "何锦诚",
    contact: { phone: "", email: "" },
    jobInfo: {},
  },
  about: { title: "关于我", content: "" },
  education: {
    title: "教育经历",
    school: "东南大学",
    entries: [{ period: "", details: "" }],
  },
};

describe("orderDataBySections", () => {
  it("orders data keys by the resume section order", () => {
    const ordered = orderDataBySections(data, [
      "header",
      "education",
      "about",
    ]);
    expect(Object.keys(ordered)).toEqual(["header", "education", "about"]);
  });

  it("follows the section order literally", () => {
    const ordered = orderDataBySections(data, [
      "about",
      "education",
      "header",
    ]);
    expect(Object.keys(ordered)).toEqual(["about", "education", "header"]);
  });

  it("appends keys missing from the section order at the end", () => {
    const ordered = orderDataBySections(data, ["header"]);
    expect(Object.keys(ordered)).toEqual([
      "header",
      "about",
      "education",
    ]);
  });
});
