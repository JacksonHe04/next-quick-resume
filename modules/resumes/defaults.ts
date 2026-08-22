import template from "@/data/resume-template-cn.json";
import type {
  ResumeData,
  ResumeDisplayConfig,
  ResumeDocumentV1,
} from "@/types";

export const defaultResumeDisplayConfig: ResumeDisplayConfig = {
  sections: [
    { key: "header", label: "个人信息", visible: true },
    { key: "education", label: "教育经历", visible: true },
    { key: "intern", label: "实习经历", visible: true },
    { key: "projects", label: "项目经历", visible: true },
    { key: "about", label: "关于我", visible: true },
  ],
  sectionOrder: [
    "header",
    "education",
    "intern",
    "projects",
    "about",
  ],
  headerAlignment: "left",
  photo: { showPhoto: false },
};

export function createDefaultResumeDocument(): ResumeDocumentV1 {
  return {
    schemaVersion: 1,
    data: structuredClone(template) as ResumeData,
    displayConfig: structuredClone(defaultResumeDisplayConfig),
  };
}
