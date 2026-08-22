import { z } from "zod";

import type { ResumeDocumentV1 } from "@/types";

const optionalText = z.string().optional();

const contactSchema = z.object({
  phone: z.string(),
  email: z.string(),
  wechat: optionalText,
  age: optionalText,
  github: z
    .object({ text: z.string(), url: z.string() })
    .optional(),
  homepage: z
    .object({ text: z.string(), url: z.string() })
    .optional(),
});

const educationEntrySchema = z.object({
  period: z.string(),
  details: z.string(),
});

// 新版教育经历：学校信息 + 多段学历条目
const educationItemSchema = z.object({
  school: z.string(),
  base: optionalText,
  image: optionalText,
  entries: z.array(educationEntrySchema),
});

// 兼容旧版：period 和 details 在顶层
const legacyEducationItemSchema = z.object({
  school: z.string(),
  base: optionalText,
  period: z.string(),
  details: z.string(),
  image: optionalText,
});

// 接受两种格式，统一转换为新版格式
const normalizedEducationItemSchema = z.union([
  educationItemSchema,
  legacyEducationItemSchema.transform((item) => ({
    school: item.school,
    base: item.base,
    image: item.image,
    entries: [{ period: item.period, details: item.details }],
  })),
]);

const resumeDataSchema = z.object({
  header: z.object({
    name: z.string(),
    contact: contactSchema,
    jobInfo: z.object({
      position: optionalText,
    }),
  }),
  about: z
    .object({
      title: z.string(),
      content: z.string(),
    })
    .optional(),
  education: z
    .object({
      title: z.string(),
      school: z.string(),
      base: optionalText,
      period: z.string().optional(),
      details: z.string().optional(),
      image: optionalText,
      entries: z.array(educationEntrySchema).optional(),
      items: z.array(normalizedEducationItemSchema).optional(),
    })
    .optional(),
  skills: z
    .object({
      title: z.string(),
      items: z.array(z.string()),
    })
    .optional(),
  intern: z
    .object({
      title: z.string(),
      items: z.array(
        z.object({
          company: z.string(),
          position: z.string(),
          period: z.string(),
          base: z.string(),
          description: z.string(),
          responsibilities: z.array(z.string()),
          show: z.boolean().optional(),
          image: optionalText,
        }),
      ),
    })
    .optional(),
  projects: z
    .object({
      title: z.string(),
      items: z.array(
        z.object({
          name: z.string(),
          github: z.string(),
          demo: optionalText,
          techStack: optionalText,
          description: z.string(),
          features: z.array(z.string()),
          show: z.boolean().optional(),
        }),
      ),
    })
    .optional(),
});

const sectionKeySchema = z.enum([
  "header",
  "education",
  "intern",
  "projects",
  "skills",
  "about",
]);

const displayConfigSchema = z.object({
  sections: z.array(
    z.object({
      key: sectionKeySchema,
      label: z.string(),
      visible: z.boolean(),
    }),
  ),
  sectionOrder: z.array(sectionKeySchema),
  headerAlignment: z.enum(["left", "center"]),
  photo: z.object({
    showPhoto: z.boolean(),
    photoData: optionalText,
  }),
});

export const resumeDocumentV1Schema = z.object({
  schemaVersion: z.literal(1),
  data: resumeDataSchema,
  displayConfig: displayConfigSchema,
}) as unknown as z.ZodType<ResumeDocumentV1>;

export const createResumeInputSchema = z.object({
  name: z.string().trim().min(1, "请输入简历名称").max(120),
  document: resumeDocumentV1Schema,
});

export const saveResumeInputSchema = createResumeInputSchema.extend({
  id: z.string().min(1),
  version: z.number().int().positive(),
});
