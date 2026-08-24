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

const educationItemSchema = z.object({
  school: z.string(),
  base: optionalText,
  image: optionalText,
  entries: z.array(educationEntrySchema).default([]),
});

// 旧版教育经历：period/details 散落在 section 顶层
const legacyEducationSectionSchema = z
  .object({
    title: z.string(),
    school: z.string(),
    base: optionalText,
    period: optionalText,
    details: optionalText,
    image: optionalText,
    entries: z.array(educationEntrySchema).optional(),
  })
  .transform((section) => ({
    title: section.title,
    items: [
      {
        school: section.school,
        base: section.base,
        image: section.image,
        entries:
          section.entries && section.entries.length > 0
            ? section.entries
            : section.period || section.details
              ? [{ period: section.period ?? "", details: section.details ?? "" }]
              : [],
      },
    ],
  }));

const educationSectionSchema = z.union([
  z
    .object({
      title: z.string(),
      items: z.array(educationItemSchema),
    })
    .passthrough(),
  legacyEducationSectionSchema,
]);

// 关于我：新数据为要点数组，旧数据为换行字符串
const aboutPointsSchema = z.union([
  z.array(z.string()),
  z.string().transform((value) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  ),
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
      content: aboutPointsSchema,
    })
    .optional(),
  education: educationSectionSchema.optional(),
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
          responsibilities: z.array(z.string()).default([]),
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
          github: z.string().default(""),
          demo: optionalText,
          description: z.string(),
          features: z.array(z.string()).default([]),
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
