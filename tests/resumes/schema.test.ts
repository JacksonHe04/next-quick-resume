import { describe, expect, it } from "vitest";

import { resumeDocumentV1Schema } from "@/modules/resumes/schema";

describe("resume document schema", () => {
  it("accepts the existing resume data and display configuration", () => {
    const document = resumeDocumentV1Schema.parse({
      schemaVersion: 1,
      data: {
        header: {
          name: "何锦诚",
          contact: {
            phone: "13800000000",
            email: "hello@example.com",
          },
          jobInfo: { position: "产品经理" },
        },
        projects: {
          title: "项目经历",
          items: [
            {
              name: "SAYLESS",
              github: "https://example.com",
              description: "求职管理平台",
              features: ["全链路管理"],
            },
          ],
        },
      },
      displayConfig: {
        sections: [
          { key: "header", label: "基本信息", visible: true },
        ],
        sectionOrder: ["header"],
        headerAlignment: "left",
        photo: { showPhoto: false },
      },
    });

    expect(document.schemaVersion).toBe(1);
    expect(document.data.header.name).toBe("何锦诚");
  });

  it("rejects an unsupported schema version", () => {
    expect(() =>
      resumeDocumentV1Schema.parse({
        schemaVersion: 2,
        data: {},
        displayConfig: {},
      }),
    ).toThrow();
  });

  it("drops the removed header button from legacy documents", () => {
    const document = resumeDocumentV1Schema.parse({
      schemaVersion: 1,
      data: {
        header: {
          name: "何锦诚",
          contact: { phone: "", email: "" },
          jobInfo: {},
        },
      },
      displayConfig: {
        sections: [
          { key: "header", label: "基本信息", visible: true },
        ],
        sectionOrder: ["header"],
        headerAlignment: "left",
        photo: { showPhoto: false },
        headerButton: {
          enabled: true,
          text: "已移除的按钮",
          url: "https://example.com",
        },
      },
    });

    expect(document.displayConfig).not.toHaveProperty("headerButton");
  });
});
